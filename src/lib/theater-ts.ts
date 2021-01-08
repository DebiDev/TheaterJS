import { Component } from '@angular/core';
import {TheaterConfig} from './models/thearter-config';
import {Keyboard} from './services/keyboard.service';
import {TheaterProps} from './models/theater-props';
import {Actor} from './models/actor';
import {ActorConfig} from './models/actor-config';
import {ArgsType, Scene} from './models/scene';
import {Html} from './services/html.service';

export class TheaterTS {

  get options(): TheaterConfig {
    return this.props.options;
  }

  get status(): string {
    return this.props.status;
  }

  private navigator = typeof window !== 'undefined' && window.navigator;
  private readonly defaultConfig: TheaterConfig;
  private html = new Html();
  private keyboard = new Keyboard();
  private props: TheaterProps = new TheaterProps();

  constructor(options: TheaterConfig = {
    autoplay: true,
    erase: true,
    minSpeed: {erase: 80, type: 80},
    maxSpeed: {erase: 450, type: 450},
    locale: 'detect'
  }) {
    if (options.locale === 'detect' && this.navigator) {
      const {languages} = this.navigator;
      if (Array.isArray(languages) && typeof languages[0] === 'string') {
        options.locale = languages[0].substr(0, 2);
      }
    }

    if (!this.keyboard.supports(options.locale)) {
      options.locale = this.keyboard.defaultLocale;
    }
    this.defaultConfig = options;

    this.props.options = this.defaultConfig;
    this.props.casting = {};
    this.props.status = 'ready';
    this.props.onStage = null;
    this.props.currentScene = -1;
    this.props.scenario = [];
    this.props.events = [];

    this.setCurrentActor(null);
  }

  addActor(actorName: string, options = new ActorConfig(), callback: (displayName: string) => void = null): TheaterTS {
    const a = new Actor(actorName, options, callback);
    this.props.casting[a.name] = a;
    return this;
  }

  getCurrentActor(): Actor {
    return this.props.casting[this.props.onStage] || null;
  }

  addScene(...scenes: ArgsType[]): TheaterTS {
    const sequence = [];
    const that = this;
    function addSceneToSequence(scene: ArgsType[] | ArgsType | Scene | (ArgsType | Scene)[]): void {
      if (Array.isArray(scene)) {
        scene.forEach(s => {
          addSceneToSequence(s);
        });
        return;
      }

      if (typeof scene === 'string') {
        const partials = scene.split(':');

        let actorName;
        if (
          partials.length > 1 &&
          partials[0].charAt(partials[0].length - 1) !== '\\'
        ) {
          actorName = partials.shift();

          addSceneToSequence({name: 'erase', actor: actorName});
        }

        const speech = partials.join(':').replace(/\\:/g, ':');
        const sceneObj = {name: 'type', args: [speech]} as Scene;

        if (actorName != null) {
          sceneObj.actor = actorName;
        }

        addSceneToSequence(sceneObj);
        return;
      }

      if (typeof scene === 'function') {
        addSceneToSequence({name: 'callback', args: [scene]});
        return;
      }

      if (typeof scene === 'number') {
        if (scene > 0) {
          addSceneToSequence({name: 'wait', args: [scene]});
        } else {
          addSceneToSequence({name: 'erase', args: [scene]});
        }
        return;
      }

      // scene is considered an object at this point
      if (!Array.isArray(scene.args)) {
        scene.args = [];
      }

      scene.args.unshift(() => {
        that.publish(`${scene.name}:end`, scene);
        that.playNextScene();
      });

      sequence.push(scene);
    }

    addSceneToSequence(
      [{name: 'publisher', args: ['sequence:start']}]
        // @ts-ignore
        .concat(scenes)
        .concat({name: 'publisher', args: ['sequence:end']})
    );
    Array.prototype.push.apply(this.props.scenario, sequence);

    if (this.props.options.autoplay) {
      this.play();
    }

    return this;
  }

  getCurrentSpeech(): ArgsType {
    const currentScene = this.props.scenario[this.props.currentScene];
    if (!currentScene || !Array.isArray(currentScene.args)) { return null; }
    const [, speech] = currentScene.args;
    return speech || null;
  }

  play(): TheaterTS {
    if (this.props.status === 'stopping') {
      this.props.status = 'playing';
    }

    if (this.props.status === 'ready') {
      this.props.status = 'playing';
      this.playNextScene();
    }

    return this;
  }

  replay(done?: () => void): TheaterTS {
    if (this.props.status === 'ready' || typeof done === 'function') {
      this.props.currentScene = -1;

      if (this.props.status === 'ready') { this.play(); }
      else { done(); }
    }

    return this;
  }

  stop(): TheaterTS {
    this.props.status = 'stopping';
    return this;
  }

  on(events: string, callback: () => void): TheaterTS {
    events.split(',').forEach(eventName => {
      eventName = eventName.trim();

      if (!Array.isArray(this.props.events[eventName])) {
        this.props.events[eventName] = [];
      }

      this.props.events[eventName].push(callback);
    });
    return this;
  }

  private playNextScene(): TheaterTS {
    if (this.props.status === 'stopping') {
      this.props.status = 'ready';
      return this;
    }

    if (this.props.status !== 'playing') { return this; }

    if (this.props.currentScene + 1 >= this.props.scenario.length) {
      this.props.status = 'ready';
      this.publish('scenario:end');
      return this;
    }

    this.props.currentScene += 1;
    const nextScene = this.props.scenario[this.props.currentScene];

    if (this.props.currentScene === 0) {
      this.publish('scenario:start');
    }

    if (nextScene.name === 'publisher') {
      const [done, ...args] = nextScene.args;
      this.publish(...args);

      (done as () => void)();
      return null;
    }

    if (nextScene.actor) {
      this.setCurrentActor(nextScene.actor);
    }
    this.publish(`${nextScene.name}:start`, nextScene);
    switch (nextScene.name) {
      case 'type':
        this.typeAction(nextScene.args[0] as () => void, nextScene.args[1] as string);
        break;

      case 'erase':
        this.eraseAction(nextScene.args[0] as () => void, nextScene.args[1]);
        break;

      case 'callback':
        this.callbackAction(nextScene.args[0] as () => void, nextScene.args[1] as () => void);
        break;

      case 'wait':
        this.waitAction(nextScene.args[0] as () => void, nextScene.args[1] as number);
        break;

      default:
        console.debug(`No scene handler for ${nextScene.name}`);
        break;
    }

    return this;
  }

  private typeAction(done: () => void, value: string): TheaterTS {
    const actor = this.getCurrentActor();
    const that = this;
    const { locale } = this.props.options;
    const minSpeed = this.props.options.minSpeed.type;
    const maxSpeed = this.props.options.maxSpeed.type;
    const initialValue = actor.displayValue;
    let cursor = -1;
    let isFixing = false;
    let previousMistakeCursor = null;
    let previousFixCursor = null;

    const htmlMap = this.html.map(value);
    value = this.html.strip(value);

    function type(): void {

      const actual = that.html.strip(actor.displayValue.substr(initialValue.length));

      if (actual === value) { return done(); }

      const expected = value.substr(0, cursor + 1);
      const isMistaking = actual !== expected;
      const shouldBeMistaken = actor.shouldBeMistaken(
        actual,
        value,
        previousMistakeCursor,
        previousFixCursor
      );

      const shouldFix = isFixing || !shouldBeMistaken;

      if (isMistaking && shouldFix) {
        isFixing = true;
        previousMistakeCursor = null;
        actor.displayValue =
          initialValue +
          that.html.inject(actual.substr(0, actual.length - 1), htmlMap);
        cursor -= 1;
        previousFixCursor = cursor;
      } else {
        isFixing = false;
        cursor += 1;
        let nextChar = value.charAt(cursor);

        if (shouldBeMistaken) {
          nextChar = that.keyboard.randomCharNear(nextChar, locale);

          if (previousMistakeCursor == null) {
            previousMistakeCursor = cursor;
          }
        }
        actor.displayValue =
          initialValue + that.html.inject(actual + nextChar, htmlMap);
      }
      setTimeout(type, actor.getTypingSpeed(minSpeed, maxSpeed));
    }
    type();
    return this;
  }

  private eraseAction(done: () => void, arg: ArgsType): TheaterTS {
    const actor = this.getCurrentActor();
    const that = this;
    // erase scenes are added before a type scene
    // so for the first scene, there's no actor yet
    if (actor == null) {
      done();
      return null;
    }

    if (this.options.erase !== true) {
      actor.displayValue = '';
      done();
      return null;
    }

    const minSpeed = this.props.options.minSpeed.erase;
    const maxSpeed = this.props.options.maxSpeed.erase;

    let value = actor.displayValue;
    const htmlMap = this.html.map(value);

    value = this.html.strip(value);

    let cursor = value.length;

    let speed: number;
    let nbCharactersToErase = 0;

    if (typeof arg === 'number') {
      if (arg > 0) { speed = arg; }
      else { nbCharactersToErase = value.length + arg; }
    }

    function erase(): void {
      if (cursor === nbCharactersToErase) { return done(); }
      cursor -= 1;
      actor.displayValue = that.html.inject(value.substr(0, cursor), htmlMap);
      setTimeout(
        erase,
        speed || actor.getTypingSpeed(minSpeed, maxSpeed)
      );
    }
    erase();
    return this;
  }

  private callbackAction(done: () => void, callback: () => void): TheaterTS {
    callback.call(this, done);
    return this;
  }

  private waitAction(done: () => void, delay: number): TheaterTS {
    setTimeout(done.bind(this), delay);
    return this;
  }

  private publish(...args: (ArgsType | Scene)[]): TheaterTS {
    const eventName = args[0] as string;
    const callbacks = this.props.events[eventName] || [];

    if (callbacks.length > 0) {
      callbacks
        .concat(this.props.events['*'] || [])
        .forEach(callback => callback(...args));
    }

    return this;
  }

  private setCurrentActor(actorName: string): TheaterTS {
    this.props.onStage = actorName;
    return this;
  }

}

