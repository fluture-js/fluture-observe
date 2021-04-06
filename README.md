# Fluture Observe

Consume a [Fluture][] Future, observing changes to its state as the
consumption is happening.

## Usage

### Node

```console
$ npm install --save fluture-observe
```

On Node 12 and up, this module can be loaded directly with `import` or
`require`. On Node versions below 12, `require` or the [esm][]-loader can
be used.

### Deno and Modern Browsers

You can load the EcmaScript module from various content delivery networks:

- [Skypack](https://cdn.skypack.dev/fluture-observe@1.1.0)
- [JSPM](https://jspm.dev/fluture-observe@1.1.0)
- [jsDelivr](https://cdn.jsdelivr.net/npm/fluture-observe@1.1.0/+esm)

### Old Browsers and Code Pens

There's a [UMD][] file included in the NPM package, also available via
jsDelivr: https://cdn.jsdelivr.net/npm/fluture-observe@1.1.0/dist/umd.js

This file adds `flutureObserve` to the global scope, or use CommonJS/AMD
when available.

### Usage Example

```js
import {observe, cata} from 'fluture-observe/index.js';

const consume = observe (cata ({
  Idle: () => {
    console.log ('Computation is idle.');
  },
  Pending: cancel => {
    console.log ('Computation is pending. Send SIGINT to cancel it');
    process.once ('SIGINT', cancel);
  },
  Canceled: future => {
    console.log ('Computation was canceled. Send SIGINT to restart it');
    process.once ('SIGINT', () => consume (future));
  },
  Crashed: error => {
    console.error ('I am sorry to inform you:', error);
    process.exit (1);
  },
  Rejected: reason => {
    console.log ('The computation rejected with reason', reason);
  },
  Resolved: value => {
    console.log ('The computation resolved with value', value);
  }
}));
```

## API

#### <a name="Computation" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L69">`Computation :: Type`</a>

A [Daggy][] tagged union type representing the state of the consumption of
a Future. The `Cancel` and `Future` types below are imported
[types from Fluture][].

```hs
data Computation a b = Idle
                     | Pending Cancel
                     | Cancelled (Future a b)
                     | Crashed Error
                     | Rejected a
                     | Resolved b
```

Constructor details are documented below.

#### <a name="Idle" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L94">`Idle :: Computation a b`</a>

Represents a not running computation.

#### <a name="Pending" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L99">`Pending :: Cancel -⁠> Computation a b`</a>

Represents a running computation which can be cancelled.

#### <a name="Canceled" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L104">`Canceled :: Future a b -⁠> Computation a b`</a>

Represents a computation that was cancelled and can be restarted.

#### <a name="Crashed" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L109">`Crashed :: Error -⁠> Computation a b`</a>

Represents a computation which encountered an exception while running.

#### <a name="Rejected" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L114">`Rejected :: a -⁠> Computation a b`</a>

Represents a computation which rejected with a reason.

#### <a name="Resolved" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L119">`Resolved :: b -⁠> Computation a b`</a>

Represents a computation which resolved with a value.

#### <a name="cata" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L124">`cata :: { Idle :: () -⁠> c, Pending :: Cancel -⁠> c, Canceled :: Future a b -⁠> c, Crashed :: Error -⁠> c, Rejected :: a -⁠> c, Resolved :: b -⁠> c } -⁠> Computation a b -⁠> c`</a>

[Daggy][]'s catamorphism as a curried function.

#### <a name="observe" href="https://github.com/fluture-js/fluture-observe/blob/v1.1.0/index.js#L133">`observe :: (Computation a b -⁠> Any) -⁠> Future a b -⁠> Undefined`</a>

Consume a Future, observing changes to its state. See [usage](#usage).

[Fluture]: https://github.com/fluture-js/Fluture
[Daggy]: https://github.com/fantasyland/daggy
[types from Fluture]: https://github.com/fluture-js/Fluture#types
[esm]: https://github.com/standard-things/esm
[UMD]: https://github.com/umdjs/umd
