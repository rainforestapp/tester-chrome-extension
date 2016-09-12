/* eslint-disable no-console */
import { CONFIG } from './constants';

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
