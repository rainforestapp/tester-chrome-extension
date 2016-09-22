/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/

import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { playSound } from '../playSound';
import { NOTIFICATION_SOUND_URL, NOTIFICATION_SOUND_REPEAT } from '../constants';
import { setOptions } from '../actions';
import { createStore } from 'redux';
import pluginApp from '../reducers';
import { MockAudio } from '../__mock__/audio';

chai.use(sinonChai);

describe('playSound', function() {
  it('sets notificationSoundUrl to audioPlayer', function() {
    const audioPlayer = new MockAudio();
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
      [NOTIFICATION_SOUND_REPEAT]: 1,
    };
    store.dispatch(setOptions(options));

    const { plugin } = store.getState();

    sinon.spy(audioPlayer.src);
    playSound(audioPlayer, plugin.get('options'));
    expect(audioPlayer.src).to.equal('mockSound.mp3');
  });

  it('repeats sound 3 times', function() {
    const audioPlayer = new MockAudio();
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
      [NOTIFICATION_SOUND_REPEAT]: 3,
    };
    store.dispatch(setOptions(options));

    const { plugin } = store.getState();

    sinon.spy(audioPlayer, 'play');
    playSound(audioPlayer, plugin.get('options'));
    expect(audioPlayer.play).to.have.been.calledThrice;
    audioPlayer.play.restore();
  });

  it('plays sound once', function() {
    const audioPlayer = new MockAudio();
    const store = createStore(pluginApp);
    const options = {
      [NOTIFICATION_SOUND_URL]: 'mockSound.mp3',
      [NOTIFICATION_SOUND_REPEAT]: 1,
    };
    store.dispatch(setOptions(options));

    const { plugin } = store.getState();

    sinon.spy(audioPlayer, 'play');
    playSound(audioPlayer, plugin.get('options'));
    expect(audioPlayer.play).to.have.been.calledOnce;
    audioPlayer.play.restore();
  });

  it('does not play sound', function() {
    const audioPlayer = new MockAudio();
    const store = createStore(pluginApp);
    const options = {};
    store.dispatch(setOptions(options));

    const { plugin } = store.getState();

    sinon.spy(audioPlayer, 'play');
    playSound(audioPlayer, plugin.get('options'));
    expect(audioPlayer.play).to.have.not.been.called;
    audioPlayer.play.restore();
  });
});

