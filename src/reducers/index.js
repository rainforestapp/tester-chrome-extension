import { combineReducers } from 'redux';
import worker from './worker';
import socket from './socket';
import plugin from './plugin';
import polling from './polling';

export const reducers = Object.freeze({
  worker,
  socket,
  plugin,
  polling,
});

const pluginApp = combineReducers(reducers);

export default pluginApp;
