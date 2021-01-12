export class ActorConfig {
  accuracy: number;
  speed: number;
  displayCaret: boolean;
  constructor(accuracy = 0.8, speed = 0.8, displayCaret = true) {
    this.accuracy = accuracy;
    this.speed = speed;
    this.displayCaret = displayCaret;
  }
}
