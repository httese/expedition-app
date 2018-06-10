import {Scenario} from './Types'

const scenarios: Scenario[] = {
  {
    persona: 'Light';
    skill: 'Athletics';

    prelude: string;
    success: {text: "You succeed!", instructions: ["Regain 1 hp"]},
    failure: {text: "You fail!", instructions: ["Lose 1 hp"]},
    nonevent: {text: "Nothing happens", instructions: []},
  },
  {
    persona: 'Dark';
    skill: 'Athletics';

    prelude: string;
    success: {text: "You succeed!", instructions: ["Regain 1 hp"]},
    failure: {text: "You fail!", instructions: ["Lose 1 hp"]},
    nonevent: {text: "Nothing happens", instructions: []},
  },
  {
    persona: 'Light';
    skill: 'Knowledge';

    prelude: string;
    success: {text: "You succeed!", instructions: ["Regain 1 hp"]},
    failure: {text: "You fail!", instructions: ["Lose 1 hp"]},
    nonevent: {text: "Nothing happens", instructions: []},
  },
  {
    persona: 'Dark';
    skill: 'Knowledge';

    prelude: string;
    success: {text: "You succeed!", instructions: ["Regain 1 hp"]},
    failure: {text: "You fail!", instructions: ["Lose 1 hp"]},
    nonevent: {text: "Nothing happens", instructions: []},
  },
  {
    persona: 'Light';
    skill: 'Charisma';

    prelude: string;
    success: {text: "You succeed!", instructions: ["Regain 1 hp"]},
    failure: {text: "You fail!", instructions: ["Lose 1 hp"]},
    nonevent: {text: "Nothing happens", instructions: []},
  },
  {
    persona: 'Dark';
    skill: 'Charisma';

    prelude: string;
    success: {text: "You succeed!", instructions: ["Regain 1 hp"]},
    failure: {text: "You fail!", instructions: ["Lose 1 hp"]},
    nonevent: {text: "Nothing happens", instructions: []},
  },
};

declare type ScenarioMap = {[skill: Skilltype]: {[persona: PersonaType]: Scenario}};

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
}

export default const map = buildMap(scenarios);
