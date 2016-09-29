/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/

import { expect } from 'chai';
import { playSoundOptions, stopSound } from '../playSound';
import { NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_REPEAT } from '../constants';
import { setOptions } from '../actions';
import { createStore } from 'redux';
import pluginApp from '../reducers';
import { MockAudio } from '../__mock__/audio';

window.Audio = MockAudio;

describe('playSound', function() {
  it('sets notificationSoundUrl to audioPlayer', function() {
    let audioPlayer = null;
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
      [NOTIFICATION_SOUND_REPEAT]: 1,
    };
    store.dispatch(setOptions(options));

    audioPlayer = playSoundOptions(store.getState().plugin.get('options'));
    expect(audioPlayer.src).to.equal('mockSound.mp3');
  });

  it('repeats sound 3 times', function(done) {
    let audioPlayer = null;
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
      [NOTIFICATION_SOUND_REPEAT]: 3,
    };
    store.dispatch(setOptions(options));

    audioPlayer = playSoundOptions(store.getState().plugin.get('options'));
    setTimeout(() => {
      expect(audioPlayer.playCount).to.equal(3);
      done();
    }, 20);
  });

  it('plays sound once', function() {
    let audioPlayer = null;
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
      [NOTIFICATION_SOUND_REPEAT]: 1,
    };
    store.dispatch(setOptions(options));

    audioPlayer = playSoundOptions(store.getState().plugin.get('options'));
    expect(audioPlayer.playCount).to.equal(1);
  });

  it('does not play sound', function() {
    let audioPlayer = null;
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: null,
      [NOTIFICATION_SOUND_REPEAT]: null,
    };
    store.dispatch(setOptions(options));

    audioPlayer = playSoundOptions(store.getState().plugin.get('options'));
    expect(audioPlayer).to.be.null;
  });

  it('stop sounds from playing', function(done) {
    let audioPlayer = null;
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
      [NOTIFICATION_SOUND_REPEAT]: 10,
    };
    store.dispatch(setOptions(options));

    audioPlayer = playSoundOptions(store.getState().plugin.get('options'));
    setTimeout(() => {
      stopSound(audioPlayer);
      expect(audioPlayer.paused).to.be.true;
      expect(audioPlayer.playCount).to.be.at.least(2);
      expect(audioPlayer.playCount).to.be.below(10);
      done();
    }, 20);
  });
});
