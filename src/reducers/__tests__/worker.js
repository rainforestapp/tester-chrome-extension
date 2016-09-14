/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import chai, { expect } from 'chai';
import chaiImmutable from 'chai-immutable';
import { fromJS } from 'immutable';
import {
  assignWork,
  authenticate,
  updateWorkerState,
  iconClicked,
  workStarted,
  workFinished,
  setWorkerProfile,
} from '../../actions';
import { actions } from '../../constants';
import worker from '../worker';

chai.use(chaiImmutable);

const checkState = (state) => {
  expect(state).to.have.keys([
    'state',
    'wantsMoreWork',
    'workStarted',
    'uuid',
    'workUrl',
    'profileInfo',
    'error',
  ]);
};

const initState = worker(undefined, { type: 'INIT' });

const workerWithState = (state) => (
  worker(initState, updateWorkerState(state))
);

describe('worker reducer', function() {
  it('starts with everything inactive', function() {
    const state = initState;
    checkState(state);

    expect(state.get('state')).to.equal('inactive');
    expect(state.get('wantsMoreWork')).to.be.false;
    expect(state.get('workStarted')).to.be.false;
    expect(state.get('uuid')).to.be.null;
  });

  describe(actions.AUTHENTICATE, function() {
    it('sets the worker UUID', function() {
      const auth = {
        auth: 'SEKRET',
        sig: 'SIG',
      };
      const action = authenticate({
        workerUUID: 'abc123',
        socketAuth: auth,
      });

      const state = worker(undefined, action);
      checkState(state);

      expect(state.get('state')).to.equal('inactive');
      expect(state.get('uuid')).to.equal('abc123');
    });
  });

  describe(actions.UPDATE_WORKER_STATE, function() {
    it('updates the worker state', function() {
      let state = initState;
      expect(state.get('state')).to.equal('inactive');
      state = worker(state, updateWorkerState('inactive'));
      expect(state.get('state')).to.equal('inactive');
      state = worker(state, updateWorkerState('ready'));
      expect(state.get('state')).to.equal('ready');
      state = worker(state, updateWorkerState('inactive'));
      expect(state.get('state')).to.equal('inactive');
    });
  });

  describe(actions.SET_WORKER_PROFILE, function() {
    it('updates the worker profile', function() {
      const profile = { email: 'bob@example.com', id: 'abc123' };
      const state = worker(initState, setWorkerProfile(profile));

      expect(state.get('profileInfo')).to.equal(fromJS(profile));
    });
  });

  describe(actions.ASSIGN_WORK, function() {
    describe('when the worker is ready', function() {
      const workUrl = 'http://www.example.com';

      const stateWithWork = () => {
        let state = initState;
        state = worker(state, updateWorkerState('ready'));
        return worker(state, assignWork({ url: workUrl }));
      };

      it('updates the worker state to "working"', function() {
        const state = stateWithWork();

        expect(state.get('state')).to.equal('working');
        expect(state.get('workUrl')).to.equal(workUrl);
      });

      it('defaults wantsMoreWork to true', function() {
        const state = stateWithWork();

        expect(state.get('wantsMoreWork')).to.be.true;
      });

      it('sets workStarted to false', function() {
        // This should not actually happen, it's just extra paranoia.
        let state = workerWithState('ready').set('workStarted', true);
        state = worker(state, assignWork({ url: workUrl }));

        expect(state.get('workStarted')).to.be.false;
      });
    });

    describe('when the worker is not ready', function() {
      it('updates the error and returns the same state', function() {
        let state = workerWithState('inactive');
        state = worker(state, assignWork({ url: 'whatever' }));

        expect(state.get('state')).to.equal('inactive');
        expect(state.get('error')).to.be.an('error');
      });
    });
  });

  describe(actions.WORK_STARTED, function() {
    describe("when the worker isn't working", function() {
      it('is ignored', function() {
        let state = workerWithState('ready');

        state = worker(state, workStarted());

        expect(state.get('state')).to.equal('ready');
        expect(state.get('workStarted')).to.be.false;
      });
    });

    describe('when the worker is working', function() {
      it('sets workStarted to true', function() {
        let state = workerWithState('working');

        state = worker(state, workStarted());

        expect(state.get('state')).to.equal('working');
        expect(state.get('workStarted')).to.be.true;
      });
    });
  });

  describe(actions.WORK_FINISHED, function() {
    describe('when the worker is working', function() {
      describe('when the worker wants more work', function() {
        it('changes the worker to ready', function() {
          let state = workerWithState('working').set('wantsMoreWork', true);

          state = worker(state, workFinished());

          expect(state.get('state')).to.equal('ready');
        });
      });

      describe("when the worker doesn't want more work", function() {
        it('changes the worker to inactive', function() {
          let state = workerWithState('working').set('wantsMoreWork', false);

          state = worker(state, workFinished());

          expect(state.get('state')).to.equal('inactive');
        });
      });

      it('clears the work URL', function() {
        let state = workerWithState('ready');
        state = worker(state, assignWork({ url: 'http://www.example.com' }));
        state = worker(state, workFinished());

        expect(state.get('workUrl')).to.be.null;
      });

      it('sets wantsMoreWork to false', function() {
        let state = workerWithState('working');
        state = worker(state, workFinished());

        expect(state.get('wantsMoreWork')).to.be.false;
      });

      it('sets workStarted to false', function() {
        let state = workerWithState('working');
        state = worker(state, workStarted());
        state = worker(state, workFinished());

        expect(state.get('workStarted')).to.be.false;
      });
    });

    describe('when the worker is inactive', function() {
      it('keeps the worker inactive', function() {
        let state = workerWithState('inactive');
        state = worker(state, workFinished());

        expect(state.get('state')).to.equal('inactive');
      });
    });
  });

  describe(actions.ICON_CLICKED, function() {
    describe('when the worker is inactive', function() {
      it('updates the worker state to "ready"', function() {
        let state = workerWithState('inactive');

        state = worker(state, iconClicked());
        expect(state.get('state')).to.equal('ready');
      });
    });

    describe('when the worker is ready', function() {
      it('updates the worker state to "inactive"', function() {
        let state = workerWithState('ready');

        state = worker(state, iconClicked());
        expect(state.get('state')).to.equal('inactive');
      });
    });

    describe('when the worker is working', function() {
      it("doesn't change the state", function() {
        let state = workerWithState('working');

        state = worker(state, iconClicked());
        expect(state.get('state')).to.equal('working');
      });

      it('toggles wantsMoreWork', function() {
        let state = workerWithState('ready');
        state = worker(state, assignWork({ url: 'http://www.example.com' }));
        expect(state.get('wantsMoreWork')).to.be.true;

        state = worker(state, iconClicked());
        expect(state.get('wantsMoreWork')).to.be.false;

        state = worker(state, iconClicked());
        expect(state.get('wantsMoreWork')).to.be.true;
      });
    });
  });
});
