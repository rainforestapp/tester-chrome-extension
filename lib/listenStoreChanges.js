"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// listenStoreChanges is a light abstraction on top of redux stores to make it
// easier to react to changes. It's really just a pattern that kept popping up
// and is a teeny bit error-prone when repeated.
var listenStoreChanges = function listenStoreChanges(store, handleUpdate) {
  var lastState = store.getState();

  handleUpdate(lastState, lastState);

  store.subscribe(function () {
    var previousState = lastState;
    var currentState = store.getState();
    lastState = currentState;
    handleUpdate(previousState, currentState);
  });
};

exports.default = listenStoreChanges;