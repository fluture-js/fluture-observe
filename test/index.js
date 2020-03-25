import * as fo from '../index.js';
import * as fl from 'fluture/index.js';
import {isDeepStrictEqual} from 'util';
import test from 'oletus';

function always(x) {
  return function(y) {
    return x;
  };
}

function equals(a) {
  return function(b) {
    return isDeepStrictEqual (a, b);
  };
}

function crash(x) {
  return fl.Future (function() {
    throw x;
  });
}

function expectSequence(future) {
  return function expectSequence(sequence) {
    return new Promise (function(res, rej) {
      let t;
      let i = 0;
      resetTimeout ();
      future.pipe (fo.observe (c => {
        if (i === sequence.length) {
          rej (new Error ('More events emitted than expected: ' + c));
          return;
        }
        if (!sequence[i] (c)) {
          rej (new Error ('Assertion ' + i + ' failed'));
          return;
        }
        i += 1;
        if (i === sequence.length) {
          clearTimeout (t);
          setTimeout (res, 100);
        }
      }));
      function resetTimeout() {
        clearTimeout (t);
        t = setTimeout (rej, 100, new Error ('Not enough events emitted after ' + i));
      }
    });
  };
}

test ('observe, bad first argument', ({throws}) => {
  throws (function() {
    fo.observe (null);
  }, new TypeError (
    'observe() expects its first argument to be a Function.'
  ));
});

test ('observe, bad second argument', ({throws}) => {
  throws (function() {
    fo.observe (always) (null);
  }, new TypeError (
    'observe() expects its second argument to be a valid Future.'
  ));
});

test ('observe a forever pending Future', () => expectSequence (fl.never) ([
  fo.Idle.is,
  fo.Pending.is
]));

test ('observe and cancel a Future', () => expectSequence (fl.never) ([
  fo.Idle.is,
  fo.cata ({
    Idle: always (false),
    Pending: cancel => {
      setImmediate (cancel);
      return true;
    },
    Canceled: always (false),
    Crashed: always (false),
    Rejected: always (false),
    Resolved: always (false)
  }),
  equals (fo.Canceled (fl.never))
]));

test ('observe an immediately crashing Future', () => expectSequence (crash (42)) ([
  fo.Idle.is,
  fo.cata ({
    Idle: always (false),
    Pending: always (false),
    Canceled: always (false),
    Crashed: x => x instanceof Error,
    Rejected: always (false),
    Resolved: always (false)
  })
]));

test ('observe an eventually crashing Future', () => expectSequence (fl.chain (crash) (fl.after (10) (42))) ([
  fo.Idle.is,
  fo.Pending.is,
  fo.cata ({
    Idle: always (false),
    Pending: always (false),
    Canceled: always (false),
    Crashed: x => x instanceof Error,
    Rejected: always (false),
    Resolved: always (false)
  })
]));

test ('observe an immediately rejecting Future', () => expectSequence (fl.reject (42)) ([
  fo.Idle.is,
  equals (fo.Rejected (42))
]));

test ('observe an eventually rejecting Future', () => expectSequence (fl.rejectAfter (10) (42)) ([
  fo.Idle.is,
  fo.Pending.is,
  equals (fo.Rejected (42))
]));

test ('observe an immediately resolving Future', () => expectSequence (fl.resolve (42)) ([
  fo.Idle.is,
  equals (fo.Resolved (42))
]));

test ('observe an eventually resolving Future', () => expectSequence (fl.after (10) (42)) ([
  fo.Idle.is,
  fo.Pending.is,
  equals (fo.Resolved (42))
]));
