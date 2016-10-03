import { fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { actions, DEFAULT_POLLING_INTERVAL, CONFIG } from '../constants';

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

const authenticate = (state, { payload }) => {
  if (!payload) {
    return state.set('error', new Error('authenticate dispatched without a payload'));
  }
  const { workerUUID } = payload;
  if (!workerUUID) {
    return state.set('error', new Error('authenticate dispatched without worker UUID'));
  }

  return state.set('pollUrl', `${CONFIG.workAvailableEndpoint}/${workerUUID}/work_available`);
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

const captchaRequired = (state) => (
  state.set('captchaRequired', true)
);

const rateLimitExceeded = (state) => {
  const newInterval = (state.get('interval') + (3 * 1000));
  return state.set('interval', newInterval); // keep adding 3 second till we are not rate limited
};

// Seems as good a way to clear "captcha required" as any
const iconClicked = (state) => (
  state.set('captchaRequired', false)
);

const polling = handleActions({
  [actions.START_POLLING]: startPolling,
  [actions.STOP_POLLING]: stopPolling,
  [actions.SET_POLLING_INTERVAL]: setPollingInterval,
  [actions.ASSIGN_WORK]: stopPolling,
  [actions.CAPTCHA_REQUIRED]: captchaRequired,
  [actions.RATE_LIMIT_EXCEEDED]: rateLimitExceeded,
  [actions.ICON_CLICKED]: iconClicked,
  [actions.AUTHENTICATE]: authenticate,
}, initialState);

export default polling;
