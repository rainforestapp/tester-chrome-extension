/* eslint-disable no-console */
import { CONFIG } from './constants';

export const logDebug = (msg) => {
  if (CONFIG.env === 'dev') {
    console.log(msg);
  }
};
