// window.Audio doesn't get along w/ sinon.spy

export class MockAudio {
  constructor(src = '') {
    this.src = src;
  }
  play() {
    this.onended();
  }
  onended() {
    // blank
  }
}
