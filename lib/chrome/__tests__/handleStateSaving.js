'use strict';

var _chrome = require('../__mocks__/chrome');

var _chai = require('chai');

var _handleStateSaving = require('../handleStateSaving');

var _handleStateSaving2 = _interopRequireDefault(_handleStateSaving);

var _redux = require('redux');

var _actions = require('../../actions');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
describe('handleStateSaving', function () {
  it("saves the worker state when it's updated", function () {
    var store = (0, _redux.createStore)(_reducers2.default);
    var chrome = (0, _chrome.mockChrome)();

    (0, _handleStateSaving2.default)(store, chrome);

    store.dispatch((0, _actions.updateWorkerState)('ready'));

    (0, _chai.expect)(chrome.getLocalStorage().workerState).to.equal('ready');
  });

  describe('when the state has been saved from before', function () {
    describe('when the worker was ready', function () {
      it('restores the state', function (done) {
        var store = (0, _redux.createStore)(_reducers2.default);
        var chrome = (0, _chrome.mockChrome)({ localStorage: { workerState: 'ready' } });

        store.subscribe(function () {
          if (store.getState().worker.get('state') === 'ready') {
            done();
          }
        });

        (0, _handleStateSaving2.default)(store, chrome);
      });
    });

    describe('when the worker was working', function () {
      it("doesn't set the state", function (done) {
        var store = (0, _redux.createStore)(_reducers2.default);
        var chrome = (0, _chrome.mockChrome)({ localStorage: { workerState: 'working' } });

        setTimeout(function () {
          var state = store.getState().worker.get('state');
          if (state === 'inactive') {
            done();
          } else {
            done(new Error('worker should have been inactive but is ' + state));
          }
        }, 20);

        (0, _handleStateSaving2.default)(store, chrome);
      });
    });
  });
});