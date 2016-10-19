import listenStoreChanges from '../listenStoreChanges';
import { notify } from '../actions';
import { playSoundOnce } from '../playSound';

const handleCaptcha = (store) => {
  const handleUpdate = ({ polling: prevPolling }, { polling: curPolling }) => {
    if (!prevPolling.get('captchaRequired') && curPolling.get('captchaRequired')) {
      store.dispatch(notify('captcha'));
      playSoundOnce(store.getState().plugin.get('options'));
    }
  };

  listenStoreChanges(store, handleUpdate);
};

export default handleCaptcha;
