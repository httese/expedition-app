
import * as React from 'react'
import * as seedrandom from 'seedrandom'
import Button from '../../../../base/Button'
import Card from '../../../../base/Card'
import {ParserNode} from '../TemplateTypes'
import {SettingsType, CardState, CardThemeType, MultiplayerState} from '../../../../../reducers/StateTypes'
import {generateDecisions, roundTimeMillis} from './Actions'
import {DecisionState, DecisionType, ScenarioType, EMPTY_OUTCOME} from './Types'
import DecisionTimer from './DecisionTimer'

export interface DecisionStateProps {
  card: CardState;
  decision: DecisionState;
  settings: SettingsType;
  node: ParserNode;
  seed: string;
  multiplayerState?: MultiplayerState;
}

export interface DecisionDispatchProps {
  onStartTimer: () => void;
  onChoice: (node: ParserNode, settings: SettingsType, decision: DecisionType, elapsedMillis: number, seed: string) => void;
  onRoll: (node: ParserNode, settings: SettingsType, scenario: ScenarioType, roll: number, seed: string) => void;
  onEnd: () => void;
}

export interface DecisionProps extends DecisionStateProps, DecisionDispatchProps {}

export function renderPrepareDecision(props: DecisionProps): JSX.Element {
  // Note: similar help text in renderNoTimer()
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      <div>
        <ol>
          <li>
            <strong>Keep</strong> your skill and persona cards within sight.
          </li>
          <li><strong>Start</strong> the timer.</li>
          <li><strong>Select</strong> one of the combinations of difficulty, persona type, and skill type from the timer page.</li>
          <li><strong>Be careful!</strong> If the timer runs out, the event becomes more difficult.</li>
        </ol>
      </div>
    );
  }

  return (
    <Card title="Prepare for a Decision" theme="dark" inQuest={true}>
      {helpText}
      <Button className="bigbutton" onClick={() => props.onStartTimer()}>Begin Skill Check</Button>
    </Card>
  );
}

export function renderDecisionTimer(props: DecisionProps): JSX.Element {
  let instruction: string|undefined = undefined;
  if (props.settings.showHelp) {
    instruction = 'Select a decision!';
  }

  const arng = seedrandom.alea(props.seed);

  return (
    <DecisionTimer
      theme="dark"
      decisions={generateDecisions(props.settings, arng)}
      roundTimeTotalMillis={roundTimeMillis(props.settings, props.multiplayerState)}
      onDecision={(d: DecisionType, ms: number) => props.onChoice(props.node, props.settings, d, ms, props.seed)} />
  );
}

export function renderResolveDecision(props: DecisionProps): JSX.Element {
  const scenario = props.decision.scenario;
  const roll = <img className="inline_icon" src="images/roll_white_small.svg"></img>;
  const outcome = props.decision.outcomes[props.decision.outcomes.length-1] || EMPTY_OUTCOME;

  // Note: similar help text in renderNoTimer()
  let inst: JSX.Element = (<span></span>);

  if (outcome.instructions.length > 0) {
    const elems = outcome.instructions.map((instruction: string, i: number) => {
      return <li key={i}>{instruction}</li>;
    });
    inst = <ol>{elems}</ol>;
  } else if (props.settings.showHelp && outcome.type === 'RETRY') {
    inst = (
      // TODO: Show the decision and hide persona if not used.
      <ol>
        <li>
          <strong>Roll</strong> a D20 and add your matching skill's highest level.
        </li>
        <li><strong>If your persona type matches</strong>, then add 2 to your roll.</li>
        <li><strong>Select</strong> your result.</li>
      </ol>
    );
  }

  let pretext: JSX.Element;
  if (!outcome) {
    pretext = <p>{scenario.prelude}</p>;
  } else /* need to retry */ {
    pretext = <p>{outcome.text}</p>;
  }

  let controls: JSX.Element;
  console.log(outcome);
  console.log('vs');
  console.log(scenario);
  if (outcome.type === 'SUCCESS' || outcome.type === 'FAILURE' || outcome.type === 'NONEVENT') {
    controls = <Button onClick={() => props.onEnd()}>Next</Button>;
  } else {
    controls = (
      <span>
        <Button onClick={() => props.onRoll(props.node, props.settings, scenario, 18, props.seed)}>{roll} 17 - 20</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, scenario, 14, props.seed)}>{roll} 13 - 16</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, scenario, 10, props.seed)}>{roll} 9 - 12</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, scenario, 6, props.seed)}>{roll} 5 - 8</Button>
        <Button onClick={() => props.onRoll(props.node, props.settings, scenario, 2, props.seed)}>{roll} 1 - 4</Button>
      </span>
    );
  }

  return (
    <Card title={outcome.title || 'Resolve'} theme="dark" inQuest={true}>
      {pretext}
      {inst}
      {controls}
    </Card>
  );
}

const Decision = (props: DecisionProps, theme: CardThemeType = 'light'): JSX.Element => {
  switch(props.card.phase) {
    case 'PREPARE_DECISION':
      return renderPrepareDecision(props);
    case 'DECISION_TIMER':
      return renderDecisionTimer(props);
    case 'RESOLVE_DECISION':
      return renderResolveDecision(props);
    default:
      throw new Error('Unknown decision phase ' + props.card.phase);
  }
};

export default Decision;
