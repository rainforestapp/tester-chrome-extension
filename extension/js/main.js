(function () {
  'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers;

  // Phoenix Channels JavaScript client
  //
  // ## Socket Connection
  //
  // A single connection is established to the server and
  // channels are mulitplexed over the connection.
  // Connect to the server using the `Socket` class:
  //
  //     let socket = new Socket("/ws", {params: {userToken: "123"}})
  //     socket.connect()
  //
  // The `Socket` constructor takes the mount point of the socket,
  // the authentication params, as well as options that can be found in
  // the Socket docs, such as configuring the `LongPoll` transport, and
  // heartbeat.
  //
  // ## Channels
  //
  // Channels are isolated, concurrent processes on the server that
  // subscribe to topics and broker events between the client and server.
  // To join a channel, you must provide the topic, and channel params for
  // authorization. Here's an example chat room example where `"new_msg"`
  // events are listened for, messages are pushed to the server, and
  // the channel is joined with ok/error/timeout matches:
  //
  //     let channel = socket.channel("rooms:123", {token: roomToken})
  //     channel.on("new_msg", msg => console.log("Got message", msg) )
  //     $input.onEnter( e => {
  //       channel.push("new_msg", {body: e.target.val}, 10000)
  //        .receive("ok", (msg) => console.log("created message", msg) )
  //        .receive("error", (reasons) => console.log("create failed", reasons) )
  //        .receive("timeout", () => console.log("Networking issue...") )
  //     })
  //     channel.join()
  //       .receive("ok", ({messages}) => console.log("catching up", messages) )
  //       .receive("error", ({reason}) => console.log("failed join", reason) )
  //       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
  //
  //
  // ## Joining
  //
  // Creating a channel with `socket.channel(topic, params)`, binds the params to
  // `channel.params`, which are sent up on `channel.join()`.
  // Subsequent rejoins will send up the modified params for
  // updating authorization params, or passing up last_message_id information.
  // Successful joins receive an "ok" status, while unsuccessful joins
  // receive "error".
  //
  //
  // ## Pushing Messages
  //
  // From the previous example, we can see that pushing messages to the server
  // can be done with `channel.push(eventName, payload)` and we can optionally
  // receive responses from the push. Additionally, we can use
  // `receive("timeout", callback)` to abort waiting for our other `receive` hooks
  //  and take action after some period of waiting. The default timeout is 5000ms.
  //
  //
  // ## Socket Hooks
  //
  // Lifecycle events of the multiplexed connection can be hooked into via
  // `socket.onError()` and `socket.onClose()` events, ie:
  //
  //     socket.onError( () => console.log("there was an error with the connection!") )
  //     socket.onClose( () => console.log("the connection dropped") )
  //
  //
  // ## Channel Hooks
  //
  // For each joined channel, you can bind to `onError` and `onClose` events
  // to monitor the channel lifecycle, ie:
  //
  //     channel.onError( () => console.log("there was an error!") )
  //     channel.onClose( () => console.log("the channel has gone away gracefully") )
  //
  // ### onError hooks
  //
  // `onError` hooks are invoked if the socket connection drops, or the channel
  // crashes on the server. In either case, a channel rejoin is attemtped
  // automatically in an exponential backoff manner.
  //
  // ### onClose hooks
  //
  // `onClose` hooks are invoked only in two cases. 1) the channel explicitly
  // closed on the server, or 2). The client explicitly closed, by calling
  // `channel.leave()`
  //

  var VSN = "1.0.0";
  var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
  var DEFAULT_TIMEOUT = 10000;
  var CHANNEL_STATES = {
    closed: "closed",
    errored: "errored",
    joined: "joined",
    joining: "joining"
  };
  var CHANNEL_EVENTS = {
    close: "phx_close",
    error: "phx_error",
    join: "phx_join",
    reply: "phx_reply",
    leave: "phx_leave"
  };
  var TRANSPORTS = {
    longpoll: "longpoll",
    websocket: "websocket"
  };

  var Push = function () {

    // Initializes the Push
    //
    // channel - The Channel
    // event - The event, for example `"phx_join"`
    // payload - The payload, for example `{user_id: 123}`
    // timeout - The push timeout in milliseconds
    //

    function Push(channel, event, payload, timeout) {
      babelHelpers.classCallCheck(this, Push);

      this.channel = channel;
      this.event = event;
      this.payload = payload || {};
      this.receivedResp = null;
      this.timeout = timeout;
      this.timeoutTimer = null;
      this.recHooks = [];
      this.sent = false;
    }

    babelHelpers.createClass(Push, [{
      key: "resend",
      value: function resend(timeout) {
        this.timeout = timeout;
        this.cancelRefEvent();
        this.ref = null;
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
      }
    }, {
      key: "send",
      value: function send() {
        if (this.hasReceived("timeout")) {
          return;
        }
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
          topic: this.channel.topic,
          event: this.event,
          payload: this.payload,
          ref: this.ref
        });
      }
    }, {
      key: "receive",
      value: function receive(status, callback) {
        if (this.hasReceived(status)) {
          callback(this.receivedResp.response);
        }

        this.recHooks.push({ status: status, callback: callback });
        return this;
      }

      // private

    }, {
      key: "matchReceive",
      value: function matchReceive(_ref) {
        var status = _ref.status;
        var response = _ref.response;
        var ref = _ref.ref;

        this.recHooks.filter(function (h) {
          return h.status === status;
        }).forEach(function (h) {
          return h.callback(response);
        });
      }
    }, {
      key: "cancelRefEvent",
      value: function cancelRefEvent() {
        if (!this.refEvent) {
          return;
        }
        this.channel.off(this.refEvent);
      }
    }, {
      key: "cancelTimeout",
      value: function cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = null;
      }
    }, {
      key: "startTimeout",
      value: function startTimeout() {
        var _this = this;

        if (this.timeoutTimer) {
          return;
        }
        this.ref = this.channel.socket.makeRef();
        this.refEvent = this.channel.replyEventName(this.ref);

        this.channel.on(this.refEvent, function (payload) {
          _this.cancelRefEvent();
          _this.cancelTimeout();
          _this.receivedResp = payload;
          _this.matchReceive(payload);
        });

        this.timeoutTimer = setTimeout(function () {
          _this.trigger("timeout", {});
        }, this.timeout);
      }
    }, {
      key: "hasReceived",
      value: function hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
      }
    }, {
      key: "trigger",
      value: function trigger(status, response) {
        this.channel.trigger(this.refEvent, { status: status, response: response });
      }
    }]);
    return Push;
  }();

  var Channel = function () {
    function Channel(topic, params, socket) {
      var _this2 = this;

      babelHelpers.classCallCheck(this, Channel);

      this.state = CHANNEL_STATES.closed;
      this.topic = topic;
      this.params = params || {};
      this.socket = socket;
      this.bindings = [];
      this.timeout = this.socket.timeout;
      this.joinedOnce = false;
      this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
      this.pushBuffer = [];
      this.rejoinTimer = new Timer(function () {
        return _this2.rejoinUntilConnected();
      }, this.socket.reconnectAfterMs);
      this.joinPush.receive("ok", function () {
        _this2.state = CHANNEL_STATES.joined;
        _this2.rejoinTimer.reset();
        _this2.pushBuffer.forEach(function (pushEvent) {
          return pushEvent.send();
        });
        _this2.pushBuffer = [];
      });
      this.onClose(function () {
        _this2.socket.log("channel", "close " + _this2.topic);
        _this2.state = CHANNEL_STATES.closed;
        _this2.socket.remove(_this2);
      });
      this.onError(function (reason) {
        _this2.socket.log("channel", "error " + _this2.topic, reason);
        _this2.state = CHANNEL_STATES.errored;
        _this2.rejoinTimer.scheduleTimeout();
      });
      this.joinPush.receive("timeout", function () {
        if (_this2.state !== CHANNEL_STATES.joining) {
          return;
        }

        _this2.socket.log("channel", "timeout " + _this2.topic, _this2.joinPush.timeout);
        _this2.state = CHANNEL_STATES.errored;
        _this2.rejoinTimer.scheduleTimeout();
      });
      this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
        _this2.trigger(_this2.replyEventName(ref), payload);
      });
    }

    babelHelpers.createClass(Channel, [{
      key: "rejoinUntilConnected",
      value: function rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) {
          this.rejoin();
        }
      }
    }, {
      key: "join",
      value: function join() {
        var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

        if (this.joinedOnce) {
          throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
        } else {
          this.joinedOnce = true;
        }
        this.rejoin(timeout);
        return this.joinPush;
      }
    }, {
      key: "onClose",
      value: function onClose(callback) {
        this.on(CHANNEL_EVENTS.close, callback);
      }
    }, {
      key: "onError",
      value: function onError(callback) {
        this.on(CHANNEL_EVENTS.error, function (reason) {
          return callback(reason);
        });
      }
    }, {
      key: "on",
      value: function on(event, callback) {
        this.bindings.push({ event: event, callback: callback });
      }
    }, {
      key: "off",
      value: function off(event) {
        this.bindings = this.bindings.filter(function (bind) {
          return bind.event !== event;
        });
      }
    }, {
      key: "canPush",
      value: function canPush() {
        return this.socket.isConnected() && this.state === CHANNEL_STATES.joined;
      }
    }, {
      key: "push",
      value: function push(event, payload) {
        var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.timeout : arguments[2];

        if (!this.joinedOnce) {
          throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
        }
        var pushEvent = new Push(this, event, payload, timeout);
        if (this.canPush()) {
          pushEvent.send();
        } else {
          pushEvent.startTimeout();
          this.pushBuffer.push(pushEvent);
        }

        return pushEvent;
      }

      // Leaves the channel
      //
      // Unsubscribes from server events, and
      // instructs channel to terminate on server
      //
      // Triggers onClose() hooks
      //
      // To receive leave acknowledgements, use the a `receive`
      // hook to bind to the server ack, ie:
      //
      //     channel.leave().receive("ok", () => alert("left!") )
      //

    }, {
      key: "leave",
      value: function leave() {
        var _this3 = this;

        var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

        var onClose = function onClose() {
          _this3.socket.log("channel", "leave " + _this3.topic);
          _this3.trigger(CHANNEL_EVENTS.close, "leave");
        };
        var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
        leavePush.receive("ok", function () {
          return onClose();
        }).receive("timeout", function () {
          return onClose();
        });
        leavePush.send();
        if (!this.canPush()) {
          leavePush.trigger("ok", {});
        }

        return leavePush;
      }

      // Overridable message hook
      //
      // Receives all events for specialized message handling

    }, {
      key: "onMessage",
      value: function onMessage(event, payload, ref) {}

      // private

    }, {
      key: "isMember",
      value: function isMember(topic) {
        return this.topic === topic;
      }
    }, {
      key: "sendJoin",
      value: function sendJoin(timeout) {
        this.state = CHANNEL_STATES.joining;
        this.joinPush.resend(timeout);
      }
    }, {
      key: "rejoin",
      value: function rejoin() {
        var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];
        this.sendJoin(timeout);
      }
    }, {
      key: "trigger",
      value: function trigger(triggerEvent, payload, ref) {
        this.onMessage(triggerEvent, payload, ref);
        this.bindings.filter(function (bind) {
          return bind.event === triggerEvent;
        }).map(function (bind) {
          return bind.callback(payload, ref);
        });
      }
    }, {
      key: "replyEventName",
      value: function replyEventName(ref) {
        return "chan_reply_" + ref;
      }
    }]);
    return Channel;
  }();

  var Socket = function () {

    // Initializes the Socket
    //
    // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
    //                                               "wss://example.com"
    //                                               "/ws" (inherited host & protocol)
    // opts - Optional configuration
    //   transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
    //               Defaults to WebSocket with automatic LongPoll fallback.
    //   timeout - The default timeout in milliseconds to trigger push timeouts.
    //             Defaults `DEFAULT_TIMEOUT`
    //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
    //   reconnectAfterMs - The optional function that returns the millsec
    //                      reconnect interval. Defaults to stepped backoff of:
    //
    //     function(tries){
    //       return [1000, 5000, 10000][tries - 1] || 10000
    //     }
    //
    //   logger - The optional function for specialized logging, ie:
    //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
    //
    //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
    //                        Defaults to 20s (double the server long poll timer).
    //
    //   params - The optional params to pass when connecting
    //
    // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
    //

    function Socket(endPoint) {
      var _this4 = this;

      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      babelHelpers.classCallCheck(this, Socket);

      this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
      this.channels = [];
      this.sendBuffer = [];
      this.ref = 0;
      this.timeout = opts.timeout || DEFAULT_TIMEOUT;
      this.transport = opts.transport || window.WebSocket || LongPoll;
      this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
      this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
        return [1000, 2000, 5000, 10000][tries - 1] || 10000;
      };
      this.logger = opts.logger || function () {}; // noop
      this.longpollerTimeout = opts.longpollerTimeout || 20000;
      this.params = opts.params || {};
      this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
      this.reconnectTimer = new Timer(function () {
        _this4.disconnect(function () {
          return _this4.connect();
        });
      }, this.reconnectAfterMs);
    }

    babelHelpers.createClass(Socket, [{
      key: "protocol",
      value: function protocol() {
        return location.protocol.match(/^https/) ? "wss" : "ws";
      }
    }, {
      key: "endPointURL",
      value: function endPointURL() {
        var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
        if (uri.charAt(0) !== "/") {
          return uri;
        }
        if (uri.charAt(1) === "/") {
          return this.protocol() + ":" + uri;
        }

        return this.protocol() + "://" + location.host + uri;
      }
    }, {
      key: "disconnect",
      value: function disconnect(callback, code, reason) {
        if (this.conn) {
          this.conn.onclose = function () {}; // noop
          if (code) {
            this.conn.close(code, reason || "");
          } else {
            this.conn.close();
          }
          this.conn = null;
        }
        callback && callback();
      }

      // params - The params to send when connecting, for example `{user_id: userToken}`

    }, {
      key: "connect",
      value: function connect(params) {
        var _this5 = this;

        if (params) {
          console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
          this.params = params;
        }
        if (this.conn) {
          return;
        }

        this.conn = new this.transport(this.endPointURL());
        this.conn.timeout = this.longpollerTimeout;
        this.conn.onopen = function () {
          return _this5.onConnOpen();
        };
        this.conn.onerror = function (error) {
          return _this5.onConnError(error);
        };
        this.conn.onmessage = function (event) {
          return _this5.onConnMessage(event);
        };
        this.conn.onclose = function (event) {
          return _this5.onConnClose(event);
        };
      }

      // Logs the message. Override `this.logger` for specialized logging. noops by default

    }, {
      key: "log",
      value: function log(kind, msg, data) {
        this.logger(kind, msg, data);
      }

      // Registers callbacks for connection state change events
      //
      // Examples
      //
      //    socket.onError(function(error){ alert("An error occurred") })
      //

    }, {
      key: "onOpen",
      value: function onOpen(callback) {
        this.stateChangeCallbacks.open.push(callback);
      }
    }, {
      key: "onClose",
      value: function onClose(callback) {
        this.stateChangeCallbacks.close.push(callback);
      }
    }, {
      key: "onError",
      value: function onError(callback) {
        this.stateChangeCallbacks.error.push(callback);
      }
    }, {
      key: "onMessage",
      value: function onMessage(callback) {
        this.stateChangeCallbacks.message.push(callback);
      }
    }, {
      key: "onConnOpen",
      value: function onConnOpen() {
        var _this6 = this;

        this.log("transport", "connected to " + this.endPointURL(), this.transport.prototype);
        this.flushSendBuffer();
        this.reconnectTimer.reset();
        if (!this.conn.skipHeartbeat) {
          clearInterval(this.heartbeatTimer);
          this.heartbeatTimer = setInterval(function () {
            return _this6.sendHeartbeat();
          }, this.heartbeatIntervalMs);
        }
        this.stateChangeCallbacks.open.forEach(function (callback) {
          return callback();
        });
      }
    }, {
      key: "onConnClose",
      value: function onConnClose(event) {
        this.log("transport", "close", event);
        this.triggerChanError();
        clearInterval(this.heartbeatTimer);
        this.reconnectTimer.scheduleTimeout();
        this.stateChangeCallbacks.close.forEach(function (callback) {
          return callback(event);
        });
      }
    }, {
      key: "onConnError",
      value: function onConnError(error) {
        this.log("transport", error);
        this.triggerChanError();
        this.stateChangeCallbacks.error.forEach(function (callback) {
          return callback(error);
        });
      }
    }, {
      key: "triggerChanError",
      value: function triggerChanError() {
        this.channels.forEach(function (channel) {
          return channel.trigger(CHANNEL_EVENTS.error);
        });
      }
    }, {
      key: "connectionState",
      value: function connectionState() {
        switch (this.conn && this.conn.readyState) {
          case SOCKET_STATES.connecting:
            return "connecting";
          case SOCKET_STATES.open:
            return "open";
          case SOCKET_STATES.closing:
            return "closing";
          default:
            return "closed";
        }
      }
    }, {
      key: "isConnected",
      value: function isConnected() {
        return this.connectionState() === "open";
      }
    }, {
      key: "remove",
      value: function remove(channel) {
        this.channels = this.channels.filter(function (c) {
          return !c.isMember(channel.topic);
        });
      }
    }, {
      key: "channel",
      value: function channel(topic) {
        var chanParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        var chan = new Channel(topic, chanParams, this);
        this.channels.push(chan);
        return chan;
      }
    }, {
      key: "push",
      value: function push(data) {
        var _this7 = this;

        var topic = data.topic;
        var event = data.event;
        var payload = data.payload;
        var ref = data.ref;

        var callback = function callback() {
          return _this7.conn.send(JSON.stringify(data));
        };
        this.log("push", topic + " " + event + " (" + ref + ")", payload);
        if (this.isConnected()) {
          callback();
        } else {
          this.sendBuffer.push(callback);
        }
      }

      // Return the next message ref, accounting for overflows

    }, {
      key: "makeRef",
      value: function makeRef() {
        var newRef = this.ref + 1;
        if (newRef === this.ref) {
          this.ref = 0;
        } else {
          this.ref = newRef;
        }

        return this.ref.toString();
      }
    }, {
      key: "sendHeartbeat",
      value: function sendHeartbeat() {
        if (!this.isConnected()) {
          return;
        }
        this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
      }
    }, {
      key: "flushSendBuffer",
      value: function flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
          this.sendBuffer.forEach(function (callback) {
            return callback();
          });
          this.sendBuffer = [];
        }
      }
    }, {
      key: "onConnMessage",
      value: function onConnMessage(rawMessage) {
        var msg = JSON.parse(rawMessage.data);
        var topic = msg.topic;
        var event = msg.event;
        var payload = msg.payload;
        var ref = msg.ref;

        this.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
        this.channels.filter(function (channel) {
          return channel.isMember(topic);
        }).forEach(function (channel) {
          return channel.trigger(event, payload, ref);
        });
        this.stateChangeCallbacks.message.forEach(function (callback) {
          return callback(msg);
        });
      }
    }]);
    return Socket;
  }();

  var LongPoll = function () {
    function LongPoll(endPoint) {
      babelHelpers.classCallCheck(this, LongPoll);

      this.endPoint = null;
      this.token = null;
      this.skipHeartbeat = true;
      this.onopen = function () {}; // noop
      this.onerror = function () {}; // noop
      this.onmessage = function () {}; // noop
      this.onclose = function () {}; // noop
      this.pollEndpoint = this.normalizeEndpoint(endPoint);
      this.readyState = SOCKET_STATES.connecting;

      this.poll();
    }

    babelHelpers.createClass(LongPoll, [{
      key: "normalizeEndpoint",
      value: function normalizeEndpoint(endPoint) {
        return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
      }
    }, {
      key: "endpointURL",
      value: function endpointURL() {
        return Ajax.appendParams(this.pollEndpoint, { token: this.token });
      }
    }, {
      key: "closeAndRetry",
      value: function closeAndRetry() {
        this.close();
        this.readyState = SOCKET_STATES.connecting;
      }
    }, {
      key: "ontimeout",
      value: function ontimeout() {
        this.onerror("timeout");
        this.closeAndRetry();
      }
    }, {
      key: "poll",
      value: function poll() {
        var _this8 = this;

        if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
          return;
        }

        Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
          if (resp) {
            var status = resp.status;
            var token = resp.token;
            var messages = resp.messages;

            _this8.token = token;
          } else {
            var status = 0;
          }

          switch (status) {
            case 200:
              messages.forEach(function (msg) {
                return _this8.onmessage({ data: JSON.stringify(msg) });
              });
              _this8.poll();
              break;
            case 204:
              _this8.poll();
              break;
            case 410:
              _this8.readyState = SOCKET_STATES.open;
              _this8.onopen();
              _this8.poll();
              break;
            case 0:
            case 500:
              _this8.onerror();
              _this8.closeAndRetry();
              break;
            default:
              throw "unhandled poll status " + status;
          }
        });
      }
    }, {
      key: "send",
      value: function send(body) {
        var _this9 = this;

        Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
          if (!resp || resp.status !== 200) {
            _this9.onerror(status);
            _this9.closeAndRetry();
          }
        });
      }
    }, {
      key: "close",
      value: function close(code, reason) {
        this.readyState = SOCKET_STATES.closed;
        this.onclose();
      }
    }]);
    return LongPoll;
  }();

  var Ajax = function () {
    function Ajax() {
      babelHelpers.classCallCheck(this, Ajax);
    }

    babelHelpers.createClass(Ajax, null, [{
      key: "request",
      value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
        if (window.XDomainRequest) {
          var req = new XDomainRequest(); // IE8, IE9
          this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
        } else {
          var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
          new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
          this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
        }
      }
    }, {
      key: "xdomainRequest",
      value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
        var _this10 = this;

        req.timeout = timeout;
        req.open(method, endPoint);
        req.onload = function () {
          var response = _this10.parseJSON(req.responseText);
          callback && callback(response);
        };
        if (ontimeout) {
          req.ontimeout = ontimeout;
        }

        // Work around bug in IE9 that requires an attached onprogress handler
        req.onprogress = function () {};

        req.send(body);
      }
    }, {
      key: "xhrRequest",
      value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
        var _this11 = this;

        req.timeout = timeout;
        req.open(method, endPoint, true);
        req.setRequestHeader("Content-Type", accept);
        req.onerror = function () {
          callback && callback(null);
        };
        req.onreadystatechange = function () {
          if (req.readyState === _this11.states.complete && callback) {
            var response = _this11.parseJSON(req.responseText);
            callback(response);
          }
        };
        if (ontimeout) {
          req.ontimeout = ontimeout;
        }

        req.send(body);
      }
    }, {
      key: "parseJSON",
      value: function parseJSON(resp) {
        return resp && resp !== "" ? JSON.parse(resp) : null;
      }
    }, {
      key: "serialize",
      value: function serialize(obj, parentKey) {
        var queryStr = [];
        for (var key in obj) {
          if (!obj.hasOwnProperty(key)) {
            continue;
          }
          var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
          var paramVal = obj[key];
          if ((typeof paramVal === "undefined" ? "undefined" : babelHelpers.typeof(paramVal)) === "object") {
            queryStr.push(this.serialize(paramVal, paramKey));
          } else {
            queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
          }
        }
        return queryStr.join("&");
      }
    }, {
      key: "appendParams",
      value: function appendParams(url, params) {
        if (Object.keys(params).length === 0) {
          return url;
        }

        var prefix = url.match(/\?/) ? "&" : "?";
        return "" + url + prefix + this.serialize(params);
      }
    }]);
    return Ajax;
  }();

  Ajax.states = { complete: 4 };

  // Creates a timer that accepts a `timerCalc` function to perform
  // calculated timeout retries, such as exponential backoff.
  //
  // ## Examples
  //
  //    let reconnectTimer = new Timer(() => this.connect(), function(tries){
  //      return [1000, 5000, 10000][tries - 1] || 10000
  //    })
  //    reconnectTimer.scheduleTimeout() // fires after 1000
  //    reconnectTimer.scheduleTimeout() // fires after 5000
  //    reconnectTimer.reset()
  //    reconnectTimer.scheduleTimeout() // fires after 1000
  //

  var Timer = function () {
    function Timer(callback, timerCalc) {
      babelHelpers.classCallCheck(this, Timer);

      this.callback = callback;
      this.timerCalc = timerCalc;
      this.timer = null;
      this.tries = 0;
    }

    babelHelpers.createClass(Timer, [{
      key: "reset",
      value: function reset() {
        this.tries = 0;
        clearTimeout(this.timer);
      }

      // Cancels any previous scheduleTimeout and schedules callback

    }, {
      key: "scheduleTimeout",
      value: function scheduleTimeout() {
        var _this12 = this;

        clearTimeout(this.timer);

        this.timer = setTimeout(function () {
          _this12.tries = _this12.tries + 1;
          _this12.callback();
        }, this.timerCalc(this.tries + 1));
      }
    }]);
    return Timer;
  }();

  var SchruteConn = function () {
    function SchruteConn(endpoint, workerUUID, authParams) {
      babelHelpers.classCallCheck(this, SchruteConn);

      this.workerUUID = workerUUID;
      this.socket = new Socket(endpoint, {
        params: authParams,
        logger: function logger(kind, msg, data) {
          console.log(kind + ': ' + msg, data);
        }
      });
    }

    babelHelpers.createClass(SchruteConn, [{
      key: 'start',
      value: function start() {
        this.socket.connect();
        this.channel = this.socket.channel('workers:' + this.workerUUID);
        this.channel.join().receive('ok', function (resp) {
          console.log('Joined successfully', resp);
        }).receive('error', function (resp) {
          console.log('Unable to join', resp);
        });
      }
    }]);
    return SchruteConn;
  }();

  var RED = [255, 0, 0, 230];
  var GREEN = [0, 255, 0, 230];
  var GREY = [0, 0, 0, 230];
  var BASE_URL = 'https://portal.rainforestqa.com';
  var WORK_AVAILABLE_URL = BASE_URL + '/api/1/testers/';
  var DEFAULT_INTERVAL = 8 * 1000;

  var websocketConn = undefined;
  var timeout = undefined;

  // Set polling interval in milliseconds (note, this is rate limted,
  // so if you change agressively, it will error)
  var checkForWorkInterval = DEFAULT_INTERVAL;

  // Start disabled: require the tester to enable if they want to
  // work when the browser starts
  var appState = {
    tester_state: 'active',
    work_available_endpoint: WORK_AVAILABLE_URL,
    email: '',
    profileUrl: '',
    id: '',
    workTab: null,
    isPolling: false
  };

  var notifications = {
    notLoggedIn: {
      iconUrl: 'icons/icon_notification.png',
      isClickable: true,
      type: 'basic',
      title: "You're not logged in",
      message: 'You don\'t seem to be logged in to rainforest, click here to go to your profile and log in'
    }
  };

  function setupChromeEvents() {
    var manifest = chrome.runtime.getManifest();
    app.appState.version = manifest.version;
    app.appState.profileUrl = BASE_URL + '/profile?version=' + manifest.version;

    chrome.notifications.onClicked.addListener(function (notificationId) {
      if (notificationId === 'not_logged_in') {
        makeNewSyncTab();
        chrome.notifications.clear('not_logged_in');
      }
    });

    // Load the initial id value from storage
    chrome.storage.sync.get('worker_uuid', function (data) {
      // Notify that we saved.
      if (data.worker_uuid !== undefined) {
        app.appState.uuid = data.worker_uuid;
        app.togglePolling(app.appState.isPolling);
      } else {
        notifyNotLoggedIn();
      }
    });

    //
    // Load the initial api endpoint value from storage
    //
    chrome.storage.sync.get('work_available_endpoint', function (data) {
      // Notify that we saved.
      if (data.work_available_endpoint !== undefined) {
        app.appState.work_available_endpoint = data.work_available_endpoint;
        app.togglePolling(app.appState.isPolling);
      } else {
        notifyNotLoggedIn();
      }
    });

    chrome.storage.sync.get(['worker_uuid', 'websocket_endpoint', 'websocket_auth'], function (data) {
      startWebsocket(data);
    });

    // Handle the icon being clicked
    //
    // this enables or disables checking for new work
    //
    chrome.browserAction.onClicked.addListener(function () {
      app.appState.isPolling = !app.appState.isPolling;
      app.togglePolling(app.appState.isPolling);
    });

    // Handle data coming from the main site
    chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
      if (request.data && request.data.worker_uuid && request.data.work_available_endpoint) {
        app.startApp(request, sendResponse);
      }
    });

    // Get user information
    chrome.identity.getProfileUserInfo(function (info) {
      app.appState.email = info.email;
      app.appState.id = info.id;
    });

    // Get idle checking - this drops the polling rate
    // for "inactive" users (i.e. when AFK)

    var shutOffTimer = undefined;
    chrome.idle.setDetectionInterval(DEFAULT_INTERVAL * 3 / 1000);
    chrome.idle.onStateChanged.addListener(function (state) {
      app.appState.tester_state = state;
      if (state === 'idle') {
        checkForWorkInterval = DEFAULT_INTERVAL * 10;
        shutOffTimer = setTimeout(function () {
          if (app.appState.tester_state === 'idle') {
            app.appState.isPolling = false;
            app.togglePolling(app.appState.isPolling);
          }
        }, DEFAULT_INTERVAL * 45);
      } else if (state === 'active') {
        clearTimeout(shutOffTimer);
        checkForWorkInterval = DEFAULT_INTERVAL;
      }
    });
  }

  function startApp(request, sendResponse) {
    app.appState.uuid = request.data.worker_uuid;
    app.appState.work_available_endpoint = request.data.work_available_endpoint;

    app.togglePolling(app.appState.isPolling);

    // comment this out in dev mode
    if (sendResponse) {
      sendResponse({ ok: true });
    }

    chrome.storage.sync.set({
      worker_uuid: request.data.worker_uuid,
      work_available_endpoint: request.data.work_available_endpoint,
      websocket_endpoint: request.data.websocket_endpoint,
      websocket_auth: request.data.websocket_auth
    });

    startWebsocket(request.data);
  }

  function startWebsocket(data) {
    if (data.websocket_endpoint === undefined || data.worker_uuid === undefined || data.websocket_auth === undefined || websocketConn !== undefined) {
      return;
    }

    websocketConn = new SchruteConn(data.websocket_endpoint, data.worker_uuid, data.websocket_auth);
    websocketConn.start();
  }

  // Set checking state

  function notifyNotLoggedIn() {
    chrome.notifications.create('not_logged_in', notifications.notLoggedIn);
  }

  function togglePolling(enabled) {
    if (!enabled) {
      chrome.browserAction.setBadgeBackgroundColor({ color: RED });
      chrome.browserAction.setBadgeText({ text: 'OFF' });
    } else {
      if (app.appState.uuid) {
        app.checkForWork();
      } else {
        notifyNotLoggedIn();
      }
    }
  }

  // Open or focus the main work tab

  function openOrFocusTab(url) {
    if (app.appState.workTab === null) {
      app.makeNewWorkTab(url);
    } else {
      app.refreshTabInfo();
    }
  }

  // Make sure the work tab is open and in focus
  function refreshTabInfo() {
    chrome.tabs.get(app.appState.workTab.id, function (tab) {
      if (chrome.runtime.lastError) {
        app.appState.workTab = null;
      } else {
        app.appState.workTab = tab;

        // force selection
        if (!app.appState.workTab.selected) {
          chrome.tabs.update(app.appState.workTab.id, { selected: true });
        }
      }
    });
  }

  // Open a new work tab
  function makeNewWorkTab(url) {
    // make a new tab
    chrome.tabs.create({ url: url }, function (t) {
      app.appState.workTab = t;
    });
  }

  //
  // Open a sync tab
  //
  function makeNewSyncTab() {
    // make a new tab
    chrome.tabs.create({ url: app.appState.profileUrl });
  }

  function pingServer(url) {
    return new Promise(function resolvePromise(resolve) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && app.appState.isPolling) {
          resolve(JSON.parse(xhr.responseText));
        }
      };

      xhr.send();
    });
  }

  // Poll for new work
  function checkForWork() {
    app.pingServer('' + app.appState.work_available_endpoint + app.appState.uuid + '/work_available?info=' + JSON.stringify(app.appState)).then(function (resp) {
      if (resp.work_available) {
        chrome.browserAction.setBadgeBackgroundColor({ color: GREEN });
        chrome.browserAction.setBadgeText({ text: 'YES' });

        app.openOrFocusTab(resp.url);
      } else {
        chrome.browserAction.setBadgeBackgroundColor({ color: GREY });
        chrome.browserAction.setBadgeText({ text: 'NO' });
      }

      if (app.appState.isPolling) {
        clearTimeout(timeout);
        timeout = setTimeout(app.checkForWork, checkForWorkInterval);
      }
    });
  }

  var app = {
    startApp: startApp,
    setupChromeEvents: setupChromeEvents,
    appState: appState,
    togglePolling: togglePolling,
    pingServer: pingServer,
    checkForWork: checkForWork,
    makeNewWorkTab: makeNewWorkTab,
    refreshTabInfo: refreshTabInfo,
    openOrFocusTab: openOrFocusTab
  };

  // exposing this for dev mode
  // Use in dev mode
  // window._startRainforestTesterApp({
  //   data: {
  //     worker_uuid: 'your-worker-id',
  //     work_available_endpoint: 'bouncer-url'}});
  window._startRainforestTesterApp = app.startApp;

  app.setupChromeEvents();

}());