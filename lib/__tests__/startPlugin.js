'use strict';

var _chai = require('chai');

var _immutable = require('immutable');

var _ = require('..');

var _mocks__ = require('../socket/__mocks__');

/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/
describe('startPlugin', function () {
  it('returns the store', function () {
    var plugin = (0, _.startPlugin)({});
    (0, _chai.expect)(plugin.getStore()).to.not.be.null;
  });

  it('authenticates if auth exists', function () {
    var workerUUID = 'abc123';
    var socketAuth = { auth: 'SEKRET', sig: 'SEKRETSIG' };
    var auth = { workerUUID: workerUUID, socketAuth: socketAuth };

    var plugin = (0, _.startPlugin)({ auth: auth, socketConstructor: (0, _mocks__.mockSocket)() });
    var state = plugin.getStore().getState();
    (0, _chai.expect)(state.worker.get('uuid')).to.equal(workerUUID);
    (0, _chai.expect)(state.socket.get('auth')).to.equal((0, _immutable.fromJS)(socketAuth));
  });

  it("sets pollUrl if it's provided", function () {
    var pollUrl = 'http://work.com';
    var plugin = (0, _.startPlugin)({ pollUrl: pollUrl });
    var state = plugin.getStore().getState();

    (0, _chai.expect)(state.polling.get('pollUrl')).to.equal(pollUrl);
  });
});