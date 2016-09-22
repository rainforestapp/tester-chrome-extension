import { NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_REPEAT } from './constants';

// Get sound options and play if enabled
export const audioPlayer = new window.Audio(); 

export const playSound = (audioPlayer, options) => {
  const soundUrl = options.get(NOTIFICATION_SOUND_URL);
  const repeat = options.get(NOTIFICATION_SOUND_REPEAT);
  if (soundUrl && repeat > 0) {
    audioPlayer.src = soundUrl;
    let repeatCount = 0;
    audioPlayer.onended = () => {
      repeatCount++;
      if (repeatCount < repeat) audioPlayer.play();
    };
    audioPlayer.play();
  }
};
