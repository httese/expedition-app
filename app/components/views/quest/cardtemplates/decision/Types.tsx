

export type DecisionPhase = 'PREPARE_DECISION' | 'DECISION_TIMER' | 'ROLL_DECISION' | 'RESOLVE_DECISION';

export type SkillType = 'Athletics' | 'Knowledge' | 'Charisma';
export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
export type PersonaType = 'Light' | 'Dark';
export const SKILL_TYPES: SkillType[] = ['Athletics', 'Knowledge', 'Charisma'];
export const DIFFICULTIES: DifficultyType[] = ['Easy', 'Medium', 'Hard'];
export const PERSONA_TYPES: PersonaType[] = ['Light', 'Dark'];

export type Decision = {
  difficulty: DifficultyType|null;
  persona: PersonaType|null;
  skill: SkillType;
};

export type Outcome = {title: string, text: string, instructions: string[]};

export interface Scenario {
  persona: PersonaType;
  skill: SkillType;

  prelude: string;

  success: Outcome;
  failure: Outcome;
  nonevent: Outcome;
}

export interface DecisionState {
  scenario?: Scenario;
  outcome?: Outcome;
}
