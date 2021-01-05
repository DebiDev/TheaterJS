import {TheaterConfig} from './thearter-config';
import {Actor} from './actor';
import {Scene} from './scene';

export class TheaterProps {
  options: TheaterConfig = null;
  casting: { [name: string]: Actor };
  status: string;
  onStage: string;
  currentScene: number;
  scenario: Scene[];
  events: { [event: string]: () => void }[];
  constructor() {}
}
