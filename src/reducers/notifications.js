import { actions, NOTIFICATIONS } from '../constants.js';
import { handleActions } from 'redux-actions';
import { fromJS, Set } from 'immutable';

const initialState = fromJS({
  activeNotifications: Set([]),
  error: null,
});

const notificationError = (payload) => {
  if (typeof payload !== 'string') {
    return new Error(`Invalid notification payload: ${payload}`);
  }
  if (!(payload in NOTIFICATIONS)) {
    return new Error(`${payload} is not a valid notification key`);
  }

  return null;
};

const notify = (state, { payload }) => {
  const err = notificationError(payload);
  if (err) {
    return state.set('error', err);
  }
  return state.update('activeNotifications', notifications => (
    notifications.add(payload)
  ));
};

const clearNotification = (state, { payload }) => {
  const err = notificationError(payload);
  if (err) {
    return state.set('error', err);
  }
  return state.update('activeNotifications', notifications => (
    notifications.delete(payload)
  ));
};

const notifications = handleActions({
  [actions.NOTIFY]: notify,
  [actions.CLEAR_NOTIFICATION]: clearNotification,
}, initialState);

export default notifications;
