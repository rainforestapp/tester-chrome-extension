import listenStoreChanges from './listenStoreChanges';

const startReloader = (store, reloader) => {
  const shouldReload = ({ plugin: prevPlugin }, { plugin: curPlugin }) => (
    curPlugin.get('needsReload') ||
      (prevPlugin.get('version') && curPlugin.get('version') !== prevPlugin.get('version'))
  );

  const handleUpdate = (previousState, currentState) => {
    if (shouldReload(previousState, currentState)) {
      reloader();
    }
  };

  listenStoreChanges(store, handleUpdate);
};

export default startReloader;
