export const mockSocket = (opts = {}) => (
  class MockSocket {
    constructor(endpoint, sockOpts = {}) {
      this.endpoint = endpoint;
      this.opts = sockOpts;
      this.testChannels = {};
      this.disconnected = false;
      this.onCloseCallbacks = [];
    }

    connect() { return this; }
    disconnect() {
      this.disconnected = true;
      return this;
    }
    onClose(callback) {
      this.onCloseCallbacks.push(callback);
      return this;
    }
    channel(name) {
      this.testChannels[name] = {
        onCallbacks: {},
        join() {
          this.state = 'connected';
          return this;
        },
        leave() {
          this.state = 'disconnected';
          return this;
        },
        receive(code, callback) {
          if (opts.joinReply === code) {
            callback();
          }

          return this;
        },
        push: (event, payload) => {
          if (opts.pushCallback !== undefined) {
            opts.pushCallback(event, payload);
          }
          if (this.opts.logger !== undefined) {
            this.opts.logger('fake_send', event, payload);
          }
        },
        on(event, callback) {
          this.onCallbacks[event] = callback;
        },
        // Simulate the backend pushing a message
        serverPush(event, payload) {
          const callback = this.onCallbacks[event];
          if (callback) {
            callback(payload);
          }
        },
        // Get the state of the channel
        getState() {
          return this.state;
        },
      };
      return this.testChannels[name];
    }

    // Simulate server disconnection for testing purposes
    serverDisconnect() {
      this.onCloseCallbacks.forEach(callback => callback());
      this.disconnected = true;
    }
  }
);
