## safe-wrapper

safe-wrapper is a lightweight utility for javascript that simplifies error handling for both synchronous and asynchronous functions. inspired by the [safe assignment operator proposal](https://github.com/arthurfiorette/proposal-safe-assignment-operator), this utility allows for graceful error management by returning a tuple of the result and error, making it easy to handle various error types.

#### Installation

```
npm install safe-wrapper
```

#### Usage

import `safe` from `safe-wrapper` to use it with any function. it takes the result of a function as its first argument and an optional array of `error types` to catch as the second argument. the function returns an array `[error, result]`, where `error` is an instance of the specified error type or `null` if successful, and `result` is the result of the function when there is no error.

#### synchronous example

in this example, we handle a synchronous function that may return an error.

```javascript
import { safe } from 'safe-wrapper';

const sync = () => {
  return new Error('sync error occurred');
}

const [error, result] = safe(sync());

if (error) {
  return handle(error);
}

return handle(result);
```

#### synchronous example with error type check

we can specify error types to catch specific errors. if an unknown error type occurs, it will be thrown instead.

```javascript
import { safe } from 'safe-wrapper';

const sync = () => {
  return new TypeError('sync type error occurred');
}

const [error, result] = safe(sync(), [TypeError]);

if (error) {
  return handle(error);
}

return handle(result);
```

#### asynchronous example

in this example, we handle a synchronous function that may throw an error.

```javascript
import { safe } from 'safe-wrapper';

const async = () => {
  throw new Error('async error occurred');
}

const [error, result] = await safe(async());

if (error) {
  return handle(error);
}

return handle(result);
```

#### asynchronous example with error type check

we can specify error types with asynchronous functions as well.

```javascript
import { safe } from 'safe-wrapper';

const async = () => {
  throw new TypeError('async type error occurred');
}

const [error, result] = await safe(async(), [TypeError]);

if (error) {
  return handle(error);
}

return handle(result);
```

#### Important Notes
- async operations: should throw errors when they fail.
- sync operations: should return errors instead of throwing them.

#### API

```safe(response, types)```
- parameters
  - response (any): result of the function call, either synchronous or asynchronous.
  - types (array, optional): an array of error types to catch specifically. if an error does not match any of these types, it will be thrown.
- returns `[error, result]`
  - error (error | null): the error caught from the function, if any.
  - result (any): the result of the function, if no error occurs.
