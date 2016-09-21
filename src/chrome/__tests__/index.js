/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { startChromePlugin } from '..';
import { mockChrome } from '../__mocks__/chrome';
import { fromJS } from 'immutable';

describe('startChromePlugin', function() {
  it("sets the worker's user profile", function(done) {
    const profileUserInfo = { email: 'bob@example.com', id: 'abc123' };
    const chrome = mockChrome({ profileUserInfo });

    const plugin = startChromePlugin(chrome);
    const store = plugin.getStore();

    store.subscribe(() => {
      const profile = store.getState().worker.get('profileInfo');
      if (profile && profile.equals(fromJS(profileUserInfo))) {
        done();
      }
    });
  });
});
