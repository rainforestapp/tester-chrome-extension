/* global before:true */
/* global context:true */
/* eslint camelcase:0 */
import expect, {createSpy, spyOn} from 'expect';
import app from '../src/app';
import chrome from './chromeMock';
import * as phoenix from '../vendor/phoenix';
import Socket from './socketMock';
import Raven from 'raven-js';
import {SchruteConn} from '../src/schrute';
import {RAVEN_URL, RED, GREEN, GREY, DEFAULT_INTERVAL} from '../src/constants';

phoenix.Socket = Socket;

const makePromiseCallback = resp => { return { then: cb => cb(resp) }; };

const promise = Promise.resolve();
const websocket_endpoint = 'websocket.lol';
const websocket_auth = 'websocketAuth';
const worker_uuid = 'uuid';
const work_available_endpoint = 'uuid';

const workAvailableResponse = {
  work_available: true,
  url: 'google.com',
};

const workUnavailableResponse = {
  work_available: false,
};

const userData = {
  data: {
    worker_uuid,
    work_available_endpoint,
  },
};

const storageData = {
  worker_uuid,
  work_available_endpoint,
  websocket_endpoint,
  websocket_auth,
};

const requestData = {
  data: {
    worker_uuid,
    work_available_endpoint,
    websocket_endpoint,
    websocket_auth,
  },
};

describe('tester chrome extension ', () => {
  before(() => {
    app.appState.workTab = null;
    app.appState.isPolling = false;
    global.chrome = chrome;
    global.setTimeout = createSpy();
    app.pingServer = createSpy().andReturn({then: () => {}});
    spyOn(phoenix, 'Socket');
  });

  afterEach(() => {
    expect.restoreSpies();
    app.appState.webSocketConnection = undefined;
  });

  context('with chrome events setup', () => {
    before(() => {
      app.setupChromeEvents();
    });

    it('should trigger raven', () => {
      const installSpy = createSpy();
      spyOn(Raven, 'config').andReturn({install: installSpy});
      app.setupChromeEvents();
      expect(Raven.config).toHaveBeenCalledWith(RAVEN_URL);
      expect(installSpy).toHaveBeenCalled();
    });

    describe('startApp', () => {
      it('fires when chrome extension gets message with worker uuid and endpoint', () => {
        spyOn(app, 'startApp');
        chrome.runtime.onMessageExternal.trigger(requestData);
        expect(app.startApp.calls[0].arguments[0]).toEqual(requestData);
      });

      it('sets the appState uuid and endpoint', () => {
        chrome.runtime.onMessageExternal.trigger(userData);
        expect(app.appState.uuid).toEqual(userData.data.worker_uuid);
        expect(app.appState.work_available_endpoint).toEqual(userData.data.work_available_endpoint);
      });

      it('sends back a response with {ok: true}', () => {
        const spy = createSpy();
        app.startApp(userData, spy);
        expect(spy).toHaveBeenCalledWith({ok: true});
      });

      it('fires togglePolling with false', () => {
        const spy = spyOn(app, 'togglePolling');
        app.startApp(requestData, spy);
        expect(spy).toHaveBeenCalledWith(false);
      });

      it('saves user info in chrome storage', () => {
        const spy = spyOn(chrome.storage.sync, 'set');
        app.startApp(requestData, spy);
        expect(spy).toHaveBeenCalledWith(storageData);
      });
    });

    describe('togglePolling', () => {
      it('sets the badge colour to red and the badge text to OFF if disabled', () => {
        const spy = spyOn(chrome.browserAction, 'setBadgeBackgroundColor');
        app.togglePolling(false);
        expect(spy).toHaveBeenCalled({color: RED});
      });

      it('fires checkForWork if enabled', () => {
        const spy = spyOn(app, 'checkForWork');
        app.togglePolling(true);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe('checkForWork', () => {
      it('pings the server with the right url', () => {
        app.checkForWork();
        const userInfo = {
          uuid: app.appState.uuid,
          email: app.appState.email,
          id: app.appState.id,
          version: app.appState.version,
          tester_state: app.appState.tester_state};
        expect(app.pingServer).toHaveBeenCalledWith(`${app.appState.work_available_endpoint}${app.appState.uuid}/work_available?info=${JSON.stringify({userInfo})}`);
      });

      it('sets the badge color to green and "YES" if work is available', () => {
        const spyColor = spyOn(chrome.browserAction, 'setBadgeBackgroundColor');
        const spyText = spyOn(chrome.browserAction, 'setBadgeText');
        spyOn(app, 'pingServer').andReturn(makePromiseCallback(workAvailableResponse));
        app.checkForWork();
        expect(spyColor).toHaveBeenCalledWith({color: GREEN});
        expect(spyText).toHaveBeenCalledWith({text: 'YES'});
      });

      it('sets the badge color to grey and "NO" if work is unavailable', () => {
        const spyColor = spyOn(chrome.browserAction, 'setBadgeBackgroundColor');
        const spyText = spyOn(chrome.browserAction, 'setBadgeText');
        spyOn(app, 'pingServer').andReturn(makePromiseCallback(workUnavailableResponse));
        app.checkForWork();
        expect(spyColor).toHaveBeenCalledWith({color: GREY});
        expect(spyText).toHaveBeenCalledWith({text: 'NO'});
      });

      it('sets a timeout and calls checkForWork if isPolling is true', () => {
        app.appState.isPolling = true;
        spyOn(app, 'pingServer').andReturn(makePromiseCallback(workUnavailableResponse));
        app.checkForWork();
        expect(global.setTimeout).toHaveBeenCalledWith(app.checkForWork, DEFAULT_INTERVAL);
      });
    });

    describe('openOrFocusTab', () => {
      it('fires makeNewWorkTab if there is no workTab', () => {
        spyOn(app, 'makeNewWorkTab');
        app.openOrFocusTab('google.com');
        expect(app.makeNewWorkTab).toHaveBeenCalledWith('google.com');
      });
      /*  
      it('fires refreshTabInfo if there is a workTab', () => {
        app.appState.workTab = {};
        spyOn(app, 'refreshTabInfo');
        app.openOrFocusTab('google.com');
        expect(app.refreshTabInfo).toHaveBeenCalledWith();
      });
      */
    });
  });

  describe('startWebsocket', () => {
    it('schould start SchruteConn', () => {
      const spy = spyOn(SchruteConn.prototype, 'start');
      app.startWebsocket(requestData.data);
      expect(spy).toHaveBeenCalled();
    });
  });
});
