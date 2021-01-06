export class ActorConfig {
  accuracy: number;
  speed: number;
  constructor(accuracy = 0.8, speed = 0.8) {
    this.accuracy = accuracy;
    this.speed = speed;
  }
}
