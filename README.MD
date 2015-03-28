# tiny

[![Build Status](https://travis-ci.org/iMumuMua/tiny.svg)](https://travis-ci.org/iMumuMua/tiny)
[![Coverage Status](https://coveralls.io/repos/iMumuMua/tiny/badge.svg?branch=master)](https://coveralls.io/r/iMumuMua/tiny?branch=master)

tiny makes asynchronous JavaScript be graceful and easy.

Language Translations:
* [简体中文 (zh_CN)](translations/README_zh_cn.md)

## Quick Start
```javascript
var tiny = require('tiny-control');
var ctrl = new tiny.Controller();
ctrl.go(function() {
  // do something
});
ctrl.go(fs.readdir, './path', function(files) {
  // do something
});
ctrl.go(promise, function(data) {
  // do something
});
ctrl.onError(function(err) {
  // handle err
});
ctrl.run(); // these go atom tasks will be run one by one
```

## Atom task
Most of tiny.Controller method accept the same arguments to make an atom task, such as 'go', 'parallel', 'do', 'onFinish'.
The atom task looks like:
```javascript
var ctrl = new tiny.Controller();

// a single function task
ctrl.go(function() {
  // do something here
});

// a async function task, such as node.js api functions
ctrl.go(fs.readdir, path, function(files) {
  // do something
});

// a promise task, the callback will accept promise success data
ctrl.go(promise, function(data) {
  // do something
});
```
It will be used 'atomArgs' instead of arguments of atom task below, such as `ctrl.go(atomArgs)`.

## Sequence
tiny makes async sequence be simple.
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs);
ctrl.go(atomArgs);
ctrl.run(); // these go atom tasks will be run one by one
```

Break
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs);
ctrl.go(function() {
  return tiny.break;
});
ctrl.go(atomArgs); // this task will not run
ctrl.run();
```

## Parallel tasks
tiny also support parallel tasks.
```javascript
var ctrl = new tiny.Controller();
ctrl.parallel(atomArgs);
ctrl.parallel(atomArgs);
ctrl.onFinish(atomArgs); // run this task when all parallel tasks have finished
ctrl.run(); // these parallel atom tasks will be run parallelly if they are async tasks
```

## While-do or do-while
tiny make async loop control be simple.
```javascript
var ctrl = new tiny.Controller();
var i = 0;
ctrl.while(function() { return i < 2; });
ctrl.do(fs.readdir, './path', function(files) {
  i++;
}); // ctrl.do(atomArgs), the method 'do' can be called only once.
ctrl.onFinish(function() {
  i.should.equal(2);
});
ctrl.run();
```
If the method 'do' will be called first, the controller will run as do-while:
```javascript
var ctrl = new tiny.Controller();
var i = 0;
ctrl.do(fs.readdir, './path', function(files) {
  i++; // this task will run at least once.
});
ctrl.while(function() { return i < 2; });
ctrl.onFinish(function() {
  i.should.equal(2);
});
ctrl.run();
```

## each and map
tiny provide two methods for iterate, the each iter task will run one by one, the map iter task will run parallelly.

each:
```javascript
var arr = ['cat', 'dog', 'sheep'];
var ctrl = new tiny.Controller();
ctrl.each(arr).iter(function(item, index) {
  // item is arr[index]
  // this task is also a atom task, you could return a tiny.Controller here
});
ctrl.run();
```

map:
```javascript
var arr = ['cat', 'dog', 'sheep'];
var ctrl = new tiny.Controller();
ctrl.map(arr).iter(function(item, index) {});
ctrl.run();
```

## Chain style
You could do this:
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs).go(atomArgs).go(atomArgs).onError(function(err) {}).onFinish(atomArgs).run();
```

## Shotcut functions
tiny provide shotcut functions for all tasks:
```javascript
tiny.go(atomArgs).go(atomArgs).onFinish(atomArgs).onError(function(err) {}).run();
tiny.parallel(atomArgs).parallel(atomArgs).run();
tiny.while(cond).do(atomArgs).run();
tiny.do(atomArgs).while(cond).run();
tiny.each(arr).iter(atomArgs).run();
tiny.map(arr).iter(atomArgs).run();
```

## Nested controller
tiny.Controller could be nested! You could return a tiny.Controller in a atom task function.
```javascript
var ctrl = new tiny.Controller();
ctrl.go(function() {
  console.log(1);
});
ctrl.go(function() {
  console.log(2);
  var subCtrl = new tiny.Controller();
  subCtrl.go(atomArgs);
  subCtrl.go(atomArgs);
  subCtrl.go(function() {
    console.log(3);
  });
  return subCtrl; // don't call method 'run' here, just return
});
ctrl.go(function() {
  console.log(4);
});
ctrl.go(atomArgs);
ctrl.run(); // console.log output: 1, 2, 3, 4
```

## Error handle
You could handle all error in one place. The tiny.Controller will catch all exception that throw by atom task.
```javascript
var ctrl = new tiny.Controller();
ctrl.go(function() {
  throw new Error('aa');
});
ctrl.onError(function(err) {
  // err.message will be 'aa'
});
ctrl.run();
```

The parent controller can catch exception that throw by it's children.
```javascript
var ctrl = new tiny.Controller();
ctrl.go(function() {
  var subCtrl = new tiny.Controller();
  subCtrl.go(function() {
    throw new Error('child error');
  });
  return subCtrl;
});
ctrl.onError(function(err) {
  // err.message should be 'child error'
});
ctrl.run();
```

If the child controller has called method 'onError', the parent controller could not catch exception any more.
```javascript
var ctrl = new tiny.Controller();
ctrl.go(function () {
  var subCtrl = new tiny.Controller();
  subCtrl.go(function () {
    throw new Error('child error');
  });
  subCtrl.onError(function (err) {
    // err.message should be 'child error'
  });
  return subCtrl;
});
ctrl.onError(function (err) {
  // could not catch error 'child error' here
});
ctrl.run();
```

If you want to handle the error in both parent and children controllers, just return `tiny.bubble` in child error handler.
```javascript
var arr = ['dog', 'cat', 'sheep', 'monkey'];
var ctrl = new tiny.Controller();
ctrl.map(arr).iter(function(item, index) {
  var subCtrl = new tiny.Controller();
  subCtrl.go(function() {
    throw new Error('bubble');
  });
  subCtrl.onError(function(err) {
    err.message.should.equal('bubble');
    return tiny.bubble;
  });
  return subCtrl;
});
ctrl.onError(function(err) {
  err.message.should.equal('bubble');
});
ctrl.run();
```

## onFinish
Every task type has onFinish event when all the task has finished.
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs).go(atomArgs).onFinish(atomArgs).onError(function(err) {}).run();
```
Notice: Each controller onFinish or onError event will be fire **only once**.


## License
[MIT](./LICENSE)
