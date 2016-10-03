import { NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_REPEAT } from './constants';

const playAudioPlayer = (soundUrl, soundRepeat) => {
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

export const playSound = (options) => {
  const soundUrl = options.get(NOTIFICATION_SOUND_URL);
  const soundRepeat = options.get(NOTIFICATION_SOUND_REPEAT);
  return playAudioPlayer(soundUrl, soundRepeat);
};

export const playSoundOnce = (options) => {
  const soundUrl = options.get(NOTIFICATION_SOUND_URL);
  return playAudioPlayer(soundUrl, 1);
};
