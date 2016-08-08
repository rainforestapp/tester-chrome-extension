import { combineReducers } from 'redux';
import worker from './worker';
import socket from './socket';
import plugin from './plugin';

export const reducers = Object.freeze({
  worker,
  socket,
  plugin,
});

const pluginApp = combineReducers(reducers);

export default pluginApp;
