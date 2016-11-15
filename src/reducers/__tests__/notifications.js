/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import notifications from '../notifications';
import chaiImmutable from 'chai-immutable';
import { actions } from '../../constants';
import { notify, clearNotification } from '../../actions';
import { Set } from 'immutable';

chai.use(chaiImmutable);

const checkState = (state) => {
  expect(state).to.have.keys(['activeNotifications', 'error']);
};

const initState = notifications(undefined, { type: 'INIT' });

describe('notifications reducer', function() {
  it('starts with no notifications', function() {
    const state = initState;
    checkState(state);
    expect(state.get('activeNotifications')).to.equal(Set([]));
  });

  describe(actions.NOTIFY, function() {
    it('adds the notification', function() {
      let state = initState;
      ['notLoggedIn', 'leftChannel', 'notLoggedIn'].forEach(notification => {
        state = notifications(state, notify(notification));
      });
      expect(state.get('activeNotifications')).to.equal(Set(['notLoggedIn', 'leftChannel']));
    });

    it('sets the error if the notification is bogus', function() {
      const state = notifications(initState, notify());
      checkState(state);
      expect(state.get('error')).to.be.an('error');
    });

    it('sets the error if the notification is not a proper notification key', function() {
      const state = notifications(initState, notify('notANotification'));
      checkState(state);
      expect(state.get('error')).to.be.an('error');
    });
  });

  describe(actions.CLEAR_NOTIFICATION, function() {
    it('clears the notification', function() {
      let state = initState;
      ['notLoggedIn', 'leftChannel'].forEach(notification => {
        state = notifications(state, notify(notification));
      });
      state = notifications(state, clearNotification('notLoggedIn'));
      state = notifications(state, clearNotification('workerIdle'));
      checkState(state);
      expect(state.get('activeNotifications')).to.equal(Set(['leftChannel']));
    });

    it('sets the error if the notification is bogus', function() {
      const state = notifications(initState, clearNotification('foobar'));
      checkState(state);
      expect(state.get('error')).to.be.an('error');
    });
  });
});
