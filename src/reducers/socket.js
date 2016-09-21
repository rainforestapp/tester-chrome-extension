import { actions } from '../constants';
import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({
  state: 'unconnected',
  auth: null,
  messages: [],
  error: null,
});

const authenticate = (state, { payload }) => {
  if (!payload || !payload.socketAuth) {
    const err = new Error('AUTHENTICATE called without necessary socketAuth parameter');
    return state.set('error', err);
  }

  return state.set('auth', fromJS(payload.socketAuth));
};

const connect = (state) => (
  state.set('state', 'connected')
);

const logMessage = (state, { payload }) => (
  state.updateIn(['messages'], msgs => (
    msgs.unshift(payload).take(20)
  ))
);

const connectionClosed = (state) => (
  state.set('state', 'unconnected')
);

const authFailed = (state) => (
  state.set('state', 'unauthenticated')
);

const channelLeft = (state) => (
  state.set('state', 'left')
);

const iconClicked = (state) => {
  switch (state.get('state')) {
    case 'left':
      return state.set('state', 'reconnecting');
    default:
      return state;
  }
};

const socket = handleActions({
  [actions.AUTHENTICATE]: authenticate,
  [actions.CONNECT]: connect,
  [actions.LOG_MESSAGE]: logMessage,
  [actions.CONNECTION_CLOSED]: connectionClosed,
  [actions.AUTH_FAILED]: authFailed,
  [actions.CHANNEL_LEFT]: channelLeft,
  [actions.ICON_CLICKED]: iconClicked,
}, initialState);

export default socket;
