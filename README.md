# TheaterTS

Typing animation mimicking human behavior.

This repository is a rework in Typescript of the library [TheaterJS](https://github.com/Zhouzi/TheaterJS) done by [Zhouzi](https://github.com/Zhouzi)

- [CodePen Demo](http://codepen.io/Zhouzi/full/JoRazP/)
- [Showcase](https://github.com/DebiDev/TheaterTS#showcase)
- [Installation](https://github.com/DebiDev/TheaterTS#installation)
- [Documentation](https://github.com/DebiDev/TheaterTS#documentation)
- [Localized Keyboards](https://github.com/DebiDev/TheaterTS#localized-keyboards)

_If you're not particularly interested in managing multiple actors and the several features TheaterJS has to offer (e.g mistakes, variable speed, callbacks, html support, and so on), have a look at this [fiddle](https://jsfiddle.net/p1e9La6w/). It's a minimalist version that supports play/stop, it has a lot of comments so you understand what's going on under the hood. It might well be enough for you usage :)_

## Installation

With npm:

```
npm install theater-ts
```

## Example

```html
<div id="vader"></div>
<div id="luke"></div>
```
```typescript
const theaterOptions = new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450));
this.theaterTS = new TheaterTS(theaterOptions);
this.theaterTS.on('type:start, erase:start', () => {
  // add a class to actor's dom element when he starts typing/erasing
  const actor = this.theaterTS.getCurrentActor();
  actor.element.classList.add('is-typing');
})
.on('type:end, erase:end', () => {
  // and then remove it when he's done
  const actor = this.theaterTS.getCurrentActor();
  actor.element.classList.remove('is-typing');
});
this.theaterTS
  .addActor('vader', new ActorConfig(0.5, 0.5))
this.theater.addActor("vader").addActor("luke");

this.theater
.addScene("vader:Luke...", 400)
.addScene("luke:What?", 400)
.addScene("vader:I am", 200, ".", 200, ".", 200, ". ")
.addScene("Your father!")
.addScene(theater.replay());
```

## Documentation

To get started, you'll first need to create a new TheaterTS object by providing some options.


| Param   | Default                                  | Description            |
| ------- | ---------------------------------------- | ---------------------- |
| options | `{autoplay, erase, minSpeed, maxSpeed, locale}` | Options _(see below)_. |

Breakdown of the available options:

| Option   | Default                     | Description                                                                                                                                                    |
| -------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autoplay | `true`                      | If true, automatically play the scenario (when calling `addScene`).                                                                                            |
| erase    | `true`                      | Whether you want an erase animation or not (in this case, it will just erase the whole sentence)                                                               |
| minSpeed | `{ erase: 80, type: 80 }`   | Minimum delay between each typed characters (the lower, the faster).                                                                                           |
| maxSpeed | `{ erase: 450, type: 450 }` | The maximum delay between each typed characters (the greater, the slower).                                                                                     |
| locale   | `detect`                    | Determine which keyboard to use when typing random characters (mistakes). Note: `"detect"` is an option to detect the user's locale and use if it's supported. |

TheaterTS objects have two public (read only) properties:

- `theater.options`: object's options.
- `theater.status`: object's status (whether "playing", "stopping" or "ready").

### addActor

Add an actor to the casting.

**Example**

```typescript
var theater = TheaterTS();

theater
  .addActor("vader")
  .addActor("luke", 0.8, ".luke-selector")
  .addActor("yoda", { accuracy: 0.4, speed: 0.6 }, function(displayValue) {
    console.log("%s said yoda", displayValue);
  });
```

**Usage**

```typescript
theater.addActor(<name>, <options>, <callback>)
```

| Param                      | Default                   | Description                                                  |
| -------------------------- | ------------------------- | ------------------------------------------------------------ |
| name: string               |                           | Name used to identify the actor.                             |
| options: ActorConfig       | accuracy: 0.8, speed: 0.8 | Actor's options, use it like this: new ActorConfig(0.5, 0.6) |
| callback: (string) => void | **(see below)**           | A function to call when actor's display value changes.       |

Actors have two options:

- `accuracy` (number between 0 and 0.8): used to determine how often an actor should make mistakes.
- `speed` (number between 0 and 1): used to determine how fast the actor types.

Note: the delay between each typed character varies to "mimick human behavior".

An actor callback is a function that is called when its display value is set.
The default callbalck is : 
```typescript
(newValue) => {
  this.element.innerHTML = newValue;
}
```
You can safely ignore this argument if you gave the target element an id with the name of the actor, i.e:

```typescript
theater.addActor("vader");
```

In this situation, TheaterJS will look for an element that matches the selector `#vader`.
Also note that the actor will have an additional `$element` property referring to the DOM element when using a selector string.

### getCurrentActor

Return the actor that is currently playing.

**Example**

```typescript
const theater = TheaterTS();

theater
  .addActor("vader")
  .addScene("vader:Luke...")
  .addScene((done) => {
    var vader = theater.getCurrentActor();
    vader.$element.classList.add("dying");
    done();
  });
```

**Usage**

```typescript
this.theater.getCurrentActor();
```

### addScene

Add scenes to the scenario and play it if `options.autoplay` is true.

**Example**

```typescript
const theater = TheaterTS();

theater
  .addActor("vader")
  .addScene("vader:Luke... ", "Listen to me!", 500)
  .addScene(theater.replay());
```

**Usage**

```typescript
theater.addScene(<scene>)
```

A scene can be of 5 different types:

```typescript
theater
  .addScene("vader:Luke... ") // 1
  .addScene(800) // 2
  .addScene("I am your father!") // 3
  .addScene(-7) // 4
  .addScene("mother!")
  .addScene(function(done) {
    // do stuff
    done();
  }); // 5
```

1. `.addScene('vader:Luke... ')` erase actor's current display value, then type the new value.
2. `.addScene(800)` make a break of `800` milliseconds before playing the next scene.
3. `.addScene('I am your father!')` append value to the current actor's display value.
4. `.addScene(-7)` erase `7` characters.
5. `.addScene(fn)` call fn which receives a done callback as first argument (calling `done()` plays the next scene in the scenario).

Note that addScene actually accepts an infinite number of arguments so you could just do:

```typescript
theater
  .addScene("vader:Luke... ", 800, "I am your father!")
  .addScene(-7, "mother!")
  .addScene(fn);
```

### getCurrentSpeech

Return the speech that is currently playing.

**Example**

```typescript
const theater = TheaterTS();

theater
  .addActor("vader")
  .addScene("vader:Luke...")
  .on("type:start", () => {
    console.log(theater.getCurrentSpeech()); // outputs 'Luke...'
  });
```

**Usage**

```typescript
this.theater.getCurrentSpeech();
```

### play

Play the scenario.

**Example**

```typescript
var theater = TheaterTS({ autoplay: false });

theater.addActor("vader").addScene("vader:Luke...");

document.querySelector("button").addEventListener(
  "click",
  function() {
    theater.play();
  },
  false
);
```

**Usage**

```typescript
theater.play();
```

### replay

Replay the scenario from scratch (can be used as a callback to create a loop).

**Example**

```typescript
var theater = TheaterTS();

theater
  .addActor("vader")
  .addScene("vader:Luke...")
  .addScene(theater.replay());
```

**Usage**

```typescript
theater.replay();
```

### stop

Stop the scenario after the current playing scene ends.

**Example**

```typescript
var theater = TheaterTS();

theater.addActor("vader").addScene("vader:Luke... ", "I am your father...");

document.querySelector("button").addEventListener(
  "click",
  function() {
    theater.stop();
  },
  false
);
```

**Usage**

```typescript
theater.stop();
```

### on

Add a callback to execute when an event is emitted (e.g when a scene starts/ends).

**Example**

```typescript
var theater = TheaterTS();

theater
  .on("type:start, erase:start", function() {
    var actor = theater.getCurrentActor();
    actor.$element.classList.add("blinking-caret");
  })
  .on("type:end, erase:end", function() {
    var actor = theater.getCurrentActor();
    actor.$element.classList.remove("blinking-caret");
  });

theater.addActor("vader").addScene("vader:Luke...");
```

**Usage**

```typescript
theater.on(eventName: string, callback: () => void)
```

| Param     | Default | Description                                    |
| --------- | ------- | ---------------------------------------------- |
| eventName |         | Event's name to listen to.                     |
| callback  |         | Function to call when the event got published. |

The callback function receives the event's name as first argument.

A couple of things to note:

- Listen to all event by using the shortcut: `theater.on('*', callback)`.
- An event is emitted when a sequence starts (`sequence:start`) and ends (`sequence:end`), e.g `theater.addScene('vader:Luke.', 'vader:I am your father.')` is one sequence.
- An event is emitted when the scenario starts and ends, respectively `scenario:start` and `scenario:end`.
- The scenario is stoppable within `:end` event listeners. It means that calling `theater.stop()` within a callback that listen for the `:end` of a scene will stop the scenario. This is useful for asynchronous callbacks (e.g animations).

## Localized Keyboards

When making a mistake, an actor's gonna type a random character near the one he intended to.
Those characters are taken from a "mapped" keyboard that you can configure on TheaterTS' instantiation: `TheaterTS(new TheaterConfig(true, true, new SpeedConfig(80, 80), new SpeedConfig(450, 450), 'en'))`.

Available keyboard: 'en', 'fr', 'da', 'de', 'pl', 'pt', 'ru', 'es', 'el'
