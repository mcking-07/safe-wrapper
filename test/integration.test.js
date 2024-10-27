import { test } from 'node:test';
import { deepStrictEqual, rejects, throws } from 'node:assert';
import { safe } from '../src/index.js';

test('safe - synchronous function', () => {
  const sync = () => 'success';

  deepStrictEqual(safe(sync()), [null, 'success']);
});

test('safe - synchronous function with error', () => {
  const sync = () => new Error('sync error');

  deepStrictEqual(safe(sync()), [new Error('sync error'), null]);
});

test('safe - synchronous function with error type check', async () => {
  const sync = () => new TypeError('type error');

  deepStrictEqual(safe(sync(), [TypeError]), [new TypeError('type error'), null]);
});

test('safe - synchronous function with unknown error', async () => {
  const sync = () => new Error('unknown error');

  throws(() => safe(sync(), [TypeError]), { name: 'Error', message: 'unknown error' });
});

test('safe - asynchronous function', async () => {
  const async = async () => 'async success';

  deepStrictEqual(await safe(async()), [null, 'async success']);
});

test('safe - asynchronous function with error', async () => {
  const async = async () => { throw new Error('async error'); };

  deepStrictEqual(await safe(async()), [new Error('async error'), null]);
});

test('safe - asynchronous function with error type check', async () => {
  const async = async () => { throw new TypeError('type error'); };

  deepStrictEqual(await safe(async(), [TypeError]), [new TypeError('type error'), null]);
});

test('safe - asynchronous function with unknown error', async () => {
  const async = async () => { throw new Error('unknown error'); };

  await rejects(safe(async(), [TypeError]), { name: 'Error', message: 'unknown error' });
});
