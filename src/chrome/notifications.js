import { CONFIG } from '../constants';
import deepFreeze from 'deep-freeze';

export const notLoggedIn = 'notLoggedIn';
export const workerIdle = 'workerIdle';
export const captcha = 'captcha';
export const leftChannel = 'leftChannel';

export const notifications = deepFreeze({
  [notLoggedIn]: {
    iconUrl: CONFIG.chrome.notificationIconUrl,
    isClickable: true,
    type: 'basic',
    title: "You're not logged in",
    message:
    "You don't seem to be logged in to Rainforest, click here to go to your profile and log in.",
  },
  [leftChannel]: {
    iconUrl: CONFIG.chrome.notificationIconUrl,
    isClickable: false,
    type: 'basic',
    title: 'You have been disconnected',
    message: 'You have disconnected, probably because you logged in on another computer. ' +
      'Click the extension icon to reconnect.',
  },
  [workerIdle]: {
    iconUrl: CONFIG.chrome.notificationIconUrl,
    isClickable: true,
    type: 'basic',
    title: 'We noticed you were idle',
    message: 'You seem to have been idle for a while, so we stopped ' +
      'checking for work. Click here to start checking for work again.',
  },
  [captcha]: {
    iconUrl: CONFIG.chrome.notificationIconUrl,
    isClickable: true,
    type: 'basic',
    title: 'There was a problem with the request',
    message: 'You may need to fill out a captcha. Click here to test the work endpoint.',
  },
});
