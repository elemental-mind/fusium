# Fusium

Class based composition/Mix-Ins in TS & JS made intuitive, elegant and powerful. If you have missed multiple inheritance in TS, you have missed this library.

Write Classes that describe `Traits` of objects and compose those traits to form new, more complex types. If you don't like the official Mix-In syntax and its constraints, this library offers a viable (but experimental) alternative.

## State of the project

This project is experimental and is only roughly tested on V8 based platforms so far.

## Introduction

In object-oriented programming, composition is a design principle that allows for the creation of complex types by combining simpler, more focused types. Unlike inheritance, which defines a class in terms of another class, composition defines a class as containing instances of other classes. This approach offers several benefits:

- Modularity: By breaking down functionality into smaller, reusable components, code becomes more organized and easier to manage.
- Flexibility: Components can be easily replaced or updated without affecting the overall system.  
- Maintainability: Smaller, well-defined components are easier to understand, test, and debug.
- Avoidance of Inheritance Pitfalls: Composition avoids issues like the fragile base class problem and deep inheritance hierarchies that can make code brittle and difficult to refactor.

The Fusium Composition Library leverages TypeScript's advanced type system together with JS proxies to provide a powerful and type-safe way to compose classes. It allows developers to fuse multiple classes into a single one, combining their behaviors and properties without the drawbacks of traditional inheritance.

## Core Concepts

This library is tiny and builds on top of three main ideas:
- **Composable/Trait**: A `Trait` or `Composable` (they are equivalent, but just differently named to aid semantics in certain contexts) is a group of functionality and data that can be composed together. In practice this is bundled together as an ES6-class and can be either used standalone if sufficient or in a `Fusion`. `Traits` may for example be `deletable`, `writable` etc.
- **Fusions**: A `Fusion` is the composition or combination of multiple `Traits` into either a more complex `Trait` or an `Object` that exhibits these `Traits`. A super-trait like "streamable" may, for example, be composed of `Traits` like `asynchronous` and `cancellable` and thus would be a `Fusion` of the two. An `Object` exhibiting these traits may for example be a `Document` that is a `Fusion` of the `writable` and `deletable` Traits.
- **Co-Traits**: Sometimes certain `Traits` need to make assumptions about their "environment". Looking at an example: `UIElement` for instance could be an `Object` that may be `draggable`. This implies, however, that the element is `movable`, and thus has a position on screen - and the `draggable` trait will try to interact with that position in a way. It thus requires the traits `positioned`, `movable` and `pointable` to be other traits of an object that wants to have the `draggable` trait. `positioned`, `pointable` and `moveable` would be `Co-Traits` of `draggable`. `draggable` assumes these traits and `UIElement` must be a `Fusion` of at least these three traits together.

## Installation

Fusium is just an npm install away:

  ```
  npm install fusium-js
  ```

## Usage Examples

Here's a simple pseudo-code example concretizing the concepts above to compose a `UIElement`:

```typescript
import { Trait, CoTraits, FusionOf } from "fusium-js";

// Define the UIElement as a Fusion/Composition of the traits
// Not that UIElement does not contain any logic for wiring traits together as the traits
// already know their environment and how to interact with each other through their defined "Co-Traits"
class UIElement extends FusionOf(Draggable, Movable, Pointable, Positioned) {
    constructor()
    {
        this.onPositionChanged(() => { /*...reRendering logic...*/});
    }
}

// Define the individual traits as classes that extend from Trait
class Positioned extends Trait 
{
  protected x: number;
  protected y: number;
  public onPositionChanged = new EventEmitter();

  setPosition(x, y) {...}
}

// This trait assumes and works with the x and y coordinates from the Co-Trait `Positioned`
class Movable extends CoTraits(Positioned)   
{
  move(dx: number, dy: number) {
    this.setPosition(this.x + dx, this.y + dy);
  }
}

// Note that in order to be Composable, a class (or the base end of its inheritance chain) needs to derive from `Composable` or `Trait`
class Pointable extends Trait   
{
  constructor()
  {
    environment.trackPointer(this)
  }

    onPointerPressed = new EventEmitter();
    onPointerReleased = new EventEmitter();
    onPointerMove = new EventEmitter();
}

// Note that the CoTraits-Function serves very little purpose on JS level (it's a typed Placeholder for `Trait`), but rather helps with type-safety on TS level
// Only the FusionOf-Function actually composes functionality on the JS level
class Draggable extends CoTraits(Pointable, Movable) 
{
    registerListeners()
    {
        this.onPointerPressed(() => this.onPointerMove(handlePressedAndMoved));
    }

    handlePressedAndMoved(dx, dy)
    {
        this.move(dx, dy);
    }
}
```

## Performance

This library should have little effect on runtime performance, except from marginal slow-down in object definition (as the types are composed once you call the "FusionOf"-Function) and object instantiation (single-line constructor-proxy). The resultant classes should still be optimizable by V8 etc. as the prototype chain remains flat and static once "FusionOf" was called, which normally happens while "parsing"/initially running a module.

## Contribution

For now this project is experimental - thus your feedback and input and thoughts are highly appreciated.

## License

Fusium is open-source software licensed under the MIT License. This means you're free to use, modify, and distribute the library, provided you include the original license and copyright notice in any copies or substantial portions of the software.