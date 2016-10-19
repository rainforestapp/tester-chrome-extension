/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import { Set } from 'immutable';
import { captchaRequired } from '../../actions';
import { createStore } from 'redux';
import pluginApp from '../../reducers';
import handleCaptcha from '../handleCaptcha';

chai.use(chaiImmutable);

describe('handleCaptcha', function() {
  it('shows a notification when a captcha is required', function() {
    const store = createStore(pluginApp);
    handleCaptcha(store);

    store.dispatch(captchaRequired());

    expect(store.getState().notifications.get('activeNotifications')).to.equal(Set(['captcha']));
  });
});
