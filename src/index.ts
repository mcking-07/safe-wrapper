type Result<ResponseType, ErrorType> = [ErrorType, null] | [null, ResponseType];

type Safe<ActionType extends (...args: unknown[]) => unknown, ErrorType = Error> = ReturnType<ActionType> extends Promise<infer ResponseType> ? (...args: Parameters<ActionType>) => Promise<Result<ResponseType, ErrorType>> : (...args: Parameters<ActionType>) => Result<ReturnType<ActionType>, ErrorType>;

const response = <ResponseType, ErrorType = Error>({ error, data }: { error?: ErrorType; data?: ResponseType; }): Result<ResponseType, ErrorType> => error ? [error as ErrorType, null] : [null, data as ResponseType];

const promised = <PromiseType>(result: PromiseType): result is PromiseType & Promise<unknown> => result instanceof Promise || (typeof result === 'object' && result !== null && typeof (result as { then?: unknown }).then === 'function');

const transform = <TransformedErrorType = Error>(transformer: (error: Error) => Promise<TransformedErrorType> | TransformedErrorType) => (error: Error): Promise<Result<null, TransformedErrorType>> | Result<null, TransformedErrorType> => {
  try {
    const transformed = transformer(error);

    if (promised(transformed)) {
      return transformed.then((value: unknown) => response<null, TransformedErrorType>({ error: value as TransformedErrorType })).catch((error: TransformedErrorType) => response({ error }));
    }

    return response({ error: transformed as TransformedErrorType });
  } catch (error) {
    return response({ error: error as TransformedErrorType });
  }
};

const caught = <ErrorType = Error>(error: Error, types: ErrorConstructor[] = [], transformer?: (error: Error) => Promise<ErrorType> | ErrorType): Promise<Result<null, ErrorType>> | Result<null, ErrorType> => {
  const returnable = !types.length || types.some((type: ErrorConstructor) => error instanceof type);
  const transformable = transformer !== undefined && typeof transformer === 'function';

  if (returnable) {
    return transformable ? transform(transformer)(error) : response({ error: error as ErrorType });
  }

  throw error;
};

const safe = <ActionType extends (...args: unknown[]) => unknown, ErrorType = Error>(action: ActionType, types: ErrorConstructor[] = [], transformer?: (error: Error) => Promise<ErrorType> | ErrorType): Safe<ActionType, ErrorType> => ((...args: Parameters<ActionType>) => {
  try {
    const result = action(...args);

    if (promised(result)) {
      return result.then((data: unknown): Result<ReturnType<ActionType>, Error> => response({ data: data as ReturnType<ActionType> })).catch((error: Error) => caught(error, types, transformer));
    }

    return response({ data: result });
  } catch (error) {
    return caught(error as Error, types, transformer);
  }
}) as Safe<ActionType, ErrorType>;

export { safe };
