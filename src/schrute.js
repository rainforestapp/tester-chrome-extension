import {Socket} from 'phoenix';

export class SchruteConn {
  constructer(endpoint, workerUUID, authParams) {
    this.workerUUID = workerUUID;
    this.socket = new Socket(endpoint, {
      params: authParams,
      logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data); },
    });
  }

  start() {
    this.socket.connect();
    this.channel = this.socket.channel(`workers:${this.workerUUID}`);
    this.channel.join()
      .receive("ok", resp => { console.log("Joined successfully", resp); })
      .receive("error", resp => { console.log("Unable to join", resp); });
  }
};
