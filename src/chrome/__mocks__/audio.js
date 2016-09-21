// mock Audio

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
