import {Scenario} from './Types'

const scenarios: Scenario[] = [
  {
    persona: 'Light',
    skill: 'Athletics',

    prelude: 'Prelude text',

    success: {title: 'Success', text: 'You succeed!', instructions: ['Regain 2 health']},
    failure: {title: 'Failure', text: 'You fail!', instructions: ['Lose 2 health']},
    nonevent: {title: 'No-op', text: 'Nothing happens', instructions: []},
  },
  {
    persona: 'Dark',
    skill: 'Athletics',

    prelude: 'Prelude text',

    success: {title: 'Success', text: 'You succeed!', instructions: ['Gain 1 Tier I loot']},
    failure: {title: 'Failure', text: 'You fail!', instructions: ['Lose 1 Tier I loot']},
    nonevent: {title: 'No-op', text: 'Nothing happens', instructions: []},
  },
  {
    persona: 'Light',
    skill: 'Knowledge',

    prelude: 'Prelude text',

    success: {title: 'Success', text: 'You succeed!', instructions: ['Learn 1 ability']},
    failure: {title: 'Failure', text: 'You fail!', instructions: ['Your next ability counts as a failure.']},
    nonevent: {title: 'No-op', text: 'Nothing happens', instructions: []},
  },
  {
    persona: 'Dark',
    skill: 'Knowledge',

    prelude: 'Prelude text',

    success: {title: 'Success', text: 'You succeed!', instructions: ['Deal 1 damage to an enemy']},
    failure: {title: 'Failure', text: 'You fail!', instructions: ['Lose 1 health']},
    nonevent: {title: 'No-op', text: 'Nothing happens', instructions: []},
  },
  {
    persona: 'Light',
    skill: 'Charisma',

    prelude: 'Prelude text',

    success: {title: 'Success', text: 'You succeed!', instructions: ['Cancel the lowest tier enemy\'s next surge effect (place a token on them to track)']},
    failure: {title: 'Failure', text: 'You fail!', instructions: ['Carry out the surge effect of the lowest tier enemy']},
    nonevent: {title: 'No-op', text: 'Nothing happens', instructions: []},
  },
  {
    persona: 'Dark',
    skill: 'Charisma',

    prelude: 'Prelude text',

    success: {title: 'Success', text: 'You succeed!', instructions: ['Regain 1 hp']},
    failure: {title: 'Failure', text: 'You fail!', instructions: ['Lose 1 hp']},
    nonevent: {title: 'No-op', text: 'Nothing happens', instructions: []},
  },
];

declare type ScenarioMap = {[skill: string]: {[persona: string]: Scenario[]}};

function buildMap(s: Scenario[]): ScenarioMap {
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
