# Tiny

Tiny让Javascript的异步流程控制变得简单优雅。

## 快速开始
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
ctrl.run(); // 上述的任务会被依次执行
```

## 原子任务
tiny.Controller的许多方法都接受相同形式的参数以创建一个原子任务，例如'go'、'parallel'、'do'、'onFinish'等方法。原子任务的形式如下：
```javascript
var ctrl = new tiny.Controller();

// 一个简单的任务，接受一个回调函数
ctrl.go(function() {
  // do something here
});

// 一个调用异步函数的任务，例如node.js的api函数
ctrl.go(fs.readdir, path, function(files) {
  // do something
});

// 一个promise任务，回调函数的参数即为promise成功状态的参数
ctrl.go(promise, function(data) {
  // do something
});
```
在下面的描述中，将使用'atomArgs'代替原子任务的参数，例如`ctrl.go(atomArgs)`。

## 顺序任务
tiny让顺序的任务变得简单。
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs);
ctrl.go(atomArgs);
ctrl.run(); // 上述的任务会被依次执行
```

中断
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs);
ctrl.go(function() {
  return tiny.break;
});
ctrl.go(atomArgs); // 这个任务不会被执行了
ctrl.run();
```

## 并行任务
tiny支持并行任务
```javascript
var ctrl = new tiny.Controller();
ctrl.parallel(atomArgs);
ctrl.parallel(atomArgs);
ctrl.onFinish(atomArgs); // 当所有的parallel任务执行完后，会执行该任务
ctrl.run(); // 如果是异步任务的话，上述的parallel任务会被并行执行
```

## While-do or do-while
tiny让循环也变得简单
```javascript
var ctrl = new tiny.Controller();
var i = 0;
ctrl.while(function() { return i < 2; });
ctrl.do(fs.readdir, './path', function(files) {
  i++;
}); // ctrl.do(atomArgs), do方法只可以被调用一次
ctrl.onFinish(function() {
  i.should.equal(2);
});
ctrl.run();
```
如果先调用do方法，则执行效果就会像do-while循环一样
```javascript
var ctrl = new tiny.Controller();
var i = 0;
ctrl.do(fs.readdir, './path', function(files) {
  i++; // 这个任务至少会被执行一次
});
ctrl.while(function() { return i < 2; });
ctrl.onFinish(function() {
  i.should.equal(2);
});
ctrl.run();
```

## each and map
tiny提供两种数组遍历的方法, each方法中的iter任务会依次执行, map方法中的iter任务会并行执行。

each:
```javascript
var arr = ['cat', 'dog', 'sheep'];
var ctrl = new tiny.Controller();
ctrl.each(arr).iter(function(item, index) {
  // item is arr[index]
  // 这也是一个原子任务，可以返回tiny.Controller对象实例
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

## 链式风格
可以链式调用方法:
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs).go(atomArgs).go(atomArgs).onError(function(err) {}).onFinish(atomArgs).run();
```

## 快捷方法
tiny为所有类型的任务提供了快捷的调用方法:
```javascript
tiny.go(atomArgs).go(atomArgs).onFinish(atomArgs).onError(function(err) {}).run();
tiny.parallel(atomArgs).parallel(atomArgs).run();
tiny.while(cond).do(atomArgs).run();
tiny.do(atomArgs).while(cond).run();
tiny.each(arr).iter(atomArgs).run();
tiny.map(arr).iter(atomArgs).run();
```

## 嵌套的控制器
tiny.Controller可以被嵌套！在原子任务中返回一个tiny.Controller即可
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
  return subCtrl; // 返回即可，不要调用它的'run'方法
});
ctrl.go(function() {
  console.log(4);
});
ctrl.go(atomArgs);
ctrl.run(); // console.log 输出顺序: 1, 2, 3, 4
```

## 错误处理
您可以在一个地方处理所有错误。tiny.Controller会捕获所有由原子任务抛出的异常。
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

父控制器可以捕获子控制器的异常。
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
如果子控制器有自己的错误处理，则父控制器不再去捕获：
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

如果希望父控制器也处理错误，可以在子控制器的错误处理方法中返回`tiny.bubble`。
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
每一种类型的任务都有onFinish事件，在任务顺利完成后触发。
```javascript
var ctrl = new tiny.Controller();
ctrl.go(atomArgs).go(atomArgs).onFinish(atomArgs).onError(function(err) {}).run();
```
注意: 每个控制器的onFinish或onError事件只会触发**一次**.
