import test from 'ava';

import * as RemoteData from './remote-data';

// HELPERS
const appendBang = (s: string) => `${s}!`;
const inc = (x: number) => x + 1;
const errorToString = (e: Error) => e.message;

test('succeed should ', t => {
  const actual: RemoteData.RemoteData<unknown, number> = RemoteData.Success(1);

  t.deepEqual(actual, RemoteData.Success(1));
});

test('isSuccess', t => {
  t.true(RemoteData.isSuccess(RemoteData.Success(1)));
  t.false(RemoteData.isSuccess(RemoteData.Loading()));
  t.false(RemoteData.isSuccess(RemoteData.NotAsked()));
  t.false(RemoteData.isSuccess(RemoteData.Failed('Network Error')));
});

test('isFailure', t => {
  t.true(RemoteData.isFailure(RemoteData.Failed('Network Error')));
  t.false(RemoteData.isFailure(RemoteData.NotAsked()));
  t.false(RemoteData.isFailure(RemoteData.Success([])));
  t.false(RemoteData.isFailure(RemoteData.Loading()));
});

test('isNotAsked', t => {
  t.true(RemoteData.isNotAsked(RemoteData.NotAsked()));
  t.false(RemoteData.isNotAsked(RemoteData.Loading()));
  t.false(RemoteData.isNotAsked(RemoteData.Success([])));
  t.false(RemoteData.isNotAsked(RemoteData.Loading()));
});

test('isLoading', t => {
  t.true(RemoteData.isLoading(RemoteData.Loading()));
  t.false(RemoteData.isLoading(RemoteData.NotAsked()));
  t.false(RemoteData.isLoading(RemoteData.Success([])));
  t.false(RemoteData.isLoading(RemoteData.Failed('Network Error')));
});

test('map should only apply the function to Success data', t => {
  const isTwo = RemoteData.map(inc, RemoteData.Success(1));
  const helloBang = RemoteData.map(
    appendBang,
    RemoteData.Success('Hello, Tom')
  );
  const isOne = RemoteData.map(inc, RemoteData.NotAsked());
  const isLoading = RemoteData.map(inc, RemoteData.Loading());
  const isError = RemoteData.map(appendBang, RemoteData.Failed('Went wrong'));

  t.deepEqual(isTwo, RemoteData.Success(2));
  t.deepEqual(helloBang, RemoteData.Success('Hello, Tom!'));
  t.deepEqual(isOne, RemoteData.NotAsked());
  t.deepEqual(isLoading, RemoteData.Loading());
  t.deepEqual(isError, RemoteData.Failed('Went wrong'));
});

test('andThen', t => {
  const s = RemoteData.Success(2);
  const actual = RemoteData.andThen(n => RemoteData.Success(n + 1), s);

  t.is(RemoteData.withDefault(0, actual), 3);

  const l = RemoteData.Loading();
  const actualL = RemoteData.andThen(() => RemoteData.Loading(), l);

  t.is(RemoteData.withDefault(0, actualL), 0);
});

test('mapError', t => {
  const errorMessage = 'Network Error';
  const rdError: RemoteData.RemoteData<string, unknown> = RemoteData.mapError(
    errorToString,
    RemoteData.Failed(new Error(errorMessage))
  );

  t.is(
    RemoteData.match(
      {
        success: () => '',
        loading: () => '',
        notAsked: () => '',
        failed: err => err,
      },
      rdError
    ),
    errorMessage
  );

  const rdLoading: RemoteData.RemoteData<string, string> = RemoteData.mapError(
    errorToString,
    RemoteData.Loading()
  );

  t.is(
    RemoteData.match(
      {
        success: () => '',
        loading: () => 'loading',
        notAsked: () => '',
        failed: err => err,
      },
      rdLoading
    ),
    'loading'
  );
});

test('mapBoth', t => {
  const errorMessage = 'Network Error';
  const success: RemoteData.RemoteData<Error, number> = RemoteData.Success(1);
  const mappedSuccess = RemoteData.mapBoth(inc, errorToString, success);
  const err: RemoteData.RemoteData<Error, number> = RemoteData.Failed(
    new Error(errorMessage)
  );
  const mappedErr = RemoteData.mapBoth(inc, errorToString, err);

  t.is(
    RemoteData.match(
      {
        loading: () => 0,
        success: num => num,
        notAsked: () => 0,
        failed: () => 0,
      },
      mappedSuccess
    ),
    2
  );

  t.is(
    RemoteData.match(
      {
        loading: () => '',
        success: () => '',
        notAsked: () => '',
        failed: err => err,
      },
      mappedErr
    ),
    errorMessage
  );
});

test('unwrap', t => {
  const successData = RemoteData.unwrap(
    '',
    appendBang,
    RemoteData.Success('my data')
  );
  const loading = RemoteData.unwrap('', appendBang, RemoteData.Loading());
  const failed = RemoteData.unwrap('', appendBang, RemoteData.Failed('Error'));
  const notAsked = RemoteData.unwrap('', appendBang, RemoteData.NotAsked());

  t.is(successData, 'my data!');
  t.is(loading, '');
  t.is(failed, '');
  t.is(notAsked, '');
});

test('withDefault', t => {
  const successData = RemoteData.withDefault('', RemoteData.Success('my data'));
  const loading = RemoteData.withDefault('', RemoteData.Loading());
  const failed = RemoteData.withDefault('', RemoteData.Failed('Error'));
  const notAsked = RemoteData.withDefault('', RemoteData.NotAsked());

  t.is(successData, 'my data');
  t.is(loading, '');
  t.is(failed, '');
  t.is(notAsked, '');
});

test('match', t => {
  const loadingData: RemoteData.RemoteData<string, string> =
    RemoteData.Loading();
  const loadingMatch = RemoteData.match(
    {
      success: d => 'Success ' + d,
      notAsked: () => 'Not Asked',
      loading: () => 'Loading',
      failed: () => 'Failed',
    },
    loadingData
  );

  t.deepEqual(loadingMatch, 'Loading');

  const errorData: RemoteData.RemoteData<Error, string> = RemoteData.Failed(
    new Error('Opps.')
  );
  const errorMatch = RemoteData.match(
    {
      success: d => 'Success ' + d,
      notAsked: () => 'Not Asked',
      loading: () => 'Loading',
      failed: e => 'Failed ' + e.message,
    },
    errorData
  );

  t.deepEqual(errorMatch, 'Failed Opps.');

  const notAskedData: RemoteData.RemoteData<Error, string> =
    RemoteData.NotAsked();
  const notAskedMatch = RemoteData.match(
    {
      success: d => 'Success ' + d,
      notAsked: () => 'Not Asked',
      loading: () => 'Loading',
      failed: e => 'Failed ' + e.message,
    },
    notAskedData
  );

  t.deepEqual(notAskedMatch, 'Not Asked');

  const successData: RemoteData.RemoteData<
    Error,
    Array<number>
  > = RemoteData.Success([1, 2, 3]);
  const successMatch = RemoteData.match(
    {
      success: d => d.join(','),
      notAsked: () => 'Not Asked',
      loading: () => 'Loading',
      failed: e => 'Failed ' + e.message,
    },
    successData
  );

  t.deepEqual(successMatch, '1,2,3');
});
