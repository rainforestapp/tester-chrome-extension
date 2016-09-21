import { SOUND_URL, SOUND_REPEAT } from '../constants';

// Get sound options and play if enabled

export const getAndPlaySoundNotificationOption = (store, mainAudioPlayer) => {
  const audioPlayer = mainAudioPlayer;
  const { plugin } = store.getState();
  const options = plugin.get('options');
  const soundUrl = options.get(SOUND_URL);
  const repeat = options.get(SOUND_REPEAT);
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
