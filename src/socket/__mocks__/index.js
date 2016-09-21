export const mockSocket = (opts = {}) => (
  class MockSocket {
    constructor(endpoint, sockOpts = {}) {
      this.endpoint = endpoint;
      this.opts = sockOpts;
    }

    connect() { return this; }
    disconnect() { return this; }
    onClose() { return this; }
    channel(name) {
      this.channelName = name;
      this.testChannel = {
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
      return this.testChannel;
    }
  }
);
