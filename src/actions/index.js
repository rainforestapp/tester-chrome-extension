import { createAction } from 'redux-actions';
import { actions } from '../constants';

export const assignWork = createAction(actions.ASSIGN_WORK);
export const authenticate = createAction(actions.AUTHENTICATE);
export const connect = createAction(actions.CONNECT);
export const logMessage = createAction(actions.LOG_MESSAGE);
export const connectionClosed = createAction(actions.CONNECTION_CLOSED);
export const authFailed = createAction(actions.AUTH_FAILED);
export const iconClicked = createAction(actions.ICON_CLICKED);
export const workFinished = createAction(actions.WORK_FINISHED);
export const setPluginVersion = createAction(actions.SET_PLUGIN_VERSION);
export const startPolling = createAction(actions.START_POLLING);
export const stopPolling = createAction(actions.STOP_POLLING);
export const setPollingInterval = createAction(actions.SET_POLLING_INTERVAL);
export const setPollUrl = createAction(actions.SET_POLL_URL);
export const captchaRequired = createAction(actions.CAPTCHA_REQUIRED);
export const setWorkerProfile = createAction(actions.SET_WORKER_PROFILE);

const validWorkerStates = ['ready', 'inactive', 'working'];

export const updateWorkerState = state => {
  if (!validWorkerStates.includes(state)) {
    throw new Error(`Unrecognized worker state: '${state}'`);
  }

  return {
    type: actions.UPDATE_WORKER_STATE,
    payload: state,
  };
};
