import { NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_REPEAT } from './constants';

export const mainAudioPlayer = new window.Audio();

export const playSound = (audioPlayer, options) => {
  const soundPlayer = audioPlayer;
  const soundUrl = options.get(NOTIFICATION_SOUND_URL);
  const repeat = options.get(NOTIFICATION_SOUND_REPEAT);
  if (soundUrl && repeat > 0) {
    soundPlayer.src = soundUrl;
    let repeatCount = 0;
    soundPlayer.onended = () => {
      repeatCount++;
      if (repeatCount < repeat) soundPlayer.play();
    };
    soundPlayer.play();
  }
};
