// listenStoreChanges is a light abstraction on top of redux stores to make it
// easier to react to changes. It's really just a pattern that kept popping up
// and is a teeny bit error-prone when repeated.
const listenStoreChanges = (store, handleUpdate) => {
  let lastState = store.getState();

  handleUpdate(lastState, lastState);

  store.subscribe(() => {
    const previousState = lastState;
    const currentState = store.getState();
    lastState = currentState;
    handleUpdate(previousState, currentState);
  });
};

export default listenStoreChanges;
