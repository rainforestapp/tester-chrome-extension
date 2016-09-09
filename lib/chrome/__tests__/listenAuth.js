'use strict';

var _listenAuth = require('../listenAuth');

var _listenAuth2 = _interopRequireDefault(_listenAuth);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

var _chrome = require('../__mocks__/chrome');

var _redux = require('redux');

var _reducers = require('../../reducers');

var _reducers2 = _interopRequireDefault(_reducers);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
_chai2.default.use(_sinonChai2.default);

describe('listenAuth', function () {
  describe('when it receives a message from chrome', function () {
    var auth = { auth: 'foobar', sig: 'sig' };

    var sendAuth = function sendAuth(chrome, spy) {
      chrome.sendRuntimeMessage({
        data: {
          worker_uuid: 'abc123',
          websocket_auth: auth,
          work_available_endpoint: 'http://www.work.com/'
        }
      }, spy);
    };

    it('triggers the "sent" callback', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var chrome = (0, _chrome.mockChrome)();
      var spy = _sinon2.default.spy();
      (0, _listenAuth2.default)(store, chrome);

      sendAuth(chrome, spy);

      (0, _chai.expect)(spy).to.have.been.called;
    });

    it('updates the plugin auth', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var chrome = (0, _chrome.mockChrome)();
      (0, _listenAuth2.default)(store, chrome);

      sendAuth(chrome, function () {});

      var state = store.getState();
      (0, _chai.expect)(state.worker.get('uuid')).to.equal('abc123');
      (0, _chai.expect)(state.socket.get('auth')).to.equal((0, _immutable.fromJS)(auth));
    });

    it('sets the polling endpoint', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var chrome = (0, _chrome.mockChrome)();
      (0, _listenAuth2.default)(store, chrome);

      sendAuth(chrome, function () {});

      (0, _chai.expect)(store.getState().polling.get('pollUrl')).to.equal('http://www.work.com/abc123/work_available');
    });

    it('stores the data in the chrome sync storage', function () {
      var store = (0, _redux.createStore)(_reducers2.default);
      var chrome = (0, _chrome.mockChrome)();
      (0, _listenAuth2.default)(store, chrome);

      sendAuth(chrome, function () {});

      var storage = chrome.getStorage();
      (0, _chai.expect)(storage.worker_uuid).to.equal('abc123');
      (0, _chai.expect)(storage.websocket_auth).to.equal(auth);
      (0, _chai.expect)(storage.work_available_endpoint).to.equal('http://www.work.com/');
    });
  });
});