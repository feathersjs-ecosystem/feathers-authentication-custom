# feathers-authentication-custom

> __Deprecated:__ This module is no longer maintained. Upgrade to Feathers 4 and use its new [authentication strategies](https://docs.feathersjs.com/api/authentication/strategy.html) instead.

> Custom authentication strategy for feathers-authentication using Passport

## Installation

```
npm install feathers-authentication-custom --save
```

## API

This module is a wrapper around the [passport-custom](https://www.npmjs.com/package/passport-custom) strategy which allows you implement a custom verifier function for authenticating requests. 

### Main Initialization

In most cases initializing the `feathers-authentication-custom` module is as simple as doing this:

```js
app.configure(authentication(settings));
app.configure(custom((req, done) => {
	// implement your own custom logic for loading and verifying the user
	done(null, user);
}));
```

If you use a function declaration instead of an arrow `=>` function, then you can use `this.app` to get a reference to the app object:

```js
function verifier (req, done) {
	this.app === app; //-> true
}
app.configure(authentication(settings));
app.configure(custom(verifier));
```

### Verifier class

In more advanced scenarios you can use a Verifier class. This should be familiar to you if you have ever used a custom verifier class with other passport strategies. The class should implement the following methods:

```js
class CustomVerifier {
    constructor(app, options) {} // the class constructor
    verify(req, done) {} // performs custom verification
};

app.configure(authentication(settings));
app.configure(custom({ Verifier: CustomVerifier }));
```

## Expected Request Data
By default, this strategy expects a payload in this format:

```js
{
  strategy: 'custom'
}
```

## Complete Example

Here's a basic example of a Feathers server that uses `feathers-authentication-jwt`. You can see a fully working example in the [example/](./example/) directory.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const memory = require('feathers-memory');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const auth = require('feathers-authentication');
const custom = require('feathers-authentication-custom');

function verifier (req, done) {
  // perform custom verifications
  done(null, user);
}

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // Configure feathers-authentication
  .configure(auth({ secret: 'super secret' }))
  .configure(custom(verifier))
  .use('/users', memory())
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
