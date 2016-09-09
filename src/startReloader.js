import listenStoreChanges from './listenStoreChanges';

const startReloader = (store, reloader) => {
  const handleUpdate = ({ plugin: prevPlugin }, { plugin: curPlugin }) => {
    if (prevPlugin.get('version') && curPlugin.get('version') !== prevPlugin.get('version')) {
      reloader();
    }
  };

  listenStoreChanges(store, handleUpdate);
};

export default startReloader;
