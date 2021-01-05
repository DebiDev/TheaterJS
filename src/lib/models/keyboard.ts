// @ts-ignore
import * as randomInt from 'random-int';
import * as keyboards from '../constants/keyboards.json';

export class Keyboard {

  defaultLocale = 'en';

  constructor() {
    for (const locale in keyboards) {
      if (!keyboards.hasOwnProperty(locale)) { continue; }
      const keyboard = keyboards[locale];
      keyboards[locale] = {
        list: keyboard,
        mapped: this.mapKeyboard(keyboard)
      };
    }
  }

  mapKeyboard(alphabet: string[]): { [char: string]: CharPosition } {
    const keyboard = {};
    for (let y = 0; y < alphabet.length; y++) {
      const chars = alphabet[y];
      for (let x = 0; x < chars.length; x++) {
        keyboard[chars[x]] = { x, y };
      }
    }
    return keyboard;
  }

  supports(locale: string): boolean {
    return keyboards[locale] != null;
  }

  randomCharNear(ch: string, locale: string): string {
    if (!this.supports(locale)) {
      throw new Error(`locale "${locale}" is not supported`);
    }

    const keyboard: { [char: string]: CharPosition } = keyboards[locale].mapped;
    const threshold = 1;
    const nearbyChars: string[] = [];
    const uppercase = /[A-Z]/.test(ch);

    ch = ch.toLowerCase();

    const charPosition = keyboard[ch];
    let p: CharPosition;

    for (const c in keyboard) {
      if (!keyboard.hasOwnProperty(c) || c === ch) { continue; }

      p = keyboard[c];

      if (
        Math.abs(charPosition.x - p.x) <= threshold &&
        Math.abs(charPosition.y - p.y) <= threshold
      ) {
        nearbyChars.push(c);
      }
    }

    let randomChar =
      nearbyChars.length > 0
        ? nearbyChars[randomInt(0, nearbyChars.length - 1)]
        : this.randomChar(locale);

    if (uppercase) {
      randomChar = randomChar.toUpperCase();
    }

    return randomChar;
  }

  randomChar(locale: string): string {
    if (!this.supports(locale)) {
      throw new Error(`locale "${locale}" is not supported`);
    }

    const chars = keyboards[locale].list.join('');
    return chars.charAt(randomInt(0, chars.length - 1));
  }
}

interface CharPosition {
  x: number;
  y: number;
}
