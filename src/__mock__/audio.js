// testable code with play count and pause boolean.

export class MockAudio {
  constructor(src = '', playCount = 0, paused = false) {
    this.src = src;
    this.playCount = playCount;
    this.paused = paused;
  }
  play() {
    if (!this.paused) {
      this.playCount++;
      setTimeout(this.onended.bind(this), 5);
    }
  }
  pause() {
    this.paused = true;
  }
  onended() {
    // blank
  }
}
