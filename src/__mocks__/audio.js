// testable code with play count

export class MockAudio {
  constructor(src = '', playCount = 0) {
    this.src = src;
    this.playCount = playCount;
  }
  play() {
    this.playCount++;
    setTimeout(this.onended.bind(this), 5);
  }
  onended() {
    // blank
  }
}
