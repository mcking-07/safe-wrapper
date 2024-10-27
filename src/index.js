/**
 * catches errors based on the specified types.
 * 
 * @param {Error} error - the error to be caught.
 * @param {Array<ErrorConstructor>} [types=[]] - an optional array of error classes to check against.
 * @returns {[Error|null, null]} - returns an array where the first element is the error if it matches one of the types, or null if it doesn't.
 * @throws {Error} - throws the error if it doesn't match any of the specified types.
 */
const caught = (error, types = []) => {
  if (!types.length) {
    return [error, null];
  }

  if (types.some(type => error instanceof type)) {
    return [error, null];
  }

  throw error;
};

/**
 * safely executes the result of a function or a promise and handles any errors that occur.
 * 
 * @param {any} response - the result of a synchronous or asynchronous function, or a promise to execute.
 * @param {Array<ErrorConstructor>} [types=[]] - an optional array of error classes to check against.
 * @returns {Promise<[null, any]|[Error, null]>|[null, any]|[Error, null]} - returns an array where the first element is null if successful, or an error if it fails. if the input is a promise, it resolves to that array; otherwise, it returns the array directly.
 */
const safe = (response, types = []) => {
  if (response instanceof Promise) {
    return response.then(result => [null, result]).catch(error => caught(error, types));
  }

  if (response instanceof Error) {
    return caught(response, types);
  }

  return [null, response];
};

export { safe };
