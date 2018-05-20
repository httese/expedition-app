import Redux from 'redux'
import {AudioSetAction} from '../actions/ActionTypes'
import {AudioState} from './StateTypes'

const initialState: AudioState = {
  loaded: false,
  paused: false,
  intensity: 0,
  peakIntensity: 0,
  sfx: null,
  timestamp: 0,
};

export function audio(state: AudioState = initialState, action: Redux.Action): AudioState {
  switch(action.type) {
    case 'AUDIO_SET':
      return {...state, ...(action as AudioSetAction).changes};
    default:
      return state;
  }
}
