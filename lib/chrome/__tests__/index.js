'use strict';

var _ = require('..');

var _chrome = require('../__mocks__/chrome');

var _mocks__ = require('../../socket/__mocks__');

var _chai = require('chai');

var _immutable = require('immutable');

describe('startChromePlugin', function () {
  it('listens for authentication', function () {
    var chrome = (0, _chrome.mockChrome)();
    (0, _.startChromePlugin)(null, null, chrome, undefined, (0, _mocks__.mockSocket)());
    (0, _chai.expect)(chrome.getNumMessageListeners());
  });

  describe('when the user is unauthenticated', function () {
    it('marks the socket as unauthenticated', function () {
      var chrome = (0, _chrome.mockChrome)();
      var plugin = (0, _.startChromePlugin)(null, null, chrome, undefined, (0, _mocks__.mockSocket)());
      var store = plugin.getStore();
      (0, _chai.expect)(store.getState().socket.get('state')).to.equal('unauthenticated');
    });
  });

  describe('when the user is already authenticated', function () {
    it('authenticates and connects', function () {
      var auth = {
        workerUUID: 'abc123',
        socketAuth: {
          auth: 'SEKRET',
          sig: 'SIG'
        }
      };
      var chrome = (0, _chrome.mockChrome)({ storage: { websocket_auth: auth } });
      var socketConstructor = (0, _mocks__.mockSocket)({ joinReply: 'ok' });

      var plugin = (0, _.startChromePlugin)(auth, null, chrome, undefined, socketConstructor);
      var store = plugin.getStore();

      (0, _chai.expect)(store.getState().socket.get('state')).to.equal('connected');
    });
  });

  describe('when the poll url is specified', function () {
    it('sets the poll url', function () {
      var chrome = (0, _chrome.mockChrome)();
      var url = 'http://www.work.com';

      var plugin = (0, _.startChromePlugin)(null, url, chrome);
      var store = plugin.getStore();

      (0, _chai.expect)(store.getState().polling.get('pollUrl')).to.equal(url);
    });
  });

  it("sets the worker's user profile", function (done) {
    var profileUserInfo = { email: 'bob@example.com', id: 'abc123' };
    var chrome = (0, _chrome.mockChrome)({ profileUserInfo: profileUserInfo });

    var plugin = (0, _.startChromePlugin)(null, null, chrome);
    var store = plugin.getStore();

    store.subscribe(function () {
      var profile = store.getState().worker.get('profileInfo');
      if (profile && profile.equals((0, _immutable.fromJS)(profileUserInfo))) {
        done();
      }
    });
  });
}); /*
     eslint-disable prefer-arrow-callback,
     func-names,
     space-before-function-paren,
     no-unused-expressions
    */