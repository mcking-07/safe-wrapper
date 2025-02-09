import { test } from 'node:test';
import { deepStrictEqual, rejects, throws } from 'node:assert';
import { safe } from '../src/index.js';

test('safe - synchronous function', () => {
  const sync = safe(() => 'success');

  deepStrictEqual(sync(), [null, 'success']);
});

test('safe - synchronous function with error', () => {
  const sync = safe(() => { throw new Error('sync error'); });

  deepStrictEqual(sync(), [new Error('sync error'), null]);
});

test('safe - synchronous function with error type check', async () => {
  const sync = safe(() => { throw new TypeError('type error'); }, [TypeError]);

  deepStrictEqual(sync(), [new TypeError('type error'), null]);
});

test('safe - synchronous function with unknown error', async () => {
  const sync = () => { throw new Error('unknown error'); };

  throws(() => safe(sync(), [TypeError]), { name: 'Error', message: 'unknown error' });
});

test('safe - asynchronous function', async () => {
  const async = safe(async () => 'async success');

  deepStrictEqual(await async(), [null, 'async success']);
});

test('safe - asynchronous function with error', async () => {
  const async = async () => { throw new Error('async error'); };
  const safeAsync = safe(async);

  deepStrictEqual(await safeAsync(), [new Error('async error'), null]);
});

test('safe - asynchronous function with error type check', async () => {
  const async = async () => { throw new TypeError('type error'); };
  const safeAsync = safe(async, [TypeError]);

  deepStrictEqual(await safeAsync(), [new TypeError('type error'), null]);
});

test('safe - asynchronous function with unknown error', async () => {
  const async = safe(async () => { throw new Error('unknown error'); }, [TypeError]);

  await rejects(async(), { name: 'Error', message: 'unknown error' });
});

test('safe - built-in function', () => {
  const safeJsonParse = safe(JSON.parse);

  deepStrictEqual(safeJsonParse('{"key": "value"}'), [null, { key: 'value' }]);
});

test('safe - built-in function with error', () => {
  const safeJsonParse = safe(JSON.parse);

  deepStrictEqual(safeJsonParse('invalid json'), [new SyntaxError('Unexpected token \'i\', "invalid json" is not valid JSON'), null]);
});

test('safe - built-in function with error type check', () => {
  const safeJsonParse = safe(JSON.parse, [SyntaxError]);

  deepStrictEqual(safeJsonParse('invalid json'), [new SyntaxError('Unexpected token \'i\', "invalid json" is not valid JSON'), null]);
});

test('safe - built-in function with unknown error', () => {
  const safeJsonParse = safe(JSON.parse, [TypeError]);

  throws(() => safeJsonParse('{ key: "value" }'), { name: 'SyntaxError', message: 'Expected property name or \'}\' in JSON at position 2' });
});

test('safe - synchronous function with transformed error', () => {
  const sync = safe(() => { throw new Error('sync error'); }, [], error => new Error(`transformed ${error.message}`));

  deepStrictEqual(sync(), [new Error('transformed sync error'), null]);
});

test('safe - asynchronous function with transformed error', async () => {
  const async = async () => { throw new Error('async error'); };
  const safeAsync = safe(async, [], async (error) => new Error(`transformed ${error.message}`));

  deepStrictEqual(await safeAsync(), [new Error('transformed async error'), null]);
});
