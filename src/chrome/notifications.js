import { CONFIG } from '../constants';
import deepFreeze from 'deep-freeze';

export const notLoggedIn = 'notLoggedIn';
export const workerIdle = 'workerIdle';
export const alreadyWorking = 'alreadyWorking';
export const captcha = 'captcha';

export const notifications = deepFreeze({
  [notLoggedIn]: {
    iconUrl: CONFIG.chrome.notificationIconUrl,
    isClickable: true,
    type: 'basic',
    title: "You're not logged in",
    message:
    "You don't seem to be logged in to Rainforest, click here to go to your profile and log in.",
  },
  [workerIdle]: {
    iconUrl: CONFIG.chrome.notificationIconUrl,
    isClickable: true,
    type: 'basic',
    title: 'We noticed you were idle',
    message: 'You seem to have been idle for a while, so we stopped ' +
      'checking for work. Click here to start checking for work again.',
  },
  [alreadyWorking]: {
    iconUrl: CONFIG.chrome.notificationIconUrl,
    isClickable: false,
    type: 'basic',
    title: "You're already working",
    message: 'You can only do one job at a time. ' +
      "If you're finished, please wait for your previous job to be processed.",
  },
  [captcha]: {
    iconUrl: 'icons/icon_notification.png',
    isClickable: true,
    type: 'basic',
    title: 'There was a problem with the request',
    message: 'You may need to fill out a captcha. Click here to test the work endpoint. ' +
      'Click the plugin icon to start polling for work again.',
  },
});
