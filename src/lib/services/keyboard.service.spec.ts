import {Keyboard} from './keyboard.service';

describe('keyboard utils', () => {
  it('has a supports method that checks if a given locale is supported', () => {
    expect(new Keyboard().supports('whatever')).toBe(false);
    expect(new Keyboard().supports('en')).toBe(true);
  });

  describe('has a randomCharNear method that', () => {
    it('returns a character near another one', () => {
      const keyboard = new Keyboard();
      for (let i = 0; i < 100; i += 1) {
        expect(['a', 'e', 'q', 's', 'd']).toContain(
          keyboard.randomCharNear('z', 'fr')
        );
      }

      for (let i = 0; i < 100; i += 1) {
        expect(['q', 'e', 'a', 's', 'd']).toContain(
          keyboard.randomCharNear('w', 'en')
        );
      }
    });

    it('returns an uppercase character when given one', () => {
      const keyboard = new Keyboard();
      for (let i = 0; i < 100; i += 1) {
        expect(['A', 'E', 'Q', 'S', 'D']).toContain(
          keyboard.randomCharNear('Z', 'fr')
        );
      }

      for (let i = 0; i < 100; i += 1) {
        expect(['Q', 'E', 'A', 'S', 'D']).toContain(
          keyboard.randomCharNear('W', 'en')
        );
      }
    });

    it('returns a random character when given an unknown one', () => {
      const keyboard = new Keyboard();
      spyOn(keyboard, 'randomChar');
      keyboard.randomCharNear('%', 'fr');
      expect(keyboard.randomChar).toHaveBeenCalled();
    });
  });

  it('has a randomChar method that returns a random character', () => {
    const keyboard = new Keyboard();
    for (let i = 0; i < 100; i += 1) {
      expect(/[a-z]/.test(keyboard.randomChar('fr'))).toBe(true);
    }
  });
});
