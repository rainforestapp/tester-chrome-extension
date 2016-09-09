'use strict';

var _chrome = require('../__mocks__/chrome');

var _chai = require('chai');

var _actions = require('../../actions');

var _redux = require('redux');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _handleWork = require('../handleWork');

var _handleWork2 = _interopRequireDefault(_handleWork);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/

describe('handleWork', function () {
  describe('when work is assigned', function () {
    it('opens a tab with the work', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var chrome = (0, _chrome.mockChrome)();
      store.dispatch((0, _actions.updateWorkerState)('ready'));

      (0, _handleWork2.default)(store, chrome);

      var url = 'http://www.example.com';
      store.dispatch((0, _actions.assignWork)({ url: url }));

      var tabs = chrome.getOpenTabs();
      (0, _chai.expect)(tabs.length).to.equal(1);
      (0, _chai.expect)(tabs[0].url).to.equal(url);
    });
  });
});