import { actions } from '../constants';
import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({
  state: 'inactive',
  uuid: null,
  workUrl: null,
  error: null,
});

const authenticate = (state, { payload }) => (
  state.set('uuid', payload.workerUUID)
);

const updateWorkerState = (state, { payload: newState }) => (
  state.set('state', newState)
);

const assignWork = (state, { payload: { url } }) => {
  const oldState = state.get('state');
  if (oldState !== 'ready') {
    const err = new Error(`Cannot assign work to worker in state '${oldState}'`);
    return state.set('error', err);
  }

  return state.merge({ state: 'working', workUrl: url });
};

const workFinished = (state) => {
  if (state.get('state') === 'working') {
    return state.merge({
      state: 'ready',
      workUrl: null,
    });
  }

  return state;
};

const iconClicked = (state) => {
  const oldState = state.get('state');
  let newState;
  switch (state.get('state')) {
    case 'ready':
      newState = 'inactive';
      break;
    case 'inactive':
      newState = 'ready';
      break;
    default:
      newState = oldState;
      break;
  }

  return state.set('state', newState);
};

const worker = handleActions({
  [actions.AUTHENTICATE]: authenticate,
  [actions.UPDATE_WORKER_STATE]: updateWorkerState,
  [actions.ASSIGN_WORK]: assignWork,
  [actions.WORK_FINISHED]: workFinished,
  [actions.ICON_CLICKED]: iconClicked,
}, initialState);

export default worker;
