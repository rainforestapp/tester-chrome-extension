import { logDebug } from './logging';
import { assignWork, captchaRequired, rateLimitExceeded } from './actions';
import Raven from 'raven-js';

const handlePolling = (store) => {
  let running = true;
  let timeoutID = null;

  const checkForErrors = (body) => {
    if (body.indexOf('CAPTCHA') > -1) {
      store.dispatch(captchaRequired());
    } else if (body.indexOf('Too many requests') > -1) {
      store.dispatch(rateLimitExceeded());
    }
  };

  const checkForWork = (data) => {
    if (data.work_available) {
      if (typeof data.url !== 'string') {
        const msg = `work_available endpoint gave unexpected response: ${JSON.stringify(data)}`;
        throw new Error(msg);
      }

      // Double-check the worker state in case something changed since the fetch
      // started.
      const { worker } = store.getState();
      if (worker.get('state') === 'ready') {
        store.dispatch(assignWork({ url: data.url }));
      }
    }
  };

  const ping = (url) => {
    let urlWithInfo = url;
    const profileInfo = store.getState().worker.get('profileInfo');
    if (profileInfo) {
      urlWithInfo = `${url}?info=${JSON.stringify(profileInfo)}`;
    }
    logDebug(`Pinging ${urlWithInfo}...`);

    fetch(urlWithInfo).then(resp => {
      if (resp.ok) {
        resp.json().then(checkForWork);
      } else {
        resp.text().then(checkForErrors);
      }
    })
      .catch(err => {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          // Amazingly this is how request errors are represented, and no
          // additional information is exposed (even though if you look at the
          // console you can SEE THE ERROR DETAILS RIGHT THERE COME ON
          // CHROME!!!!)
          //
          // In what universe is a request failure a type error in the first
          // place? Oh that's right, the JavaScript universe.
          //
          // Oh well, just ignore it I guess.
        } else {
          Raven.captureException(err, { extra: { url } });
        }
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
