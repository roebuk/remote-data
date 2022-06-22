# Remote Data

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/roebuk/remote-data/Node.js%20CI) ![David](https://status.david-dm.org/gh/roebuk/remote-data.svg) ![npm bundle size (scoped)](https://img.badgesize.io/https:/unpkg.com/@roebuk/remote-data@0.0.1/dist/remote-data.modern.js?label=brotli&compression=brotli)


Tiny (less than 450 bytes) tools for fetching data from remote sources (incl. HTTP). For a detailed write up
of why Remote Data helps, [read this post](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html).


## Installation

#### NPM

```
$ npm install @roebuk/remote-data
```

#### ES Modules

```html
<script type="module">
  import RemoteData from 'https://cdn.skypack.dev/@roebuk/remote-data';
</script>
```

#### Script Tag
```html
<script src="https://unpkg.com/@roebuk/remote-data"></script>
```

## Documentation

[API Docs](https://remote-data.netlify.app/)

#### Basic Example

```js
import * as RemoteData from '@roebuk/remote-data';

// Set the initial state
var remoteUsers = RemoteData.NotAsked();

// An interaction starts off the request
remoteUsers = RemoteData.Loading();

// Once the request is complete,
// it will either be in a `Success` or `Failure` state.
remoteUsers = await fetch('/api/users')
                        .then(res => res.json())
                        .then(users => RemoteData.Success(users))
                        .catch(err => RemoteData.Failure(err));


// "Pattern match" on the RemoteData type and extract the current state. 
// The return value of the functions should all be of the same type.
RemoteData.match({
    notAsked: () => 'Not Requested the data'
    loading: () => 'Loading...'
    success: users => `Loaded ${users.length} users`,
    failed: err => `Something when wrong. Details: ${err.message}`
}, remoteUsers);
```

#### React Example

[React & Remote Data on StackBlitz](https://stackblitz.com/edit/react-ts-mexbfh?file=index.tsx)

## Building & Testing

```
npm ci
npm run build
npm t
```
