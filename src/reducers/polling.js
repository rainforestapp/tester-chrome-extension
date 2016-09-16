import { fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { actions, DEFAULT_POLLING_INTERVAL } from '../constants';

const initialState = fromJS({
  polling: false,
  pollUrl: null,
  error: null,
  defaultInterval: DEFAULT_POLLING_INTERVAL,
  interval: DEFAULT_POLLING_INTERVAL,
  captchaRequired: false,
  errorDelayEndTime: null,
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
  state.set('defaultInterval', payload);
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

const rateLimitExceeded = (state) => {
  const newInterval = (state.get('interval') + (3 * 1000));
  state.set('defaultInterval', newInterval);
  return state.set('interval', newInterval); // keep adding 3 second till we are not rate limited
};

const applicationError = (state) => {
  // if app error, add 45 seconds (to max of 5 minutes) until resolved (10 minutes later)
  const addedDelay = (state.get('interval') <= (5 * 60 * 1000)) ? (45 * 1000) : 0;
  const newInterval = (state.get('interval') + addedDelay);
  state.set('errorDelayEndTime', Date.now() + (0.25 * 60 * 1000));
  return state.set('interval', newInterval);
};

const resetInterval = (state) => (
  state.set('interval', state.get('defaultInterval'))
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
  [actions.APPLICATION_ERROR]: applicationError,
  [actions.RESET_INTERVAL]: resetInterval,
  [actions.ICON_CLICKED]: iconClicked,
}, initialState);

export default polling;
