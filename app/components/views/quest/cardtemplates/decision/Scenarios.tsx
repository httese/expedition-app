import {ScenarioType} from './Types'

const scenarios: ScenarioType[] = [
  {
    persona: 'Light',
    skill: 'Athletics',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', title: 'Success', text: 'You dance around your enemies, moving fast enough to produce a shock cone that cauterizes your wounds!', instructions: ['Regain 2 health']},
    failure: {type: 'FAILURE', title: 'Failure', text: 'You trip and fall on your own face!', instructions: ['Lose 2 health']},
    nonevent: {type: 'NONEVENT', title: 'No-op', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Dark',
    skill: 'Athletics',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', title: 'Success', text: 'You trip an enemy, making them drop some loot.', instructions: ['Gain 1 Tier I loot']},
    failure: {type: 'FAILURE', title: 'Failure', text: 'You try to trip an enemy, but they trip you first!', instructions: ['Lose 1 Tier I loot']},
    nonevent: {type: 'NONEVENT', title: 'No-op', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Light',
    skill: 'Knowledge',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', title: 'Success', text: 'You recall a technique you read once; maybe you can put it to use...', instructions: ['Learn 1 ability']},
    failure: {type: 'FAILURE', title: 'Failure', text: 'You\'re not feelying particularly knowledgeable about your next action.', instructions: ['Your next ability counts as a failure.']},
    nonevent: {type: 'NONEVENT', title: 'No-op', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Dark',
    skill: 'Knowledge',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', title: 'Success', text: 'You see an opportunity to strike right where it hurts most!', instructions: ['Deal 1 damage to an enemy']},
    failure: {type: 'FAILURE', title: 'Failure', text: 'You attempt a dark blood ritual, but forgot it was just a ritual to that makes your blood dark.', instructions: ['Lose 1 health']},
    nonevent: {type: 'NONEVENT', title: 'No-op', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Light',
    skill: 'Charisma',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', title: 'Success', text: 'You succeed!', instructions: ['Cancel the lowest tier enemy\'s next surge effect (place a token on them to track)']},
    failure: {type: 'FAILURE', title: 'Failure', text: 'You fail!', instructions: ['Carry out the surge effect of the lowest tier enemy']},
    nonevent: {type: 'NONEVENT', title: 'No-op', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
  {
    persona: 'Dark',
    skill: 'Charisma',

    prelude: 'Prelude text',

    success: {type: 'SUCCESS', title: 'Success', text: 'You succeed!', instructions: ['Regain 1 hp']},
    failure: {type: 'FAILURE', title: 'Failure', text: 'You fail!', instructions: ['Lose 1 hp']},
    nonevent: {type: 'NONEVENT', title: 'No-op', text: 'Nothing happens.', instructions: []},
    retry: null,
  },
];

declare type ScenarioMap = {[skill: string]: {[persona: string]: ScenarioType[]}};

function buildMap(s: ScenarioType[]): ScenarioMap {
  const result: ScenarioMap = {};
  for (const s of scenarios) {
    if (!result[s.skill]) {
      result[s.skill] = {[s.persona]: [s]};
    } else if (!result[s.skill][s.persona]) {
      result[s.skill][s.persona] = [s];
    } else {
      result[s.skill][s.persona].push(s);
    }
  }
  return result;
}

const map = buildMap(scenarios);
export default map;
