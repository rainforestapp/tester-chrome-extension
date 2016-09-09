/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { mockChrome } from '../__mocks__/chrome';
import { expect } from 'chai';
import { captchaRequired, startPolling } from '../../actions';
import { createStore } from 'redux';
import pluginApp from '../../reducers';
import handleCaptcha from '../handleCaptcha';
import { captcha } from '../notifications';

describe('handleCaptcha', function() {
  it('shows a notification when a captcha is required', function() {
    const chrome = mockChrome();
    const store = createStore(pluginApp);
    handleCaptcha(store, chrome);

    store.dispatch(captchaRequired());

    expect(chrome.getCurrentNotifications()).to.have.property(captcha);
  });

  describe('clicking a captcha notification', function() {
    it('opens a tab with the work URL', function() {
      const chrome = mockChrome();
      const store = createStore(pluginApp);
      const url = 'http://example.com';

      handleCaptcha(store, chrome);
      store.dispatch(startPolling({ url }));
      store.dispatch(captchaRequired());

      chrome.clickNotification(captcha);

      const tabs = chrome.getOpenTabs();
      expect(tabs.length).to.equal(1);
      expect(tabs[0].url).to.equal(url);
    });
  });
});
