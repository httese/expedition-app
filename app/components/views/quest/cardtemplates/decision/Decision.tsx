
import * as React from 'react'
import * as seedrandom from 'seedrandom'
import Button from '../../../../base/Button'
import Card from '../../../../base/Card'
import {CombatState} from '../combat/Types'
import {ParserNode} from '../TemplateTypes'
import {SettingsType, MultiplayerState} from '../../../../../reducers/StateTypes'
import {generateDecisions, roundTimeMillis} from './Actions'
import {Decision} from './Types'
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
  onRollDecision: (node: ParserNode, settings: SettingsType, decision: Decision, success: boolean, seed: string) => void;
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
          <li><strong>Select</strong> your result</li>
        </ol>
      </div>
    );
  }

  const decision = props.combat.mostRecentDecision || {persona: null, difficulty: null, skill: null};

  return (
    <Card title="Resolve Decision" theme="dark" inQuest={true}>
      {decision && <div><strong>{decision.difficulty} {decision.persona} {decision.skill}</strong></div>}
      {helpText}
      <Button onClick={() => props.onRollDecision(props.node, props.settings, decision, true, props.seed)}>Roll ≥ 15</Button>
      <Button onClick={() => props.onRollDecision(props.node, props.settings, decision, false, props.seed)}>Roll &lt; 15</Button>
    </Card>
  );
}

export function renderResolveDecision(props: DecisionProps): JSX.Element {
  if (props.combat.mostRecentDecisionSuccess) {
    return (
      <Card title="Success!" theme="dark" inQuest={true}>
        <div>
          <p>Flavor text here</p>
          <ol>
            <li>Regain 1 health</li>
          </ol>
        </div>
        <Button onClick={() => props.onDecisionEnd()}>Next</Button>
      </Card>
    );
  } else {
    return (
      <Card title="Failure" theme="dark" inQuest={true}>
        <div>
          <p>Flavor text here</p>
          <ol>
            <li>Take 1 damage</li>
          </ol>
        </div>
        <Button onClick={() => props.onDecisionEnd()}>Next</Button>
      </Card>
    );
  }
}
