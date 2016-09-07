'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mockSocket = exports.mockSocket = function mockSocket() {
  var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  return function () {
    function MockSocket(endpoint) {
      var sockOpts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, MockSocket);

      this.endpoint = endpoint;
      this.opts = sockOpts;
    }

    _createClass(MockSocket, [{
      key: 'connect',
      value: function connect() {
        return this;
      }
    }, {
      key: 'disconnect',
      value: function disconnect() {
        return this;
      }
    }, {
      key: 'onClose',
      value: function onClose() {
        return this;
      }
    }, {
      key: 'channel',
      value: function channel(name) {
        var _this = this;

        this.channelName = name;
        this.testChannel = {
          onCallbacks: {},
          join: function join() {
            return this;
          },
          receive: function receive(code, callback) {
            if (opts.joinReply === code) {
              callback();
            }

            return this;
          },

          push: function push(event, payload) {
            if (opts.pushCallback !== undefined) {
              opts.pushCallback(event, payload);
            }
            if (_this.opts.logger !== undefined) {
              _this.opts.logger('fake_send', event, payload);
            }
          },
          on: function on(event, callback) {
            this.onCallbacks[event] = callback;
          },

          // Simulate the backend pushing a message
          serverPush: function serverPush(event, payload) {
            var callback = this.onCallbacks[event];
            if (callback) {
              callback(payload);
            }
          }
        };
        return this.testChannel;
      }
    }]);

    return MockSocket;
  }();
};