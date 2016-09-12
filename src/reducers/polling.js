import { fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { actions, DEFAULT_POLLING_INTERVAL } from '../constants';

const initialState = fromJS({
  polling: false,
  pollUrl: null,
  error: null,
  interval: DEFAULT_POLLING_INTERVAL,
  captchaRequired: false,
});

const startPolling = (state, { payload }) => {
  if (payload && payload.url) {
    return state.merge({ polling: true, pollUrl: payload.url });
  }

  return state.set('polling', true);
};

const stopPolling = (state) => (
  state.set('polling', false)
);

const setPollingInterval = (state, { payload }) => {
  if (typeof payload !== 'number') {
    return state.set('error',
                     new Error(`setPollingInterval called with an incorrect payload: ${payload}`));
  }

  return state.set('interval', payload);
};

const setPollUrl = (state, { payload }) => {
  if (typeof payload !== 'string') {
    return state.set('error',
                     new Error(`setPollUrl called with an incorrect payload: ${payload}`));
  }

  return state.set('pollUrl', payload);
};

const captchaRequired = (state) => (
  state.set('captchaRequired', true)
);

const rateLimitExceeded = (state) => (
  state.set('interval', state.get('interval') + (5 * 1000)) // keep adding 5 seconds till we are not rate limited
);

// Seems as good a way to clear "captcha required" as any
const iconClicked = (state) => (
  state.set('captchaRequired', false)
);

const polling = handleActions({
  [actions.START_POLLING]: startPolling,
  [actions.STOP_POLLING]: stopPolling,
  [actions.SET_POLLING_INTERVAL]: setPollingInterval,
  [actions.SET_POLL_URL]: setPollUrl,
  [actions.ASSIGN_WORK]: stopPolling,
  [actions.CAPTCHA_REQUIRED]: captchaRequired,
  [actions.RATE_LIMIT_EXCEEDED]: rateLimitExceeded,
  [actions.ICON_CLICKED]: iconClicked,
}, initialState);

export default polling;
