import { actions } from '../constants';
import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

const initialState = fromJS({
  version: null,
  error: null,
});

const setPluginVersion = (state, { payload }) => (
  state.set('version', payload)
);

const plugin = handleActions({
  [actions.SET_PLUGIN_VERSION]: setPluginVersion,
}, initialState);

export default plugin;
