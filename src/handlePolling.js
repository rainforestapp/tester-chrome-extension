import { logDebug } from './logging';
import { assignWork, captchaRequired } from './actions';
import Raven from 'raven-js';

const handlePolling = (store) => {
  let running = true;
  let timeoutID = null;

  const checkForCaptcha = (body) => {
    if (body.indexOf('CAPTCHA') > -1) {
      store.dispatch(captchaRequired());
    }
  };

  const checkForWork = (data) => {
    if (data.work_available) {
      if (typeof data.url !== 'string') {
        const msg = `work_available endpoint gave unexpected response: ${JSON.stringify(data)}`;
        throw new Error(msg);
      }

      store.dispatch(assignWork({ url: data.url }));
    }
  };

  const ping = (url) => {
    logDebug(`Pinging ${url}...`);

    fetch(url).then(resp => {
      if (resp.ok) {
        resp.json().then(checkForWork);
      } else {
        resp.text().then(checkForCaptcha);
      }
    })
      .catch(err => {
        Raven.captureException(err);
      });
  };

  const shouldPing = ({ polling, worker }) => (
    polling.get('polling') &&
      polling.get('pollUrl') &&
      worker.get('state') === 'ready'
  );

  const tick = () => {
    if (!running) {
      return;
    }

    const state = store.getState();
    if (shouldPing(state)) {
      ping(state.polling.get('pollUrl'));
    } else {
      logDebug('Not pinging work server');
    }
    timeoutID = setTimeout(tick, state.polling.get('interval'));
  };

  // This is really for testing; in general polling shouldn't be stopped
  // directly (instead it should be controlled through reducers).
  const stop = () => {
    running = false;
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  };

  timeoutID = setTimeout(tick);

  return {
    stop,
  };
};

export default handlePolling;
