import { setOptions } from '../actions';
import {
  CONFIRM_WORK_ASSIGNMENT,
  NOTIFICATION_SOUND_URL,
  NOTIFICATION_SOUND_REPEAT,
} from '../constants';

const buildContextMenus = (store, chrome) => {
  const pluginOptions = store.getState().plugin.get('options');

  const isChecked = (name, value) => (
    pluginOptions.get(name) === value
  );

  const onMenuClick = (name, value) => {
    store.dispatch(setOptions({ [name]: value }));

    chrome.storage.sync.set({
      options: store.getState().plugin.get('options').toJS(),
    });
  };

  const createContextMenu = (option) => {
    const root = chrome.contextMenus.create({ // Menu
      title: option.title,
      contexts: ['browser_action'],
    },
    () => {
      option.opts.forEach(opt => { // Generating SubMenu
        chrome.contextMenus.create({
          type: 'radio',
          title: opt.name,
          checked: isChecked(option.name, opt.value),
          contexts: ['browser_action'],
          onclick: () => {
            onMenuClick(option.name, opt.value);
          },
          parentId: root,
        });
      });
    });
  };

  createContextMenu({
    name: CONFIRM_WORK_ASSIGNMENT,
    title: 'Confirm Work Assignments',
    opts: [
      {
        name: 'No',
        value: false,
      },
      {
        name: 'Yes',
        value: true,
      },
    ],
  });

  createContextMenu({
    name: NOTIFICATION_SOUND_URL,
    title: 'Notification Sound',
    opts: [
      {
        name: 'off',
        value: '',
      },
      {
        name: 'arpeggio',
        value: 'https://static.rainforestqa.com/sounds/arpeggio.ogg',
      },
      {
        name: 'office',
        value: 'https://static.rainforestqa.com/sounds/office.ogg',
      },
      {
        name: 'solemn',
        value: 'https://static.rainforestqa.com/sounds/solemn.ogg',
      },
    ],
  });

  createContextMenu({
    name: NOTIFICATION_SOUND_REPEAT,
    title: 'Sound Repeat',
    opts: [
      { name: '1', value: 1 },
      { name: '2', value: 2 },
      { name: '3', value: 3 },
      { name: '4', value: 4 },
      { name: '5', value: 5 },
      { name: '6', value: 6 },
      { name: '7', value: 7 },
      { name: '8', value: 8 },
    ],
  });
};

export default buildContextMenus;
