import { createAction } from 'redux-actions';
import { actions } from '../constants';

export const assignWork = createAction(actions.ASSIGN_WORK);
export const authenticate = createAction(actions.AUTHENTICATE);
export const connect = createAction(actions.CONNECT);
export const logMessage = createAction(actions.LOG_MESSAGE);
export const connectionClosed = createAction(actions.CONNECTION_CLOSED);
export const authFailed = createAction(actions.AUTH_FAILED);
export const iconClicked = createAction(actions.ICON_CLICKED);
export const workStarted = createAction(actions.WORK_STARTED);
export const workFinished = createAction(actions.WORK_FINISHED);
export const checkState = createAction(actions.CHECK_STATE);
export const setPluginVersion = createAction(actions.SET_PLUGIN_VERSION);
export const setWorkerProfile = createAction(actions.SET_WORKER_PROFILE);
export const channelLeft = createAction(actions.CHANNEL_LEFT);
export const setOptions = createAction(actions.SET_OPTIONS);
export const reloadPlugin = createAction(actions.RELOAD_PLUGIN);
export const notify = createAction(actions.NOTIFY);
export const clearNotification = createAction(actions.CLEAR_NOTIFICATION);

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
