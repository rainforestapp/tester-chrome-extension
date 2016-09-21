/*
 eslint-disable prefer-arrow-callback,
 func-names,
 space-before-function-paren,
 no-unused-expressions
*/

import { MockAudio } from '../__mocks__/audio';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { createStore } from 'redux';
import pluginApp from '../../reducers';
import { setOptions } from '../../actions';
import { getAndPlaySoundNotificationOption } from '../playSound';
import { SOUND_URL, SOUND_REPEAT } from '../../constants';

chai.use(sinonChai);

describe('playSound', function() {
  describe('getAndPlaySoundNotificationOption', function() {
    it('repeats sound 3 times', function(done) {
      const audioPlayer = new MockAudio();
      const store = createStore(pluginApp);
      const options = {
        [SOUND_URL]: 'mockSound.mp3',
        [SOUND_REPEAT]: 3,
      };
      store.dispatch(setOptions(options));

      sinon.spy(audioPlayer, 'play');
      getAndPlaySoundNotificationOption(store, audioPlayer);
      expect(audioPlayer.play).to.have.been.calledThrice;
      audioPlayer.play.restore();
      done();
    });

    it('plays sound once', function(done) {
      const audioPlayer = new MockAudio();
      const store = createStore(pluginApp);
      const options = {
        [SOUND_URL]: 'mockSound.mp3',
        [SOUND_REPEAT]: 1,
      };
      store.dispatch(setOptions(options));

      sinon.spy(audioPlayer, 'play');
      getAndPlaySoundNotificationOption(store, audioPlayer);
      expect(audioPlayer.play).to.have.been.calledOnce;
      audioPlayer.play.restore();
      done();
    });

    it('does not play sound', function(done) {
      const audioPlayer = new MockAudio();
      const store = createStore(pluginApp);
      const options = {};
      store.dispatch(setOptions(options));

      sinon.spy(audioPlayer, 'play');
      getAndPlaySoundNotificationOption(store, audioPlayer);
      expect(audioPlayer.play).to.have.not.been.called;
      audioPlayer.play.restore();
      done();
    });
  });
});
