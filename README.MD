# Tiny
Tiny makes asynchronous JavaScript be graceful and easy.

## Quick Start
```javascript
var Tiny = require('tiny');
var ti = new Tiny();
ti.go(function () {
  // do something
});
ti.go(fs.readdir, './path', function (files) {
  // do something
});
ti.go(promise, function (data) {
  // do something
});
ti.onError(function (err) {
  // handle err
});
ti.run(); // ti will run these tasks one by one, is that graceful?
```

## Flow control
Tiny makes async flow be simple
```javascript
var Tiny = require('tiny');
var ti = new Tiny();

// a single function, define custom task here
ti.go(function () {
  // do something
});

// nodejs functions and similar
ti.go(fs.readdir, './path', function (files) {
  // do something
});

// promise
ti.go(promise, function (data) {
  // do something
});

// all error or exception will be handled here
ti.onError(function (err) {
  // handle err
});

ti.run(function () {
  // finish callback
}); // don't forget run()
```

## Parallel tasks
Tiny also support parallel tasks.
```javascript
var ti = new Tiny();
ti.parallel(/*just define task the same to 'go'*/);
ti.parallel(/*...*/);
ti.run(function () {
  // do something when all parallel task finish
});
```

## Chain style
You could do this:
```javascript
var ti = new Tiny();
ti.go(/*...*/).go(/*...*/).go(/*...*/).onError(/*...*/).run(/*...*/);
```

## Nested task
Tiny could be nested!
```javascript
var ti = new Tiny();
ti.go(function () {
  var subti = new Tiny();
  subti.go(function () {
    // do something
  });
  subti.go(/*...*/)
  return subti; // don't use run method here, just return
})
ti.go(/*...*/);
ti.go(/*...*/);
ti.run();
```

## Error handle
All error and exception will be handled in one function, is that cool?
In Tiny task callback function, all exception will be caught
```javascript
var ti = new Tiny();
ti.go(function () {
  throw new Error('aa');
});
ti.onError(function (err) {
  // err.message will be 'aa'
});
ti.run();
```

When in nested task, sub Tiny task's error will also be handled in parent Tiny error handler
```javascript
var ti = new Tiny();
ti.go(function () {
  var subti = new Tiny();
  subti.go(function () {
    throw new Error('subti');
  });
  return subti;
});
ti.onError(function (err) {
  // err.message should be 'subti'
});
ti.run();
```
If the sub Tiny has it's own error handler:
```javascript
var ti = new Tiny();
ti.go(function () {
  var subti = new Tiny();
  subti.go(function () {
    throw new Error('subti');
  });
  subti.onError(function (err) {
    // err.message should be 'subti'
  });
  return subti;
});
ti.onError(function (err) {
  // could not catch error 'subti' here
});
ti.run();
```
