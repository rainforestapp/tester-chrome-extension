/*
  eslint-disable prefer-arrow-callback,
  func-names,
  space-before-function-paren,
  no-unused-expressions
*/
import chai, { expect } from 'chai';
import { actions, DEFAULT_POLLING_INTERVAL } from '../../constants';
import {
  startPolling,
  stopPolling,
  setPollingInterval,
  setPollUrl,
  assignWork,
  captchaRequired,
  iconClicked,
} from '../../actions';
import chaiImmutable from 'chai-immutable';
import polling from '../polling';

chai.use(chaiImmutable);

const checkState = (state) => {
  expect(state).to.have.keys(['polling', 'pollUrl', 'error', 'interval', 'captchaRequired']);
};

const initState = polling(undefined, { type: 'INIT' });

describe('polling reducer', function() {
  it('starts without polling', function() {
    const state = initState;
    checkState(initState);
    expect(state.get('polling')).to.be.false;
    expect(state.get('pollUrl')).to.be.null;
    expect(state.get('interval')).to.equal(DEFAULT_POLLING_INTERVAL);
  });

  describe(actions.START_POLLING, function() {
    it('sets the polling params', function() {
      const url = 'http://example.com';
      const state = polling(undefined, startPolling({ url }));
      checkState(state);

      expect(state.get('polling')).to.be.true;
      expect(state.get('pollUrl')).to.equal(url);
    });

    describe('without a URL', function() {
      it('sets the polling param', function() {
        const state = polling(initState, startPolling());
        checkState(state);

        expect(state.get('polling')).to.be.true;
        expect(state.get('pollUrl')).to.be.null;
        expect(state.get('error')).to.be.null;
      });
    });
  });

  describe(actions.STOP_POLLING, function() {
    it('sets the polling params', function() {
      let state = polling(undefined, startPolling({ url: 'http://example.com' }));
      checkState(state);
      state = polling(state, stopPolling());
      checkState(state);

      expect(state.get('polling')).to.be.false;
    });
  });

  describe(actions.SET_POLLING_INTERVAL, function() {
    it('sets the polling interval', function() {
      const state = polling(undefined, setPollingInterval(42));
      checkState(state);

      expect(state.get('interval')).to.equal(42);
    });
  });

  describe(actions.SET_POLL_URL, function() {
    it('sets the URL for polling', function() {
      const state = polling(undefined, setPollUrl('http://work.com'));
      checkState(state);

      expect(state.get('pollUrl')).to.equal('http://work.com');
    });
  });

  describe(actions.ASSIGN_WORK, function() {
    it('stops polling', function() {
      let state = polling(undefined, startPolling({ url: 'http://example.com' }));
      checkState(state);
      state = polling(state, assignWork({ url: 'http://work.com' }));
      checkState(state);

      expect(state.get('polling')).to.be.false;
    });
  });

  describe(actions.CAPTCHA_REQUIRED, function() {
    it('sets captchaRequired to true', function() {
      let state = initState;
      state = polling(state, startPolling({ url: 'http://example.com' }));
      state = polling(state, captchaRequired());
      checkState(state);

      expect(state.get('captchaRequired')).to.be.true;
    });
  });

  describe(actions.ICON_CLICKED, function() {
    it('sets captchaRequired to false', function() {
      let state = initState;
      state = polling(state, startPolling({ url: 'http://example.com' }));
      state = polling(state, captchaRequired());
      state = polling(state, iconClicked());
      checkState(state);

      expect(state.get('captchaRequired')).to.be.false;
    });
  });
});
