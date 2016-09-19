import { actions } from '../constants';
import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({
  version: null,
  error: null,
  options: {},
});

const setPluginVersion = (state, { payload }) => (
  state.set('version', payload)
);

const setOptions = (state, { payload }) => {
  if (typeof payload !== 'object') {
    return state.set('error', new Error(`setOptions called with an invalid payload: ${payload}`));
  }

  return state.update('options', opts => opts.merge(payload));
};

const plugin = handleActions({
  [actions.SET_PLUGIN_VERSION]: setPluginVersion,
  [actions.SET_OPTIONS]: setOptions,
}, initialState);

export default plugin;
