# Fluture Observe

Consume a [Fluture][] Future, observing changes to its state as the
consumption is happening.

## Usage

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

#### <a name="Computation" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L38">`Computation :: Type`</a>

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

#### <a name="Idle" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L63">`Idle :: Computation a b`</a>

Represents a not running computation.

#### <a name="Pending" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L68">`Pending :: Cancel -⁠> Computation a b`</a>

Represents a running computation which can be cancelled.

#### <a name="Canceled" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L73">`Canceled :: Future a b -⁠> Computation a b`</a>

Represents a computation that was cancelled and can be restarted.

#### <a name="Crashed" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L78">`Crashed :: Error -⁠> Computation a b`</a>

Represents a computation which encountered an exception while running.

#### <a name="Rejected" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L83">`Rejected :: a -⁠> Computation a b`</a>

Represents a computation which rejected with a reason.

#### <a name="Resolved" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L88">`Resolved :: b -⁠> Computation a b`</a>

Represents a computation which resolved with a value.

#### <a name="cata" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L93">`cata :: { Idle :: () -⁠> c, Pending :: Cancel -⁠> c, Canceled :: Future a b -⁠> c, Crashed :: Error -⁠> c, Rejected :: a -⁠> c, Resolved :: b -⁠> c } -⁠> Computation a b -⁠> c`</a>

[Daggy][]'s catamorphism as a curried function.

#### <a name="observe" href="https://github.com/fluture-js/fluture-observe/blob/v1.0.2/index.js#L102">`observe :: (Computation a b -⁠> Any) -⁠> Future a b -⁠> Undefined`</a>

Consume a Future, observing changes to its state. See [usage](#usage).

[Fluture]: https://github.com/fluture-js/Fluture
[Daggy]: https://github.com/fantasyland/daggy
[types from Fluture]: https://github.com/fluture-js/Fluture#types
