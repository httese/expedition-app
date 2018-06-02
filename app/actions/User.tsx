import Redux from 'redux'
import * as Raven from 'raven-js'
import {handleFetchErrors, fetchUserQuests} from './Web'
import {openSnackbar} from './Snackbar'
import {UserState} from '../reducers/StateTypes'
import {loggedOutUser} from '../reducers/User'
import {AUTH_SETTINGS} from '../Constants'
import {getGA, getGapi} from '../Globals'

declare var gapi: any;
declare var window: any;

export type UserLoginCallback = (user: UserState, err?: string) => any;

function loadGapi(callback: (gapi: any, async: boolean) => void) {
  const gapi = getGapi();
  if (!gapi) {
    return;
  }
  if (window.gapiLoaded) {
    return callback(gapi, false);
  }

  gapi.load('client:auth2', () => {
    gapi.client.setApiKey(AUTH_SETTINGS.API_KEY);
    gapi.auth2.init({
      client_id: AUTH_SETTINGS.CLIENT_ID,
      scope: AUTH_SETTINGS.SCOPES,
      cookie_policy: 'none',
    }).then(() => {
      window.gapiLoaded = true;
      return callback(gapi, true);
    });
  });
}

function registerUserAndIdToken(user: {name: string, image: string, email: string}, idToken: string, callback: UserLoginCallback) {
  fetch(AUTH_SETTINGS.URL_BASE + '/auth/google', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify({
      id_token: idToken,
      name: user.name,
      image: user.image,
      email: user.email,
    }),
  })
  .then(handleFetchErrors)
  .then((response: Response) => response.text())
  .then((userResult: string) => {
    let id = '';
    try {
      id = JSON.parse(userResult).id || userResult;
    } catch(err) {
      id = userResult;
    }
    if (getGA()) {
      getGA().set({ userId: id });
    }
    Raven.setUserContext({id});
    callback({
      loggedIn: true,
      id,
      name: user.name,
      image: user.image,
      email: user.email,
      quests: {}, // Requested separately; cleared for now since it's a new user
    });
  }).catch((error: Error) => {
    console.log('Request failed', error);
    callback(loggedOutUser, 'Error authenticating.');
  });
}

function loginWeb(callback: UserLoginCallback) {
  loadGapi((gapi, async) => {
    // Since this is a user action, we can't show pop-ups if we get sidetracked loading,
    // so we'll attempt a silent login instead. If that fails, their next attempt should be instant.
    if (async) {
      return silentLoginWeb(callback);
    }
    gapi.auth2.getAuthInstance().signIn({redirect_uri: 'postmessage'}).then((googleUser: any) => {
      const idToken: string = googleUser.getAuthResponse().id_token;
      const basicProfile: any = googleUser.getBasicProfile();
      registerUserAndIdToken({
        name: basicProfile.getName(),
        image: basicProfile.getImageUrl(),
        email: basicProfile.getEmail(),
      }, idToken, callback);
    });
  });
}

function silentLoginWeb(callback: UserLoginCallback) {
  loadGapi((gapi, async) => {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      const googleUser: any = gapi.auth2.getAuthInstance().currentUser.get();
      const idToken: string = googleUser.getAuthResponse().id_token;
      const basicProfile: any = googleUser.getBasicProfile();
      return registerUserAndIdToken({
        name: basicProfile.getName(),
        image: basicProfile.getImageUrl(),
        email: basicProfile.getEmail(),
      }, idToken, callback);
    }
    return callback(loggedOutUser);
  });
}

function silentLoginCordova(callback: UserLoginCallback) {
  if (!window.plugins || !window.plugins.googleplus) {
    return;
  }
  window.plugins.googleplus.trySilentLogin({
    scopes: AUTH_SETTINGS.SCOPES,
    webClientId: AUTH_SETTINGS.CLIENT_ID,
  }, (obj: any) => {
    registerUserAndIdToken({
      name: obj.displayName,
      image: obj.imageUrl,
      email: obj.email,
    }, obj.idToken, callback);
  }, (err: string) => {
    callback(loggedOutUser, err);
  });
}

function loginCordova(callback: UserLoginCallback) {
  window.plugins.googleplus.login({
    scopes: AUTH_SETTINGS.SCOPES,
    webClientId: AUTH_SETTINGS.CLIENT_ID,
  }, (obj: any) => {
    registerUserAndIdToken({
      name: obj.displayName,
      image: obj.imageUrl,
      email: obj.email,
    }, obj.idToken, callback);
  }, (err: string) => {
    callback(loggedOutUser, err);
  });
}

export function silentLogin(a: {callback?: (user: UserState) => void}, loginFunc = silentLoginWeb) {
  return (dispatch: Redux.Dispatch<any>) => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      // Since it's silent, do nothing with error
      dispatch({type: 'USER_LOGIN', user});
      a.callback && a.callback(user);
      dispatch(fetchUserQuests());
    };

    if (window.plugins && window.plugins.googleplus) {
      silentLoginCordova(loginCallback);
    } else {
      loginFunc(loginCallback);
    }
  };
}

export function login(a: {callback: (user: UserState) => any}, loginFunc = loginWeb) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const loginCallback: UserLoginCallback = (user: UserState, err?: string) => {
      if (err) {
        return dispatch(openSnackbar('Error logging in: ' + err));
      }
      dispatch({type: 'USER_LOGIN', user});
      a.callback(user);
      dispatch(fetchUserQuests());
    }

    if (window.plugins && window.plugins.googleplus) {
      loginCordova(loginCallback);
    } else {
      loginFunc(loginCallback);
    }
  };
}
