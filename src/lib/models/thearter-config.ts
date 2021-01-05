import {SpeedConfig} from './speed-config';

export class TheaterConfig {
  autoplay: boolean;
  erase: boolean;
  minSpeed: SpeedConfig;
  maxSpeed: SpeedConfig;
  locale: string;
  constructor(autoplay: boolean, erase: boolean, minSpeed: SpeedConfig, maxSpeed: SpeedConfig, locale: string = 'detect') {
    this.autoplay = autoplay;
    this.erase = erase;
    this.minSpeed = minSpeed;
    this.maxSpeed = maxSpeed;
    this.locale = locale;
  }
}
