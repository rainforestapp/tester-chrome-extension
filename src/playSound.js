import { NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_REPEAT } from './constants';

export const playSound = (soundUrl, soundRepeat) => {
  if (soundUrl && soundRepeat > 0) {
    const audioPlayer = new window.Audio(soundUrl);
    let repeatCount = 0;
    audioPlayer.onended = () => {
      repeatCount++;
      if (repeatCount < soundRepeat) audioPlayer.play();
    };
    audioPlayer.play();
    return audioPlayer;
  }
  return null;
};

export const stopSound = (audioPlayer) => {
  if (audioPlayer) {
    audioPlayer.pause();
  }
};

export const playSoundOptions = (options) => {
  const soundUrl = options.get(NOTIFICATION_SOUND_URL);
  const soundRepeat = options.get(NOTIFICATION_SOUND_REPEAT);
  const audioPlayer = playSound(soundUrl, soundRepeat);
  return audioPlayer;
};
