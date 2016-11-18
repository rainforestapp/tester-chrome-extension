/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import { expect } from 'chai';
import pluginApp from '../../reducers';
import { mockChrome } from '../__mocks__/chrome';
import { createStore } from 'redux';
import buildContextMenus from '../buildContextMenus';
import {
  CONFIRM_WORK_ASSIGNMENT,
  NOTIFICATION_SOUND_URL,
  NOTIFICATION_SOUND_REPEAT,
} from '../../constants';
import { setOptions } from '../../actions';

const init = (opts = {}) => {
  const store = createStore(pluginApp);
  const chrome = mockChrome(opts.chrome);
  return { store, chrome };
};

describe('buildContextMenus', function() {
  describe('when building the context menu', function() {
    /* including both menus and sub-menus count */
    it('creates 17 menus', function() {
      const { store, chrome } = init();

      buildContextMenus(store, chrome);

      const menuCreated = chrome.getCreatedMenus();
      expect(menuCreated.length).to.equal(17);
    });

    it('checked menus from options', function() {
      const { store, chrome } = init();
      store.dispatch(setOptions({
        [CONFIRM_WORK_ASSIGNMENT]: true,
        [NOTIFICATION_SOUND_URL]: 'https://static.rainforestqa.com/sounds/office.ogg',
        [NOTIFICATION_SOUND_REPEAT]: 3,
      }));

      buildContextMenus(store, chrome);

      const menuChecked = chrome.getCheckedMenus();
      expect(menuChecked.length).to.equal(3);
      expect(menuChecked[0].title).to.equal('Yes');
      expect(menuChecked[1].title).to.equal('office');
      expect(menuChecked[2].title).to.equal('3');
    });

    it('does not duplicates menus', function() {
      const { store, chrome } = init();

      buildContextMenus(store, chrome);
      buildContextMenus(store, chrome);

      const menuCreated = chrome.getCreatedMenus();
      expect(menuCreated.length).to.equal(17);
    });
  });
});
