//# Fluture Observe
//.
//. Consume a [Fluture][] Future, observing changes to its state as the
//. consumption is happening.
//.
//. ## Usage
//.
//. ```js
//. import {observe, cata} from 'fluture-observe/index.js';
//.
//. const consume = observe (cata ({
//.   Idle: () => {
//.     console.log ('Computation is idle.');
//.   },
//.   Pending: cancel => {
//.     console.log ('Computation is pending. Send SIGINT to cancel it');
//.     process.once ('SIGINT', cancel);
//.   },
//.   Canceled: future => {
//.     console.log ('Computation was canceled. Send SIGINT to restart it');
//.     process.once ('SIGINT', () => consume (future));
//.   },
//.   Crashed: error => {
//.     console.error ('I am sorry to inform you:', error);
//.     process.exit (1);
//.   },
//.   Rejected: reason => {
//.     console.log ('The computation rejected with reason', reason);
//.   },
//.   Resolved: value => {
//.     console.log ('The computation resolved with value', value);
//.   }
//. }));
//. ```
import daggy from 'daggy';
import {forkCatch, isFuture} from 'fluture/index.js';

//# Computation :: Type
//.
//. A [Daggy][] tagged union type representing the state of the consumption of
//. a Future. The `Cancel` and `Future` types below are imported
//. [types from Fluture][].
//.
//. ```hs
//. data Computation a b = Idle
//.                      | Pending Cancel
//.                      | Cancelled (Future a b)
//.                      | Crashed Error
//.                      | Rejected a
//.                      | Resolved b
//. ```
//.
//. Constructor details are documented below.
export var Computation = daggy.taggedSum ('Computation', {
  Idle: [],
  Pending: ['cancel'],
  Canceled: ['future'],
  Crashed: ['exception'],
  Rejected: ['reason'],
  Resolved: ['value']
});

//# Idle :: Computation a b
//.
//. Represents a not running computation.
export const Idle = Computation.Idle;

//# Pending :: Cancel -> Computation a b
//.
//. Represents a running computation which can be cancelled.
export const Pending = Computation.Pending;

//# Canceled :: Future a b -> Computation a b
//.
//. Represents a computation that was cancelled and can be restarted.
export const Canceled = Computation.Canceled;

//# Crashed :: Error -> Computation a b
//.
//. Represents a computation which encountered an exception while running.
export const Crashed = Computation.Crashed;

//# Rejected :: a -> Computation a b
//.
//. Represents a computation which rejected with a reason.
export const Rejected = Computation.Rejected;

//# Resolved :: a -> Computation a b
//.
//. Represents a computation which resolved with a value.
export const Resolved = Computation.Resolved;

//# cata :: { Idle :: () -> c, Pending :: Cancel -> c, Canceled :: Future a b -> c, Crashed :: Error -> c, Rejected :: a -> c, Resolved :: b -> c } -> Computation a b -> c
//.
//. [Daggy][]'s catamorphism as a curried function.
export function cata(cases) {
  return function(t) {
    return t.cata (cases);
  };
}

//# observe :: (Computation a b -> Any) -> Future a b -> Undefined
//.
//. Consume a Future, observing changes to its state. See [usage](#usage).
export function observe(f) {
  if (typeof f !== 'function') {
    throw new TypeError (
      'observe() expects its first argument to be a Function.'
    );
  }

  return function observe(m) {
    if (!isFuture (m)) {
      throw new TypeError (
        'observe() expects its second argument to be a valid Future.'
      );
    }

    var settled = false;

    f (Computation.Idle);

    var unsubscribe = m.pipe (forkCatch (function observe$recover(exception) {
      settled = true;
      f (Computation.Crashed (exception));
    }) (function observe$reason(reason) {
      settled = true;
      f (Computation.Rejected (reason));
    }) (function observe$value(value) {
      settled = true;
      f (Computation.Resolved (value));
    }));

    if (settled) return;

    f (Computation.Pending (function observe$cancel() {
      unsubscribe ();
      f (Computation.Canceled (m));
    }));
  };
}

//. [Fluture]: https://github.com/fluture-js/Fluture
//. [Daggy]: https://github.com/fantasyland/daggy
//. [types from Fluture]: https://github.com/fluture-js/Fluture#types
