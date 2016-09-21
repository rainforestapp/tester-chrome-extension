// mock Audio

export class MockAudio {
  constructor(url = '') {
    this.url = url;
  }
  play() {
    this.onended();
  }
  onended() {
    return;
  }
}
