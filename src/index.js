/**
 * a module providing consistent error handling and response structures, for both synchronous and asynchronous operations.
 * 
 * @module safe
 */

/**
 * creates a consistent response structure for the package.
 * 
 * @template R
 * @template [T = Error]
 * 
 * @param {Object} params - an object with `error`, `data` and `result` keys.
 * @param {Error | T | null} [params.error = null] - the error object.
 * @param {R | null} [params.data = null] - the data object.
 * @param {R | undefined} [params.result = undefined] - the result object.
 * 
 * @returns {[Error | T | null, R | null]} - a tuple where the first element is the error object or the transformed error object, if available and the second element is the result or data (whichever is available).
 */
const response = ({ error = null, data = null, result = undefined }) => [error, result !== undefined ? result : data];

/**
 * checks if a value is a promise or a thenable object.
 * 
 * @template P
 * 
 * @param {P} result - the value to check.
 * @returns {boolean} - `true` if the value is a promise or a thenable object, `false` otherwise.
 */
const promised = (result) => result instanceof Promise || typeof result?.then === 'function';

/**
 * transforms an error object using the specified transformer function. can be used to transform errors from synchronous or asynchronous operations.
 * 
 * @template [T = Error]
 * 
 * @param {(error: Error) => Promise<T> | T} [transformer] - the function to transform the error object.
 * 
 * @returns {(...args: Error[], any) => Promise<[T, null]> | [T, null]} - a consistent response structure, `[error, null]`.
 */
const transform = (transformer) => (...args) => {
  try {
    const transformed = transformer(...args);

    if (promised(transformed)) {
      return transformed.then(error => response({ error })).catch(error => response({ error }));
    }

    return response({ error: transformed });
  } catch (error) {
    return response({ error });
  }
};

/**
 * catches errors based on the specified types (if available), transforms them using the specified transformer function (if available) and returns them in a consistent response structure.
 * 
 * @template [T = Error]
 * 
 * @param {Error} [error] - the error object.
 * @param {Array<ErrorConstructor>} [types = []] - an optional array of error types to check against.
 * @param {(error: Error) => Promise<T> | T} [transformer = undefined] - an optional function to transform the error object.
 * 
 * @returns {[T, null]} - a consistent response structure, `[error, null]`.
 * 
 * @throws {Error} - if types are specified and the error is not an instance of any of the types.
 */
const caught = (error, types = [], transformer = undefined) => {
  const returnable = !types.length || types.some(type => error instanceof type);
  const transformable = transformer !== undefined && typeof transformer === 'function';

  if (returnable) {
    return transformable ? transform(transformer)(error) : response({ error });
  }

  throw error;
};

/**
 * safely executes a synchronous or asynchronous action, handles any errors that occur and returns the result in a consistent response structure.
 * 
 * @template R,
 * @template [T = Error]
 * 
 * @param {(...args: any[]) => R} action - the function to be wrapped.
 * @param {Array<ErrorConstructor>} [types = []] - an optional array of error types to catch.
 * @param {(error: Error) => Promise<T> | T} [transformer] - an optional function to transform the error object.
 * 
 * @returns {(...args: Parameters<typeof action>) => R extends Promise<infer U> ? Promise<[T, null] | [null, U]> : [T, null] | [null, R]} - a tuple where the first element is the error object, if available, or the transformed error object, if a transformer function is provided. the second element is the result of the action, if available.
 */
const safe = (action, types = [], transformer = undefined) => (...args) => {
  try {
    const result = action(...args);

    if (promised(result)) {
      return result.then(data => response({ data })).catch(error => caught(error, types, transformer));
    }

    return response({ result });
  } catch (error) {
    return caught(error, types, transformer);
  }
};

export { safe };
