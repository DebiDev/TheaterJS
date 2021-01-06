import { Actor } from './actor';
import {ActorConfig} from './actor-config';

let vader: Actor;

describe('actor', () => {
  beforeEach(() => {
    spyOn(window.document, 'querySelector').and.returnValue(Object.create(HTMLElement.prototype, {}));
  });

  it('should have a read-only name', () => {
    vader = new Actor('vader');

    expect(vader.name).toBe('vader');
    expect(() => {
      // @ts-ignore
      vader.name = 'luke';
    }).toThrow();
  });

  describe('has a displayValue property', () => {
    it('that calls a callback when it\'s changed', () => {
      const spy = jasmine.createSpy('callback');
      vader = new Actor('vader', new ActorConfig(), spy);

      vader.displayValue = 'Hey!';

      expect(vader.displayValue).toBe('Hey!');
      expect(spy).toHaveBeenCalledWith('Hey!');
    });
  });

  describe('should have a shouldBeMistaken method that', () => {
    it('cannot return true if an actor\'s accuracy is greater or equal to 0.8', () => {
      vader = new Actor('vader', new ActorConfig());

      for (let i = 0; i < 100; i += 1) {
        expect(vader.shouldBeMistaken('aaaaa', 'aaaaaaaaaa')).toBe(false);
      }
    });

    it('should randomly returns true or false when actor\'s accuracy is below 0.8', () => {
      vader = new Actor('vader', new ActorConfig(0.3));
      const results = { true: null, false: null };

      for (let i = 0; i < 100; i += 1) {
        const returnValue = vader.shouldBeMistaken('aaaa', 'aaaaaaaaaa');
        if (results[`${returnValue}`] == null) {
          results[`${returnValue}`] = 0;
        }

        results[`${returnValue}`] += 1;
      }

      expect(Object.keys(results).length).toBe(2);
      expect(Object.keys(results)).toContain('true');
      expect(Object.keys(results)).toContain('false');

      expect(results.true).toBeGreaterThan(0);
      expect(results.false).toBeGreaterThan(0);
    });

    it('should return false when actual value\'s length is <= actor\'s accuracy', () => {
      vader = new Actor('vader', new ActorConfig(0.3));

      for (let i = 0; i < 10; i += 1) {
        expect(vader.shouldBeMistaken('a', 'aaaaaaaaaa')).toBe(false);
        expect(vader.shouldBeMistaken('aa', 'aaaaaaaaaa')).toBe(false);
        expect(vader.shouldBeMistaken('aaa', 'aaaaaaaaaa')).toBe(false);
      }
    });

    it('should return false if actual value\'s length is equal to the supposed end value', () => {
      vader = new Actor('vader');

      for (let i = 0; i < 100; i += 1) {
        expect(vader.shouldBeMistaken('azeqwe', 'azerty')).toBe(false);
      }
    });

    it('based on actor\'s accuracy, cannot return true if actor made a mistake in the previous x characters', () => {
      vader = new Actor('vader', new ActorConfig(0.4));

      for (let i = 0; i < 100; i += 1) {
        expect(vader.shouldBeMistaken('awwww', 'azertyuiop', 1)).toBe(false);
      }
    });

    it('return false if actor just fixed a mistake', () => {
      vader = new Actor('vader', new ActorConfig(0));
      let i;

      for (i = 0; i < 100; i += 1) {
        expect(
          vader.shouldBeMistaken('hello th', 'hello there!', null, 4)
        ).toBe(false);
      }

      for (i = 0; i < 100; i += 1) {
        if (
          vader.shouldBeMistaken('hello th', 'hello there!', null, 2) === true
        ) {
          break;
        }
      }

      expect(i).toBeLessThan(100);
    });
  });

  describe('has a getTypingSpeed method that', () => {
    it('return a random value depending on its characteristics', () => {
      vader = new Actor('vader', new ActorConfig(0.8, 1));

      expect(vader.getTypingSpeed(50, 200)).toBe(50);

      vader = new Actor('vader', new ActorConfig(0.8, 0.5));

      for (let i = 0; i < 100; i += 1) {
        const speed = vader.getTypingSpeed(300, 600);

        expect(speed).toBeLessThanOrEqual(450);
        expect(speed).toBeGreaterThanOrEqual(300);
      }
    });
  });
});
