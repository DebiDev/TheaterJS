import {SpeedConfig} from './speed-config';

export class TheaterConfig {
  autoplay: boolean;
  erase: boolean;
  minSpeed: SpeedConfig;
  maxSpeed: SpeedConfig;
  locale: string;
  constructor(autoplay: boolean = true,
              erase: boolean = true,
              minSpeed: SpeedConfig = new SpeedConfig(80, 80),
              maxSpeed: SpeedConfig = new SpeedConfig(450, 450),
              locale: string = 'detect')
  {
    this.autoplay = autoplay;
    this.erase = erase;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.locale = locale;
  }
}
