/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
import { expect } from 'chai';
import handlePolling from '../handlePolling';
import fetchMock from 'fetch-mock';
import pluginApp from '../reducers';
import { createStore } from 'redux';
import {
  setPollingInterval,
  startPolling,
  stopPolling,
  updateWorkerState,
} from '../actions';

describe('handlePolling', function() {
  const pollUrl = 'http://example.com/work_available';

  describe('when polling is on', function() {
    const storeWithPolling = () => {
      const store = createStore(pluginApp);
      store.dispatch(setPollingInterval(1));
      store.dispatch(startPolling({ url: pollUrl }));
      store.dispatch(updateWorkerState('ready'));

      return store;
    };

    it('pings periodically', function(done) {
      const store = storeWithPolling();
      store.dispatch(setPollingInterval(1));

      let poller = null;

      let pingCounts = 0;
      fetchMock.get(pollUrl, url => {
        expect(url).to.equal(pollUrl);
        pingCounts++;
        if (pingCounts === 3) {
          poller.stop();
          fetchMock.restore();
          done();
        }
        return { work_available: false };
      });

      poller = handlePolling(store);
    });

    it("doesn't ping when the worker isn't ready", function(done) {
      const store = storeWithPolling();
      store.dispatch(updateWorkerState('inactive'));

      let poller = null;
      let fail = false;
      fetchMock.get(pollUrl, () => {
        poller.stop();
        fetchMock.restore();
        fail = true;
        done(new Error("Shouldn't have polled because worker wasn't ready!"));
      });

      poller = handlePolling(store);

      setTimeout(() => {
        if (!fail) {
          poller.stop();
          fetchMock.restore();
          done();
        }
      }, 10);
    });

    it('checks for RATE_LIMIT_EXCEEDED', function(done) {
      const store = storeWithPolling();
      let poller = null;
      fetchMock.get(pollUrl, {
        status: 400,
        body: '{"error":"Too many requests"}',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let state = store.getState();
      const interval = state.polling.get('interval');

      let success = false;
      store.subscribe(() => {
        state = store.getState();
        if (state.polling.get('interval') > interval) {
          success = true;
          fetchMock.restore();
          poller.stop();
          done();
        }
      });

      poller = handlePolling(store);

      setTimeout(() => {
        if (!success) {
          fetchMock.restore();
          poller.stop();
          done(new Error("RATE_LIMIT_EXCEEDED wasn't detected"));
        }
      }, 50);
    });

    it('checks for APPLICATION_ERROR', function(done) {
      const store = storeWithPolling();
      let poller = null;
      fetchMock.get(pollUrl, {
        status: 500,
      });

      let state = store.getState();
      const interval = state.polling.get('interval');

      let success = false;
      store.subscribe(() => {
        state = store.getState();
        if (state.polling.get('interval') > interval) {
          success = true;
          fetchMock.restore();
          poller.stop();
          done();
        }
      });

      poller = handlePolling(store);

      setTimeout(() => {
        if (!success) {
          fetchMock.restore();
          poller.stop();
          done(new Error("APPLICATION_ERROR wasn't detected"));
        }
      }, 50);
    });

    it.skip('checks if the interval can be reset', function(done) {
    });

    it('checks for CAPTCHAs', function(done) {
      const store = storeWithPolling();
      let poller = null;
      fetchMock.get(pollUrl, {
        status: 503,
        body: '<html>CAPTCHA nonsense!</html>',
        headers: {
          'Content-Type': 'text/html',
        },
      });

      let success = false;
      store.subscribe(() => {
        const state = store.getState();
        if (state.polling.get('captchaRequired')) {
          success = true;
          fetchMock.restore();
          poller.stop();
          done();
        }
      });

      poller = handlePolling(store);

      setTimeout(() => {
        if (!success) {
          fetchMock.restore();
          poller.stop();
          done(new Error("CAPTCHA wasn't detected"));
        }
      }, 50);
    });

    it('assigns work when work is available', function(done) {
      const workUrl = 'http://work.com';
      const store = storeWithPolling();
      fetchMock.get(pollUrl, { work_available: true, url: workUrl });

      let poller = null;
      store.subscribe(() => {
        const { worker, polling } = store.getState();
        if (worker.get('state') === 'working') {
          expect(worker.get('workUrl')).to.equal(workUrl);
          expect(polling.get('polling')).to.be.false;
          poller.stop();
          fetchMock.restore();
          done();
        }
      });

      poller = handlePolling(store);
    });

    it("doesn't assign work if the worker isn't ready", function(done) {
      const workUrl = 'http://work.com';
      const store = storeWithPolling();
      fetchMock.get(pollUrl, () => {
        store.dispatch(updateWorkerState('inactive'));
        return { work_available: true, url: workUrl };
      });

      let err = false;
      store.subscribe(() => {
        const { worker } = store.getState();
        if (worker.get('error')) {
          err = true;
          done(worker.get('error'));
        }
      });

      handlePolling(store);

      setTimeout(() => {
        if (!err) {
          done();
        }
      }, 50);
    });
  });

  describe('when polling is off', function() {
    it("doesn't poll", function(done) {
      const store = createStore(pluginApp);
      store.dispatch(setPollingInterval(1));
      store.dispatch(updateWorkerState('ready'));
      store.dispatch(stopPolling());
      let fail = false;
      let poller = null;

      fetchMock.get(pollUrl, () => {
        poller.stop();
        fetchMock.restore();
        fail = true;

        done(new Error("Shouldn't have polled because polling is off!"));
      });

      poller = handlePolling(store);
      setTimeout(() => {
        if (!fail) {
          fetchMock.restore();
          poller.stop();
          done();
        }
      }, 10);
    });
  });
});
