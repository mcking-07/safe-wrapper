/**
 * a module providing consistent error handling and response structures, for both synchronous and asynchronous operations.
 * 
 * @module safe
 */

/**
 * creates a consistent response structure for the package.
 * 
 * @param {Object} params - an object with `error`, `data` and `result` keys.
 * @param {Error} [params.error = null] - the error object.
 * @param {any} [params.data = null] - the data object.
 * @param {any} [params.result = null] - the result object.
 * @returns {[Error, null | null, any]} - a tuple where the first element is the error, if available and the second element is the result or data (whichever is available).
 */
const response = ({ error = null, data = null, result = null }) => [error, result || data];

/**
 * transforms an error object using the specified transformer function. 
 * 
 * @param {Function} transformer - the function to transform the error object.
 * @returns {response} - a consistent response structure, `[error, null]`.
  */
const transform = (transformer) => (...args) => {
  try {
    const transformed = transformer(...args);

    if (transformed instanceof Promise) {
      return transformed.then(error => response({ error })).catch(error => response({ error }));
    }

    return response({ error: transformed });
  } catch (error) {
    return response({ error });
  }
};

/**
 * catches errors based on the specified types (if available) and returns them in a consistent response structure.
 * 
 * @param {Error} error - the error object.
 * @param {Array<ErrorConstructor>} [types = []] - an optional array of error types to check against.
 * @param {Function} [transformer = undefined] - an optional function to transform the error object.
 * @returns {response} - a consistent response structure, `[error, result]`.
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
 * @param {Function} action - the function to be wrapped, which can either be synchronous or asynchronous.
 * @param {Array<ErrorConstructor>} [types = []] - an optional array of error types to check against.
 * @param {Function} [transformer = undefined] - an optional function to transform the error object.
 * @returns {Promise<[Error, null] | [null, any]> | [Error, null] | [null, any]} - a tuple where the first element is null, if the execution was successful, or an error object if an error occurred. the second element is the result of the action, if available.
 */
const safe = (action, types = [], transformer = undefined) => (...args) => {
  try {
    const result = action(...args);

    if (result instanceof Promise) {
      return result.then(data => response({ data })).catch(error => caught(error, types, transformer));
    }

    return response({ result });
  } catch (error) {
    return caught(error, types, transformer);
  }
};

export { safe };
