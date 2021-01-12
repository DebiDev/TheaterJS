// @ts-ignore
import randomFloat from 'random-float';
import {ActorConfig} from './actor-config';

const DOCUMENT = typeof window !== 'undefined' && window.document;

export class Actor {

  private _displayValue = '';
  private readonly actorName: string;
  actorConfig: ActorConfig;
  element: Element;
  callback: (displayValue: string) => void;

  get displayValue(): string {
    return this._displayValue;
  }

  set displayValue(value) {
    this._displayValue = value;
    this.callback(value);
  }

  get name(): string {
    return this.actorName;
  }

  constructor(actorName: string,
              props: ActorConfig = { speed: 0.6, accuracy: 0.6, displayCaret: true },
              callback: (displayValue: string) => void = null)
  {
    this.actorName = actorName;
    this.actorConfig = props;
    if (DOCUMENT) {
      const selector = `#${actorName}`;
      const $e = DOCUMENT.querySelector(selector);
      if ($e != null) {
        this.element = $e;
      } else {
        throw new Error(`no matches for ${actorName}'s selector: ${selector}`);
      }
      if (callback == null) {
        this.callback = newValue => {
          if (this.actorConfig.displayCaret) {
            this.element.innerHTML = newValue + '<span class="caret">|</span>';
          } else {
            this.element.innerHTML = newValue;
          }
        };
      } else if (typeof callback !== 'function') {
        this.callback = console.log.bind(console);
      } else {
        this.callback = callback;
      }

    }
  }

  getTypingSpeed(fastest: number, slowest: number): number {
    const speed = randomFloat(this.actorConfig.speed, 1);
    return slowest - slowest * speed + fastest * speed;
  }

  shouldBeMistaken(
      actual,
      endValue,
      previousMistakeCursor: number = null,
      previousFixCursor: number = null
    ): boolean {
      const accuracy = this.actorConfig.accuracy * 10;

      if (accuracy >= 8) {
        return false;
      }

      if (actual.length <= accuracy) {
        return false;
      }

      if (actual.length === endValue.length) {
        return false;
      }

      if (typeof previousMistakeCursor === 'number') {
        const nbOfCharactersTyped = actual.length - previousMistakeCursor;
        const maxWrongCharactersAllowed = accuracy >= 6 ? 10 - accuracy : 4;

        if (nbOfCharactersTyped >= maxWrongCharactersAllowed) {
          return false;
        }
      }

      if (typeof previousFixCursor === 'number') {
        const nbOfCharactersTyped = actual.length - previousFixCursor;
        const minCharactersBetweenMistakes = Math.max(accuracy, 2) * 2;

        if (nbOfCharactersTyped <= minCharactersBetweenMistakes) {
          return false;
        }
      }

      return randomFloat(0, 0.8) > this.actorConfig.accuracy;
    }
}


