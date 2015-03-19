# Tiny

Tiny让js的异步流程控制变得简单、优雅。

## 快速开始
```javascript
var Tiny = require('tiny-control');
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
ti.run(); // ti.go()中的回调函数将会依次执行
```

## 顺序控制
Tiny让顺序的包含异步回调过程的任务变得非常简单。
```javascript
var ti = new Tiny();

// 一个简单的任务
ti.go(function () {
  // do something
});

// nodejs中的api函数或类似的形式
// 即回调函数的形式为function (err[, args1[, args2...]]) {}
ti.go(fs.readdir, './path', function (files) {
  // do something
});

// promise
ti.go(promise, function (data) {
  // do something
});

ti.go(promise, function (data) {
  return false; // 如果return false，接下来的任务不会执行
});
ti.go(function () {
  // 这个任务不会被执行
});

// 所有的错误或异常都可以在这里处理
ti.onError(function (err) {
  // handle err
});

ti.run(function () {
  // 所有任务完成后，该回调函数会被执行一次
}); // 不要忘记调用run()方法，否则所有任务都不会执行
```

## 并行任务
Tiny也支持并行的任务。
```javascript
var ti = new Tiny();
ti.parallel(/*类似上述的‘go’方法中定义的任务*/);
ti.parallel(/*...*/);
ti.run(function () {
  // 上述任务会并行执行，并且都执行完毕后，该回调函数会被调用
});
```

## While-do or do-while
Tiny让带异步回调的循环变得简单:
```javascript
var ti = new Tiny();
var i = 0;
ti.while(function () { return i < 2; });
ti.do(fs.readdir, './path', function (files) {
  i++;
}); // 像上述的'go'方法一样定义任务
ti.run(function () {
  i.should.equal(2);
});
```
如果先调用do再调用while方法，则行为会类似于do-while循环。
```javascript
var ti = new Tiny();
var i = 0;
ti.do(fs.readdir, './path', function (files) {
  i++; // 这个函数至少会执行一次
});
ti.while(function () { return i < 2; });
ti.run(function () {
  i.should.equal(2);
});
```

## 链式风格
可以像这样链式调用方法：
```javascript
var ti = new Tiny();
ti.go(/*...*/).go(/*...*/).go(/*...*/).onError(/*...*/).run(/*...*/);
```

## 嵌套的Tiny
Tiny是可以嵌套的，可以处理更复杂的流程。
```javascript
var ti = new Tiny();
ti.go(function () {
  var subti = new Tiny();
  subti.go(function () {
    // do something
  });
  subti.go(/*...*/)
  return subti; // 在这里不需要也不能使用run()；直接返回即可。
})
ti.go(/*...*/);
ti.go(/*...*/);
ti.run();
```

## 错误处理
所有的错误和异常都会在一个错误处理函数中处理，这是不是很简单？在Tiny的任务中，所有抛出的异常都会被捕获。
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

如果是嵌套的Tiny，子层的异常也可以被捕获。
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
如果子层的Tiny有自己的错误处理函数，则直接调用，异常不再会被父级的Tiny捕获。
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
