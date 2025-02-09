## safe-wrapper

[![npm version](https://img.shields.io/npm/v/safe-wrapper.svg)](https://www.npmjs.com/package/safe-wrapper)
[![License](https://img.shields.io/npm/l/safe-wrapper.svg)](https://github.com/mcking-07/safe-wrapper/blob/main/LICENSE)
[![Build Status](https://github.com/mcking-07/safe-wrapper/workflows/publish/badge.svg)](https://github.com/mcking-07/safe-wrapper/actions)
[![npm downloads](https://img.shields.io/npm/dm/safe-wrapper.svg)](https://www.npmjs.com/package/safe-wrapper)

safe-wrapper is a lightweight utility for javascript that simplifies error handling for both synchronous and asynchronous functions. inspired by the [safe assignment operator proposal](https://github.com/arthurfiorette/proposal-safe-assignment-operator), this utility allows for graceful error management by wrapping functions in a way that enables error handling without the need for explicit `try-catch` blocks.

### Features

- handles synchronous and asynchronous functions.
- supports specifying error types to control which errors are caught and handled.
- returns consistent responses in `[error, result]` format where error is null if no error occurred.
- supports custom error transformation for advanced error handling.

### Installation

```sh
npm install safe-wrapper
```

### Usage

import `safe` from `safe-wrapper` to use it with any function.

the `safe` function takes a target function (synchronous or asynchronous) and returns a function which handles errors and returns a response in a consistent way. the function returns an array `[error, result]`, where `error` is an instance of the specified error type or `null` if successful, and `result` is the result of the function when there is no error.

#### directly wrapping functions

we can directly wrap any function definition with safe.

```javascript
import { safe } from 'safe-wrapper';

const safeSync = safe((args) => {
  throw new Error('sync error occurred');
});

const safeAsync = safe(async (args) => {
  throw new Error('async error occurred');
});

const [error, result] = await safeAsync(args);
```

#### wrapping existing functions

safe can be applied to pre-existing functions, including ones from third-party libraries.

```javascript
import { safe } from 'safe-wrapper';

const sync = (args) => {
  throw new Error('sync error occurred');
}

const safeSync = safe(sync);
const [error, result] = safeSync(args);
```

#### handling specific error types

we can specify error types to catch, allowing other errors to throw.

```javascript
import { safe } from 'safe-wrapper';

const safeAsync = safe(async (args) => {
  throw new TypeError('async type error occurred');
}, [TypeError]);

const [error, result] = await safeAsync(args);
```

#### handling multiple error types

we can specify multiple error types when wrapping a function, enabling safe to catch any of the specified errors.

```javascript
import { safe } from 'safe-wrapper';

const sync = (args) => {
  if (args) {
    throw new TypeError('sync type error occurred');
  } else {
    throw new RangeError('sync range error occurred');
  }
}

const safeSync = safe(sync, [TypeError, RangeError]);
const [error, result] = safeSync(args);
```

#### using custom error transformer

you can provide a custom error transformer function to modify how errors are handled:

```javascript
import { safe } from 'safe-wrapper';

const transformer = (error) => ({
  code: error.name,
  message: error.message,
  timestamp: new Date()
});

const safeWithTransform = safe(
  () => { throw new Error('custom error'); },
  [Error],
  transformer
);

const [error, result] = safeWithTransform();
// error will be: { code: 'Error', message: 'custom error', timestamp: Date }
```

#### wrapping built-in functions

we can also wrap built-in functions, like `JSON.parse`, `Object.keys`, and more.

```javascript
import { safe } from 'safe-wrapper';

const safeJsonParse = safe(JSON.parse);
const [error, result] = safeJsonParse('invalid_json');

const [error, result] = safe(Object.keys, [TypeError])(null);
```

### API Reference

`safe(action, types, transformer)`

- parameters
  - action (function): function to be wrapped. it can either be synchronous or asynchronous.
  - types (array, optional): an array of error types to catch. if no types are specified, all errors are caught. each element must be a valid error constructor.
  - transformer (function, optional): a function that takes an error object and returns a transformed version of it. if not provided, the original error is used.
- returns `[error, result]`
  - error (error | null): the error object if error occurred, otherwise null. if an transformer is provided, this will be the transformed error.
  - result (any): the result of the action function if no error occurred, otherwise null.
