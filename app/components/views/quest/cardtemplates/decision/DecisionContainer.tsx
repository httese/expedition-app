import Redux from 'redux'
import {connect} from 'react-redux'
import Decision, {DecisionStateProps, DecisionDispatchProps} from './Decision'
import {toPrevious, toCard} from '../../../../../actions/Card'
import {
  handleDecisionTimerStart,
  handleDecisionSelect,
  handleDecisionRoll,
} from './Actions'
import {Decision, Scenario} from '../decision/Types'
import {event} from '../../../../../actions/Quest'
import {AppStateWithHistory, SettingsType} from '../../../../../reducers/StateTypes'
import {EventParameters} from '../../../../../reducers/QuestTypes'
import {DecisionState, DecisionPhase} from './Types'
import {MAX_ADVENTURER_HEALTH} from '../../../../../Constants'
import {logEvent} from '../../../../../Logging'
import {ParserNode} from '../TemplateTypes'
import {getMultiplayerClient} from '../../../../../Multiplayer'
import {getStore} from '../../../../../Store'

declare var window:any;

const mapStateToProps = (state: AppStateWithHistory, ownProps: DecisionStateProps): DecisionStateProps => {
  const stateDecision = (state.quest.node && state.quest.node.ctx && state.quest.node.ctx.templates && state.quest.node.ctx.templates.decision);

  return {
    decision,
    settings: state.settings,
    node: state.quest.node,
    seed: state.quest.seed,
    multiplayerState: state.multiplayer,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): DecisionDispatchProps => {
  return {
    onStartTimer: () => {
      dispatch(handleDecisionTimerStart({}));
      dispatch(toCard({name: 'QUEST_CARD', phase: 'DECISION_TIMER'}));
    },
    onChoice: (node: ParserNode, settings: SettingsType, decision: DecisionType, elapsedMillis: number, seed: string) => {
      dispatch(handleDecisionSelect({node, settings, elapsedMillis, decision, seed}));
      dispatch(toCard({name: 'QUEST_CARD', phase:'ROLL_DECISION'}));
    },
    onRoll: (node: ParserNode, settings: SettingsType, scenario: Scenario, roll: number, seed: string) => {
      dispatch(handleDecisionRoll({node, settings, scenario, roll, seed}));
      dispatch(toCard({name: 'QUEST_CARD', phase:'RESOLVE_DECISION'}));
    },
    onEnd: () => {
      // TODO
    },
  };
}

const DecisionContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Decision);

export default DecisionContainer;