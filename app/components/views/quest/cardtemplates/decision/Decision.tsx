
import * as React from 'react'
import * as seedrandom from 'seedrandom'
import Button from '../../../../base/Button'
import Card from '../../../../base/Card'
import {CombatState} from '../combat/Types'
import {ParserNode} from '../TemplateTypes'
import {SettingsType, MultiplayerState} from '../../../../../reducers/StateTypes'
import {generateDecisions, roundTimeMillis} from './Actions'
import {Decision, Scenario, Outcome} from './Types'
import DecisionTimer from './DecisionTimer'

export interface DecisionStateProps {
  combat: CombatState;
  settings: SettingsType;
  node: ParserNode;
  seed: string;
  multiplayerState?: MultiplayerState;
}

export interface DecisionDispatchProps {
  onDecisionStart: () => void;
  onDecision: (node: ParserNode, settings: SettingsType, decision: Decision, elapsedMillis: number, seed: string) => void;
  onRollDecision: (node: ParserNode, settings: SettingsType, scenario: Scenario, roll: number, seed: string) => void;
  onDecisionEnd: () => void;
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
      <Button className="bigbutton" onClick={() => props.onDecisionStart()}>Start Timer</Button>
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
      decisions={generateDecisions(arng)}
      roundTimeTotalMillis={roundTimeMillis(props.settings, props.multiplayerState)}
      onDecision={(d: Decision, ms: number) => props.onDecision(props.node, props.settings, d, ms, props.seed)} />
  );
}

export function renderRollDecision(props: DecisionProps): JSX.Element {
  // Note: similar help text in renderNoTimer()
  let helpText: JSX.Element = (<span></span>);
  if (props.settings.showHelp) {
    helpText = (
      // TODO: Show the decision and hide persona if not used.
      <div>
        <ol>
          <li>
            <strong>Roll</strong> a D20 and add your matching skill's highest level.
          </li>
          <li><strong>If your persona type matches</strong>, then add 2 to your roll.</li>
          <li><strong>Select</strong> your result.</li>
        </ol>
      </div>
    );
  }

  const scenario = props.combat.mostRecentScenario;
  // TODO DO BETTER
  if (!scenario) {
    return <span></span>;
  }

  const roll = <img className="inline_icon" src="images/roll_white_small.svg"></img>;

  return (
    <Card title="Resolve Decision" theme="dark" inQuest={true}>
      <p>{scenario.prelude}</p>
      {helpText}

      <Button onClick={() => props.onRollDecision(props.node, props.settings, scenario, 18, props.seed)}>{roll} 17 - 20</Button>
      <Button onClick={() => props.onRollDecision(props.node, props.settings, scenario, 14, props.seed)}>{roll} 13 - 16</Button>
      <Button onClick={() => props.onRollDecision(props.node, props.settings, scenario, 10, props.seed)}>{roll} 9 - 12</Button>
      <Button onClick={() => props.onRollDecision(props.node, props.settings, scenario, 6, props.seed)}>{roll} 5 - 8</Button>
      <Button onClick={() => props.onRollDecision(props.node, props.settings, scenario, 2, props.seed)}>{roll} 1 - 4</Button>
    </Card>
  );
}

export function renderResolveDecision(props: DecisionProps): JSX.Element {
  const outcome: Outcome = props.combat.mostRecentOutcome || {title: '', text: '', instructions: []};

  const inst = outcome.instructions.map((instruction: string, i: number) => {
    return <li key={i}>{instruction}</li>;
  });


  return (
    <Card title={outcome.title} theme="dark" inQuest={true}>
      <div>
        <p>{outcome.text}</p>
        <ol>{inst}</ol>
      </div>
      <Button onClick={() => props.onDecisionEnd()}>Next</Button>
    </Card>
  );
}
