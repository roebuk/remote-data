enum RDType {
  Success = 0,
  NotAsked,
  Loading,
  Failed,
}

type Matcher<E, T, R> = {
  notAsked: () => R;
  loading: () => R;
  failed: (err: E) => R;
  success: (data: T) => R;
};

type Success<T> = {
  readonly type: RDType.Success;
  readonly data: T;
};

type NotAsked = {
  readonly type: RDType.NotAsked;
};

type Loading = {
  readonly type: RDType.Loading;
};

type Failed<E> = {
  readonly type: RDType.Failed;
  readonly error: E;
};

export type RemoteData<E, T> = NotAsked | Loading | Success<T> | Failed<E>;

/**
 * Constructs a new `Loading` variant
 *
 * @example
 * ```ts
 * RemoteData.Loading()
 * ```
 * @returns RemoteData Loading object
 */
function Loading<E, T>(): RemoteData<E, T> {
  return {
    type: RDType.Loading,
  } as Loading;
}

/**
 * Constructs a new `Failed<E>` variant
 *
 * @example
 * ```ts
 * RemoteData.Failed("Unexpected token '<'")
 * ```
 * @param e - Your errored value
 * @returns RemoteData Failed object
 */
function Failed<E, T>(e: E): RemoteData<E, T> {
  return {
    type: RDType.Failed,
    error: e,
  } as Failed<E>;
}

/**
 * Constructs a new `Success<T>` variant
 *
 * @example
 * ```ts
 * RemoteData.Success([1,2,3])
 * ```
 * @param t - Your remote data, typically some parsed JSON
 * @returns RemoteData Failed object
 */
function Success<E, T>(t: T): RemoteData<E, T> {
  return {
    type: RDType.Success,
    data: t,
  } as Success<T>;
}

/**
 * Constructs a new `NotAsked` variant
 * @example
 * ```ts
 * RemoteData.NotAsked()
 * ```
 * @returns RemoteData NotAsked object
 */
function NotAsked<E, T>(): RemoteData<E, T> {
  return {
    type: RDType.NotAsked,
  } as NotAsked;
}

/**
 * Returns true if the variant is of type `Success`
 *
 * @example
 * ```ts
 * RemoteData.isSuccess(remoteData)
 * ```
 * @returns Wether or not the RemoteData is in a successful state.
 */
function isSuccess<E, T>(rd: RemoteData<E, T>): rd is Success<T> {
  return rd.type === RDType.Success;
}

/**
 * Returns true if the variant is of type `Failure`
 *
 * @example
 * ```ts
 * RemoteData.isFailure(remoteData)
 * ```
 * @returns Wether or not the RemoteData is in a Failed state.
 */
function isFailure<E, T>(rd: RemoteData<E, T>): rd is Failed<E> {
  return rd.type === RDType.Failed;
}

/**
 * Returns true if the variant is of type `Loading`
 *
 * @example
 * ```ts
 * RemoteData.isLoading()
 * ```
 * @returns Wether or not the RemoteData is in a Loading state.
 */
function isLoading<E, T>(rd: RemoteData<E, T>): rd is Loading {
  return rd.type === RDType.Loading;
}

/**
 * Returns true if the variant is of type `NotAsked`
 *
 * @example
 * ```ts
 * RemoteData.isNotAsked()
 * ```
 * @returns Wether or not the RemoteData is in a NotAsked state.
 */
function isNotAsked<E, T>(rd: RemoteData<E, T>): rd is NotAsked {
  return rd.type === RDType.NotAsked;
}

/**
 * "Pattern matches" over a RemoteData type and run the function
 * of the matching variant. All functions much return the same type.
 * This may change if [pattern matching ](https://github.com/tc39/proposal-pattern-matching)
 * gets adopted into the language.
 *
 * @example
 * ```ts
 * const data = RemoteData.Success([1,2,3,4])
 * RemoteData.match({
 *   notAsked: () => 'Not Asked',
 *   loading: () => 'Loading',
 *   success: data => `Got ${data.length} items`,
 *   failed: err => `The error was ${err.message}`
 * }, data);
 * ```
 * @returns A way of extracting the value. All functions much return the same type.
 */
function match<E, T, R>(matcher: Matcher<E, T, R>, rd: RemoteData<E, T>): R {
  switch (rd.type) {
    case RDType.Success:
      return matcher.success(rd.data);

    case RDType.Loading:
      return matcher.loading();

    case RDType.NotAsked:
      return matcher.notAsked();

    case RDType.Failed:
      return matcher.failed(rd.error);
  }
}

/**
 * Take a default value, a function and a `RemoteData`.
 * Return the default value if the `RemoteData` is something other than `Success<T>`.
 * If the `RemoteData` is `Success<T>`, apply the function on `T` and return the `U`.
 *
 * @example
 * ```ts
 * const success = RemoteData.Success([1,2,3,4])
 * RemoteData.unwrap(
 *  () => [],
 *  data => [...data, 5],
 *  success);
 * ```
 * @returns
 */
function unwrap<E, T, U>(
  defaultValue: U,
  fn: (x: T) => U,
  rd: RemoteData<E, T>
): U {
  switch (rd.type) {
    case RDType.Success:
      return fn(rd.data);

    default:
      return defaultValue;
  }
}

/**
 * Extracts the value our of the Success variant or returns the default.
 *
 * @example
 * ```ts
 * const data = RemoteData.Success([1,2,3,4])
 * RemoteData.withDefault([], data)
 * ```
 * @returns Return the `Success` value, or the default.
 */
function withDefault<E, T>(defaultValue: T, rd: RemoteData<E, T>): T {
  switch (rd.type) {
    case RDType.Success:
      return rd.data;

    default:
      return defaultValue;
  }
}

/**
 * @todo
 * @example
 * ```ts
 * const data = RemoteData.Success(1)
 * ```
 * @param fn
 * @param rd
 * @returns
 */
function andThen<E, T, U>(
  fn: (d: T) => RemoteData<E, U>,
  rd: RemoteData<E, T>
): RemoteData<E, U> {
  switch (rd.type) {
    case RDType.Success:
      return fn(rd.data);
    default:
      return rd;
  }
}

/**
 * Transforms the value within a Success variant.
 * @example
 * ```ts
 * const data = RemoteData.Success(1)
 * RemoteData.map(num => num + 1, data) // Success(2)
 * ```
 * @param fn A function that is passed the unwrapped success value and returns a new
 * @returns Returns RemoteData with a modified `Success` value.
 */
function map<E, T, U>(fn: (d: T) => U, rd: RemoteData<E, T>): RemoteData<E, U> {
  switch (rd.type) {
    case RDType.Success:
      return Success(fn(rd.data));

    default:
      return rd;
  }
}

/**
 * Transforms the value within a Failed variant.
 *
 * @example
 * ```ts
 * const data = RemoteData.Failed(new Error('Network Error'))
 * RemoteData.mapError(err => err.message, data) // Failed<String>
 * ```
 * @param fn A function that maps over the `Failed` value
 * @returns Returns RemoteData with a modified `Failed` value.
 */
function mapError<E, F, T>(
  fn: (e: E) => F,
  rd: RemoteData<E, T>
): RemoteData<F, T> {
  switch (rd.type) {
    case RDType.Failed:
      return Failed(fn(rd.error));

    default:
      return rd;
  }
}

/**
 * Transforms the value within a Success or Failed variant.
 *
 * @param mapSuccess - A function that takes a `Success` value
 * @param mapErr - A function maps over the `Failed` value
 * @returns RemoteData with the adjusted values
 */
function mapBoth<E, F, T, U>(
  mapSuccess: (d: T) => U,
  mapErr: (e: E) => F,
  rd: RemoteData<E, T>
): RemoteData<F, U> {
  return mapError(mapErr, map(mapSuccess, rd));
}

export {
  Success,
  Failed,
  NotAsked,
  Loading,
  andThen,
  isFailure,
  isLoading,
  isNotAsked,
  isSuccess,
  map,
  mapBoth,
  mapError,
  withDefault,
  unwrap,
  match,
};
