import { TheaterTS } from './theater-ts';
import {TheaterConfig} from './models/thearter-config';
import {SpeedConfig} from './models/speed-config';
import {ActorConfig} from './models/actor-config';


let theater: TheaterTS;

describe('TheaterTS', () => {

  beforeEach(() => {
    spyOn(window.document, 'querySelector').and.returnValue({} as Element);
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000000;
  });

  afterEach(() => {
    theater = null;
  });

  describe('is instantiable', () => {

    it('and have an initial status of ready', () => {
      theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      expect(theater.status).toBe('ready');
    });

    it('and able to fallback to en if the given locale is not supported', () => {
      theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450), 'whatever'));
      expect(theater.options.locale).toBe('en');
    });
  });

  it('can describe an actor, create scenes and play them', async () => {
    theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));

    theater.addActor('vader').addScene('vader:Luke...');

    expect(theater.status).toBe('ready');

    theater.play();

    expect(theater.status).toBe('playing');
    expect(theater.getCurrentActor().name).toBe('vader');
    expect(theater.getCurrentActor().displayValue).toBe('L');

    await delay(6000);

    expect(theater.status).toBe('ready');
    expect(theater.getCurrentActor().name).toBe('vader');
    expect(theater.getCurrentActor().displayValue).toBe('Luke...');
  });

  describe('has a addScene method that', () => {
    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader');
    });

    it('accepts an indefinite number of arguments', async () => {
      theater.addScene('vader:Hey! ', 'How u doing ', 'guys?').play();
      await delay(3000);
      expect(theater.getCurrentActor().displayValue).toBe(
        'Hey! How u doing guys?'
      );
    });

    it('also works with arrays of arguments', async () => {
      theater
        .addScene([
          'vader:Hey! ',
          'How u doing? ',
          'Time to cut some stuff! ',
          'Go on!'
        ])
        .play();
      await delay(6000);
      expect(theater.getCurrentActor().displayValue).toBe(
        'Hey! How u doing? Time to cut some stuff! Go on!'
      );
    });

    it('add a scene from an object and prepend a "done" callback in the arguments', () => {
      const fn = jasmine.createSpy('fn');
      theater.addScene(fn).play();

      expect(fn).toHaveBeenCalled();
    });

    describe('parses arguments to create', () => {
      it('a erase and type scene when given a string prefixed by an actor\'s name', async () => {
        theater.addScene('vader:Hey!').play();
        await delay(3000);

        expect(theater.getCurrentActor().name).toBe('vader');
        expect(theater.getCurrentActor().displayValue).toBe('Hey!');

        theater.addScene('vader:How u doing?').play();
        await delay(3000);

        expect(theater.getCurrentActor().name).toBe('vader');
        expect(theater.getCurrentActor().displayValue).toBe('How u doing?');
      });

      it('a type scene when given a string not prefixed by an actor\'s name', async () => {
        theater.addScene('vader:Hey! ').play();
        await delay(3000);

        theater.addScene('How u doing?').play();
        await delay(3000);

        expect(theater.getCurrentActor().name).toBe('vader');
        expect(theater.getCurrentActor().displayValue).toBe(
          'Hey! How u doing?'
        );
      });

      it('a callback scene when given a function', () => {
        const callback = jasmine.createSpy('callback');
        theater.addScene(callback).play();

        expect(callback).toHaveBeenCalled();
      });

      it('a wait scene when given a positive number', async () => {
        const callback = jasmine.createSpy('callback');
        theater.addScene(1000, callback).play();

        expect(theater.status).toBe('playing');

        await delay(999);

        expect(theater.status).toBe('playing');
        expect(callback).not.toHaveBeenCalled();

        await delay(1);

        expect(theater.status).toBe('playing');
        expect(callback).toHaveBeenCalled();
      });

      it('a erase scene when given a negative number', async () => {
        theater.addScene('vader:Hello!').play();

        await delay(3000);

        expect(theater.getCurrentActor().displayValue).toBe('Hello!');

        theater.addScene(-5).play();

        await delay(3000);

        expect(theater.getCurrentActor().displayValue).toBe('H');
      });

      it('scenes and without calling play if autoplay option is disabled', () => {
        theater.addScene('vader:Hey!');
        expect(theater.status).toBe('ready');
      });

      it('scenes and call play if autoplay option is enabled', () => {
        theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
        theater.addActor('vader').addScene('vader:Hey!');

        expect(theater.status).toBe('playing');
      });
    });
  });

  describe('has a getCurrentSpeech method that', () => {
    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader');
    });

    it('returns the current speech for each type:start event', async () => {
      const expectedSpeeches = ['Hey! ', 'How u doing ', 'guys?'];
      const gatheredSpeeches = [];

      theater.on('type:start', () => {
        gatheredSpeeches.push(theater.getCurrentSpeech());
      });

      theater.addScene('vader:Hey! ', 'How u doing ', 'guys?').play();

      await delay(3000);
      expect(gatheredSpeeches).toEqual(expectedSpeeches);
    });

    it('also works when arrays of arguments are passed to addScene', async () => {
      const expectedSpeeches = [
        'Hey! ',
        'How u doing? ',
        'Time to cut some stuff! ',
        'Go on!'
      ];
      const gatheredSpeeches = [];

      theater.on('type:start', () => {
        gatheredSpeeches.push(theater.getCurrentSpeech());
      });

      theater
        .addScene([
          'vader:Hey! ',
          'How u doing? ',
          'Time to cut some stuff! ',
          'Go on!'
        ])
        .play();

      await delay(10000);
      expect(gatheredSpeeches).toEqual(expectedSpeeches);
    });

    it('returns null when no speech is going on', async () => {
      let gatheredSpeech;
      theater.on('erase:start', () => {
        gatheredSpeech = theater.getCurrentSpeech();
      });

      theater.addScene('vader:Luke...').play();

      await delay(3000);
      expect(gatheredSpeech).toEqual(null);
    });
  });

  describe('has a play method that', () => {
    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader').addScene('vader:Hey!');
    });

    it('sets the current status to playing', () => {
      expect(theater.status).toBe('ready');
      theater.play();
      expect(theater.status).toBe('playing');
    });

    it('plays the next scene in the scenario', async () => {
      expect(theater.status).toBe('ready');
      expect(theater.getCurrentActor()).toEqual(null);

      theater.play();

      expect(theater.status).toBe('playing');
      expect(theater.getCurrentActor().name).toBe('vader');

      await delay(3000);

      expect(theater.status).toBe('ready');
      expect(theater.getCurrentActor().displayValue).toBe('Hey!');
    });
  });

  describe('has a stop method that', () => {
    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader').addScene('vader:Hello!', 'vader:How u doing?');
    });

    it('should stop the scenario', async () => {
      expect(theater.status).toBe('playing');

      theater.stop();

      expect(theater.status).toBe('stopping');

      await delay(3000);
      expect(theater.getCurrentActor().displayValue).toBe('Hello!');
    });

    it('should be resume-able', async () => {
      theater.stop();

      await delay(3000);
      expect(theater.getCurrentActor().displayValue).toBe('Hello!');

      theater.play();

      await delay(3000);
      expect(theater.getCurrentActor().displayValue).toBe('How u doing?');
    });
  });

  describe('has a replay method that', () => {
    it('replays the scenario from scratch', async () => {
      theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater
        .addActor('vader')
        .addActor('luke')
        .addScene('vader:Luke...')
        .addScene('luke:What??');

      await delay(3000);

      expect(theater.status).toBe('ready');
      expect(theater.getCurrentActor().name).toBe('luke');

      theater.replay();

      expect(theater.status).toBe('playing');
      expect(theater.getCurrentActor().name).toBe('vader');
    });
  });

  it('emit an event when a scene starts/ends', async () => {
    const startCallback = jasmine.createSpy('start');
    const endCallback = jasmine.createSpy('end');

    theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
    theater.on('type:start', startCallback).on('type:end', endCallback);
    theater.addActor('vader').addScene('vader:Hello!');

    expect(theater.status).toBe('playing');
    expect(startCallback).toHaveBeenCalledTimes(1);
    expect(endCallback).toHaveBeenCalledTimes(0);

    await delay(3000);

    expect(theater.status).toBe('ready');
    expect(startCallback).toHaveBeenCalledTimes(1);
    expect(endCallback).toHaveBeenCalledTimes(1);
  });

  describe('handle type scenes', () => {
    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader').addScene('vader:Hey!');
    });

    it('can type twice the same stuff', async () => {
      theater.addScene('Hey!').play();
      await delay(3000);
      expect(theater.getCurrentActor().displayValue).toBe('Hey!Hey!');
    });

    it('has support for html', async () => {
      const candidate =
        '<h1 id="some-id" class="some-class">Hey<br/> ' +
        '<strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"></h1>';

      for (let i = 0; i < 20; i += 1) {
        theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));

        theater.addActor('vader', new ActorConfig(0.4, 0.4), () => {}).addScene(`vader:${candidate}`);

        while (theater.status === 'playing') {
          await delay(300);

          const lessThanSymbols = theater
            .getCurrentActor()
            .displayValue.match(/</g);
          const greaterThanSymbols = theater
            .getCurrentActor()
            .displayValue.match(/>/g);
          expect(lessThanSymbols && lessThanSymbols.length).toBe(
            greaterThanSymbols && greaterThanSymbols.length
          );
        }

        expect(theater.getCurrentActor().displayValue).toBe(candidate);
      }
    });
  });

  describe('handle erase scenes that', () => {
    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader').addScene('vader:Hey!', { name: 'erase' });
    });

    it('erase an actor\'s displayValue', async () => {
      theater.play();
      await delay(3000);
      expect(theater.getCurrentActor().displayValue).toBe('');
    });

    it('can erase a given number of characters', async () => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader').addScene('vader:Hello there!');

      theater.play();

      await delay(3000);

      expect(theater.getCurrentActor().displayValue).toBe('Hello there!');

      theater.addScene(-3);
      theater.play();

      await delay(3000);

      expect(theater.getCurrentActor().displayValue).toBe('Hello the');
    });

    it('speed can be configured', async () => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater
        .addActor('vader')
        .addScene('vader:Hello!')
        .play();

      await delay(3000);

      theater.addScene({ name: 'erase', args: [100] }).play();

      expect(theater.getCurrentActor().displayValue).toBe('Hello');

      await delay(99);
      expect(theater.getCurrentActor().displayValue).toBe('Hello');

      await delay(1);
      expect(theater.getCurrentActor().displayValue).toBe('Hell');
    });

    it('has support for html', async () => {
      const candidate =
        '<h1 id="some-id" class="some-class">Hey<br/> ' +
        '<strong aria-attribute="some-attribute">there!</strong><img src="/whatever.png"></h1>';

      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater
        .addActor('vader')
        .addScene(`vader:${candidate}`)
        .play();

      await delay(3000);

      theater.addScene({ name: 'erase' }).play();

      while (theater.status === 'playing') {
        await delay(300);

        const lessThanSymbols = theater
          .getCurrentActor()
          .displayValue.match(/</g);
        const greaterThanSymbols = theater
          .getCurrentActor()
          .displayValue.match(/>/g);
        expect(lessThanSymbols && lessThanSymbols.length).toBe(
          greaterThanSymbols && greaterThanSymbols.length
        );
      }

      expect(theater.getCurrentActor().displayValue).toBe('');
    });

    it('speed can be configured globally and independently from typing speed', async () => {
      const speech = 'Hey there!';
      const typeSpeed = 100;
      const eraseSpeed = 20;

      theater = new TheaterTS(
        new TheaterConfig(true, true, new SpeedConfig(eraseSpeed, typeSpeed), new SpeedConfig(eraseSpeed, typeSpeed))
      );
      theater
        .addActor('vader', new ActorConfig(1, 1))
        .addScene(`vader:${speech}`)
        .addScene({ name: 'erase' });

      await delay((speech.length) * typeSpeed);
      expect(theater.getCurrentActor().displayValue).toBe(speech);

      // that last tick is required for the typeAction
      // to call itself, figure out that it's done typing
      // and it needs to call the done callback
      await delay(typeSpeed);

      await delay((speech.length) * eraseSpeed);
      expect(theater.getCurrentActor().displayValue).toBe('');
    });

    it('should clear displayValue without animation if erase option is false', async () => {
      theater = new TheaterTS(new TheaterConfig(true, false, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater
        .addActor('vader')
        .addScene('vader:Luke.', 'vader:I am your father.');

      theater.stop();
      await delay(3000);

      expect(theater.getCurrentActor().displayValue).toBe('Luke.');

      theater.play();

      expect(theater.getCurrentActor().displayValue).toBe('I');
    });
  });

  describe('handle callback scenes', () => {
    let spy;

    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      spy = jasmine.createSpy('spy');
      theater.addScene(spy);
    });

    it('that calls a function', () => {
      theater.play();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('handle wait scenes', () => {
    beforeEach(() => {
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater.addActor('vader');
    });

    it('that wait a given amount of time before playing next scene', async () => {
      theater.addScene('vader:Hello!').play();

      await delay(3000);

      theater.addScene(800, { name: 'erase' }).play();

      await delay(799);
      expect(theater.getCurrentActor().displayValue).toBe('Hello!');

      await delay(1);
      expect(theater.getCurrentActor().displayValue).toBe('Hello');
    });
  });

  describe('handle sequence scenes', () => {
    let startSpy;
    let endSpy;

    beforeEach(() => {
      startSpy = jasmine.createSpy('start');
      endSpy = jasmine.createSpy('end');
      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));

      theater
        .on('sequence:start', startSpy)
        .on('sequence:end', endSpy)
        .addActor('vader')
        .addScene('vader:Luke.', 'vader:I am your father.');
    });

    it('should emit an event when a sequence starts and ends', async () => {
      expect(startSpy).toHaveBeenCalledTimes(0);
      expect(endSpy).toHaveBeenCalledTimes(0);

      theater.play();
      theater.stop();

      await delay(3000);
      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(endSpy).toHaveBeenCalledTimes(0);

      theater.play();

      await delay(20000);
      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(endSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('emit events when the scenario', () => {
    let startSpy;
    let endSpy;

    beforeEach(() => {
      startSpy = jasmine.createSpy('start');
      endSpy = jasmine.createSpy('end');

      theater = new TheaterTS(new TheaterConfig(false, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
      theater
        .on('scenario:start', startSpy)
        .on('scenario:end', endSpy)
        .addActor('vader')
        .addScene('vader:Luke.', 'vader:I am your father.');
    });

    it('starts', () => {
      expect(startSpy).not.toHaveBeenCalled();

      theater.play();

      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it('ends', async () => {
      expect(endSpy).not.toHaveBeenCalled();

      theater.play();
      await delay(6000);

      expect(endSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should prevent execution of next scene when calling stop in listener', async () => {

    theater = new TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450)));
    const typeEndCallback = jasmine.createSpy('end', () => {
      theater.stop();
    }).and.callFake(() => theater.stop());
    theater
      .on('type:end', typeEndCallback)
      .addActor('vader')
      .addScene('vader:Hey there!', 'vader:How u doing?');

    await delay(5000);

    expect(theater.status).toBe('ready');
    expect(theater.getCurrentActor().displayValue).toBe('Hey there!');
    expect(typeEndCallback).toHaveBeenCalledTimes(1);

    theater.play();
    await delay(5000);

    expect(theater.status).toBe('ready');
    expect(theater.getCurrentActor().displayValue).toBe('How u doing?');
    expect(typeEndCallback).toHaveBeenCalledTimes(2);
  });
});

function delay(ms: number): Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
