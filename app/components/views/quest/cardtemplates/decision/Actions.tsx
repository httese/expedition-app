import {SettingsType, MultiplayerState, AppStateWithHistory} from '../../../../../reducers/StateTypes'
import {PLAYER_TIME_MULT} from '../../../../../Constants'
import {DecisionState, DecisionType, OutcomeType, ScenarioType, DIFFICULTIES, SKILL_TYPES, PERSONA_TYPES, EMPTY_SCENARIO} from './Types'
import Redux from 'redux'
import {remoteify, QuestNodeAction} from '../../../../../actions/ActionTypes'
import {audioSet} from '../../../../../actions/Audio'
import {ParserNode} from '../TemplateTypes'
import SCENARIOS from './Scenarios'
import * as seedrandom from 'seedrandom'

const NUM_SKILL_CHECK_CHOICES = 3;
// Generate 3 random combinations of difficulty, skill, and persona.
// Only 2 of the 3 fields will be available.
export function generateDecisions(settings: SettingsType, rng: () => number): DecisionType[] {
  const result: DecisionType[] = [];
  // TODO Make less dumb
  const selection = [[0,1,1], [1,0,1]][Math.floor(rng() * 2)];

  while (result.length < NUM_SKILL_CHECK_CHOICES) {
    const gen = {
      difficulty: (selection[0]) ? DIFFICULTIES[Math.floor(rng() * DIFFICULTIES.length)] : null,
      persona: (selection[1]) ? PERSONA_TYPES[Math.floor(rng() * PERSONA_TYPES.length)] : null,
      skill: SKILL_TYPES[Math.floor(rng() * SKILL_TYPES.length)],
      allowedAttempts: Math.min(settings.numPlayers, Math.floor(rng() * 3 + 1)),
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

function generateDecisionTemplate(): DecisionState {
  return {
    scenario: EMPTY_SCENARIO,
    allowedAttempts: 0,
    outcomes: [],
  };
}

export function roundTimeMillis(settings: SettingsType, rp?: MultiplayerState) {
  const totalPlayerCount = numLocalAndMultiplayerPlayers(settings, rp);
  return settings.timerSeconds * 1000 * PLAYER_TIME_MULT[totalPlayerCount];
}

interface HandleDecisionStartArgs {
}
export const handleDecisionTimerStart = remoteify(function handleDecisionTimerStart(a: HandleDecisionStartArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory) {
  dispatch(audioSet({peakIntensity: 1}));
  return {};
});

interface HandleDecisionArgs {
  node?: ParserNode;
  settings?: SettingsType;
  elapsedMillis: number;
  decision: DecisionType;
  seed: string;
}
export const handleDecisionSelect = remoteify(function handleDecision(a: HandleDecisionArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleDecisionArgs {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  a.node = a.node.clone();
  let decision = a.node.ctx.templates.decision;
  if (!decision) {
    decision = generateDecisionTemplate();
    a.node.ctx.templates.decision = decision;
  }

  // TODO: Also randomly choose dark.
  // TODO: Also propagate hardness
  const choosable = SCENARIOS[a.decision.skill][a.decision.persona || 'Light'];
  const arng = seedrandom.alea(a.seed);

  decision.scenario = choosable[Math.floor(arng()*choosable.length)];
  decision.allowedAttempts = a.decision.allowedAttempts;

  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);

  return {
    elapsedMillis: a.elapsedMillis,
    decision: a.decision,
    seed: a.seed
  };
});

function makeGenericRetryOutcome(): OutcomeType {
  // TODO more options
  return {type: 'RETRY', title: 'Try Again', text: 'Just a little bit more! Try again!', instructions: []};
}

interface HandleDecisionRollArgs {
  node?: ParserNode;
  settings?: SettingsType;
  scenario: ScenarioType;
  roll: number;
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
    decision = generateDecisionTemplate();
    a.node.ctx.templates.decision = decision;
  }

  // TODO: More randomized, include nonevent here.
  const canRetry = (decision.allowedAttempts > decision.outcomes.length + 1);
  if (a.roll > 12) {
    decision.outcomes.push(a.scenario.success);
  } else if (a.roll > 8) {
    if (canRetry) {
      decision.outcomes.push(a.scenario.retry || makeGenericRetryOutcome());
    } else {
      decision.outcomes.push(a.scenario.nonevent);
    }
  } else {
    decision.outcomes.push(a.scenario.failure);
  }

  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);

  return {
    scenario: a.scenario,
    roll: a.roll,
    seed: a.seed
  };
});
