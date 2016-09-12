/* eslint-disable no-console */
import { CONFIG, REDUCERS } from './constants';

export const logDebug = (msg, data) => {
  if (CONFIG.env !== 'dev' && !window.DEBUG) {
    return;
  }

  if (data) {
    // deal with immutable stuff
    if (typeof data.toJS === 'function') {
      console.log(msg, data.toJS());
    } else {
      console.log(msg, data);
    }
  } else {
    console.log(msg);
  }
};

export const logMiddleware = store => next => action => {
  logDebug('\n***Dispatching***');
  logDebug('action:', action);
  const result = next(action);
  logDebug('Next state:');
  const state = store.getState();
  REDUCERS.forEach(reducer => {
    logDebug(`${reducer}: `, state[reducer]);
  });
  return result;
};
