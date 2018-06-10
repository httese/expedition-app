import {SettingsType, MultiplayerState} from '../../../../../reducers/StateTypes'
import {PLAYER_TIME_MULT} from '../../../../../Constants'
import {Decision, Outcome, DIFFICULTIES, SKILL_TYPES, PERSONA_TYPES} from './Types'
/*
import {toCard} from '../../../../../actions/Card'
DecisionState
AppStateWithHistory
import Redux from 'redux'
import {remoteify, QuestNodeAction} from '../../../../../actions/ActionTypes'
import {audioSet} from '../../../../../actions/Audio'
import {ParserNode} from '../TemplateTypes'
*/

const NUM_SKILL_CHECK_CHOICES = 3;
// Generate 3 random combinations of difficulty, skill, and persona.
// Only 2 of the 3 fields will be available.
export function generateDecisions(rng: () => number): Decision[] {
  const result: Decision[] = [];
  // TODO Make less dumb
  const selection = [[0,1,1], [1,0,1]][Math.floor(rng() * 2)];

  while (result.length < NUM_SKILL_CHECK_CHOICES) {
    const gen = {
      difficulty: (selection[0]) ? DIFFICULTIES[Math.floor(rng() * DIFFICULTIES.length)] : null,
      persona: (selection[1]) ? PERSONA_TYPES[Math.floor(rng() * PERSONA_TYPES.length)] : null,
      skill: SKILL_TYPES[Math.floor(rng() * SKILL_TYPES.length)],
    };

    // Throw the generated one away if it exactly matches a result we've already generated
    for (const r of result) {
      if (r.difficulty === gen.difficulty && r.persona === gen.persona && r.skill === gen.skill) {
        continue;
      }
    }
    result.push(gen);
  }
  return result;
}

export function resolveDecision(d: Decision, rng: () => number): Outcome {
  // TODO: factor in over-time hardness increase
  return {title: '', text: '', instructions: []};
}

// TODO DEDUPE
function numLocalAndMultiplayerPlayers(settings: SettingsType, rp?: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    return settings.numPlayers;
  }

  let count = 0;
  for (const c of Object.keys(rp.clientStatus)) {
    const status = rp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.numPlayers || 1);
  }
  return count || 1;
}

export function roundTimeMillis(settings: SettingsType, rp?: MultiplayerState) {
  const totalPlayerCount = numLocalAndMultiplayerPlayers(settings, rp);
  return settings.timerSeconds * 1000 * PLAYER_TIME_MULT[totalPlayerCount];
}


/*
interface HandleDecisionStartArgs {
  settings?: SettingsType;
}
export const handleDecisionStart = remoteify(function handleDecisionStart(a: HandleDecisionStartArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  console.log('handling combat decision start');
  if (!a.settings) {
    a.settings = getState().settings;
  }
  dispatch(toCard({name: 'QUEST_CARD', phase: 'DECISION_TIMER'}));
  dispatch(audioSet({peakIntensity: 1}));
  return {};
});

interface HandleDecisionArgs {
  node?: ParserNode;
  settings?: SettingsType;
  elapsedMillis: number;
  decision: Decision;
  seed: string;
}
export const handleDecision = remoteify(function handleDecision(a: HandleDecisionArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleDecisionArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  a.node = a.node.clone();
  let decision = a.node.ctx.templates.decision;
  if (!decision) {
    a.node.ctx.templates.decision = {};
  }
  decision.chosen = a.decision;
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase:'ROLL_DECISION'}));

  return {
    elapsedMillis: a.elapsedMillis,
    decision: a.decision,
    seed: a.seed
  };
});

interface HandleDecisionRollArgs {
  node?: ParserNode;
  settings?: SettingsType;
  decision: Decision;
  success: boolean;
  seed: string;
}
export const handleDecisionRoll = remoteify(function handleDecisionRoll(a: HandleDecisionRollArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleDecisionRollArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  a.node = a.node.clone();
  let decision = a.node.ctx.templates.decision;
  if (!decision) {
    a.node.ctx.templates.decision = {};
  }
  decision.outcome = a.success;
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase:'RESOLVE_DECISION'}));

  return {
    decision: a.decision,
    success: a.success,
    seed: a.seed
  };
});
*/
