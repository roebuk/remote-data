# Remote Data

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/roebuk/remote-data/Node.js%20CI) ![David](https://img.shields.io/david/roebuk/remote-data) ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@roebuk/remote-data)


Tools for fetching data from remote sources (incl. HTTP). For a detailed write up
of why Remote Data helps, [read this post](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html).


## Installation

```
$ npm install @roebuk/remote-data
```

Via a script tag https://unpkg.com/@roebuk/remote-data

## Documentation

[API Docs](https://remote-data.netlify.app/)

#### Basic Example

```js
    import * as RemoteData from '@roebuk/remote-data';

    // Set the initial state
    var remoteUsers = RemoteData.NotAsked();

    // An interaction starts off the request
    remoteUsers = RemoteData.Loading()

    // Once the request is complete,
    // it will either be in a `Success` or `Failure` state.
    remoteUsers = await fetch('/api/users')
                            .then(res => res.json())
                            .then(users => RemoteData.Success(users))
                            .catch(err => RemoteData.Failure(err))


    // "Pattern match" on the RemoteData type and extract the current state. 
    // The return value of the functions should all be of the same type.
    RemoteData.match({
        notAsked: () => 'Not Requested the data'
        loading: () => 'Loading...'
        success: users => `Loaded ${users.length} users`,
        failed: err => `Something when wrong. Details: ${err.message}`
    }, remoteUsers)
```


## Building & Testing

```
npm ci
npm run build
npm t
```
