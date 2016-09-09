'use strict';

var _chai = require('chai');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _redux = require('redux');

var _chrome = require('../__mocks__/chrome');

var _actions = require('../../actions');

var _renderIcon = require('../renderIcon');

var _renderIcon2 = _interopRequireDefault(_renderIcon);

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var storeWithWorkerState = function storeWithWorkerState(state) {
  var store = (0, _redux.createStore)(_reducers2.default);
  store.dispatch((0, _actions.updateWorkerState)(state));

  return store;
}; /*
     eslint-disable prefer-arrow-callback,
     func-names,
     space-before-function-paren,
     no-unused-expressions
   */


var greyIconPath = _constants.CONFIG.chrome.greyIcon.path;
var greenIconPath = _constants.CONFIG.chrome.colorIcon.path;

describe('renderIcon', function () {
  describe('color', function () {
    describe('when the socket is disconnected', function () {
      it('is grey regardless of worker state', function () {
        var store = (0, _redux.createStore)(_reducers2.default);
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        store.dispatch((0, _actions.authFailed)());

        (0, _chai.expect)(chrome.getIcon().path).to.equal(greyIconPath);

        store.dispatch((0, _actions.updateWorkerState)('ready'));

        (0, _chai.expect)(chrome.getIcon().path).to.equal(greyIconPath);
      });
    });

    describe('when the socket is connected', function () {
      var connectedStoreWithWorkerState = function connectedStoreWithWorkerState(state) {
        var store = (0, _redux.createStore)(_reducers2.default);
        store.dispatch((0, _actions.connect)());
        store.dispatch((0, _actions.updateWorkerState)(state));

        return store;
      };

      describe('when the worker is inactive', function () {
        it('is grey', function () {
          var store = connectedStoreWithWorkerState('inactive');
          var chrome = (0, _chrome.mockChrome)();

          (0, _renderIcon2.default)(store, chrome);

          (0, _chai.expect)(chrome.getIcon().path).to.equal(greyIconPath);
        });
      });

      describe('when the worker is ready', function () {
        it('is green', function () {
          var store = connectedStoreWithWorkerState('ready');
          var chrome = (0, _chrome.mockChrome)();

          (0, _renderIcon2.default)(store, chrome);

          (0, _chai.expect)(chrome.getIcon().path).to.equal(greenIconPath);
        });
      });

      describe('when the worker is working', function () {
        var storeWithWorkingWorker = function storeWithWorkingWorker() {
          var store = connectedStoreWithWorkerState('ready');
          store.dispatch((0, _actions.assignWork)({ url: 'http://www.example.com' }));

          return store;
        };

        describe('when the worker wants more work', function () {
          it('is green', function () {
            var store = storeWithWorkingWorker();
            (0, _chai.expect)(store.getState().worker.get('wantsMoreWork')).to.be.true;
            var chrome = (0, _chrome.mockChrome)();

            (0, _renderIcon2.default)(store, chrome);

            (0, _chai.expect)(chrome.getIcon().path).to.equal(greenIconPath);
          });
        });

        describe("when the worker doesn't want more work", function () {
          it('is grey', function () {
            var store = storeWithWorkingWorker();
            store.dispatch((0, _actions.iconClicked)());
            (0, _chai.expect)(store.getState().worker.get('wantsMoreWork')).to.be.false;
            var chrome = (0, _chrome.mockChrome)();

            (0, _renderIcon2.default)(store, chrome);

            (0, _chai.expect)(chrome.getIcon().path).to.equal(greyIconPath);
          });
        });
      });
    });
  });

  describe('badge', function () {
    describe('when the worker is working', function () {
      it('is green and says IN P', function () {
        var store = storeWithWorkerState('working');
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        var badge = chrome.getBadge();
        (0, _chai.expect)(badge.text).to.equal('WORK');
        (0, _chai.expect)(badge.color).to.equal(_constants.colors.GREEN);
      });
    });

    describe('when the worker is inactive', function () {
      it('is blank', function () {
        var store = storeWithWorkerState('inactive');
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        (0, _chai.expect)(chrome.getBadge().text).to.equal('');
      });
    });

    describe('when the worker is ready', function () {
      it('is blank', function () {
        var store = storeWithWorkerState('ready');
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        (0, _chai.expect)(chrome.getBadge().text).to.equal('');
      });
    });
  });

  describe('click handling', function () {
    it('toggles between worker states active and inactive', function () {
      var store = storeWithWorkerState('inactive');
      var chrome = (0, _chrome.mockChrome)();

      (0, _renderIcon2.default)(store, chrome);

      chrome.clickIcon();

      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('ready');

      chrome.clickIcon();

      (0, _chai.expect)(store.getState().worker.get('state')).to.equal('inactive');
    });

    describe('when the worker is working', function () {
      it('toggles whether the worker wants more work', function () {
        var store = storeWithWorkerState('working');
        var chrome = (0, _chrome.mockChrome)();

        (0, _renderIcon2.default)(store, chrome);

        chrome.clickIcon();

        (0, _chai.expect)(store.getState().worker.get('wantsMoreWork')).to.be.false;

        chrome.clickIcon();

        (0, _chai.expect)(store.getState().worker.get('wantsMoreWork')).to.be.true;
      });
    });
  });
});