/**
 * tiny
 * https://github.com/iMumuMua/tiny
 */

(function() {

  'use strict';

  var tiny = {};
  tiny.break = {};
  tiny.bubble = {};

  /**
   * AtomTask constructor.
   * A atom task will be:
   * 1. Such as: atom(function(arg1[, arg2[, arg3...]]) {})
   *    Single function, the args are provided by tiny.Controller when in special method.
   *
   * 2. Such as: atom(asyncFunction[, arg1[, arg2[, arg3...]]], function(arg1[, arg2[, arg3...]]) {})
   *    Async task, the atom callback function is the asyncFunction callback function which be removed err arg.
   *
   * 3. Such as: atom(promise, function(data) {})
   *    Promise task, the data is the promise success function data.
   *
   * All atom task callback function could return some special value:
   * 1. Return a tiny.Controller Object.
   * 2. Return a const value for flow control. Such as tiny.break
   *
   * @param {Object} args javascript function arguments
   */
  var AtomTask = function(args) {
    switch (args.length) {
      case 0:
        throw new Error('An atom task needs at least one argument.');
      case 1:
        this._kind = getKind(args[0]);
        if (this._kind !== 'function') {
          throw new Error('If an atom task has only one argument, the argument must be a function.');
        }
        this._kind = 'single';
        this._task = args[0];
        break;
      case 2:
        this._kind = getKind(args[0]);
        if (this._kind === 'promise') {
          this._promise = args[0];
          this._task = args[1];
        }
        else if (this._kind === 'function') {
          this._asyncFn = args[0];
          this._task = args[1];
        } else {
          throw new Error('If an atom task accepts two arguments, the first argument must be a promise or a function.');
        }
        break;
      default:
        this._kind = getKind(args[0]);
        if (this._kind !== 'function') {
          throw new Error('If an atom task accepts three or more arguments, the first argument must be a function.');
        }
        this._asyncFnArgs = [];
        for (var i = 1, argsLen = args.length; i < argsLen - 1; i++) {
          this._asyncFnArgs.push(args[i]);
        }
        this._asyncFn = args[0];
        this._task = args[args.length - 1];
    }
  };

  /**
   * Run a AtomTask.
   * This method will accept one or two arguments.
   * Such as: atomTask.run(function(err, result) {}) or atomTask.run(data, function(err, result) {})
   * The data is the single task function argument, it must be an array.
   * The argument result of the callback function is the return value of the task.
   */
  AtomTask.prototype.run = function() {
    var self = this;
    var data = [], callback;
    if (arguments.length === 1) {
      callback = arguments[0];
    }
    else if (arguments.length === 2) {
      data = arguments[0];
      callback = arguments[1];
    }

    if (!isFunction(callback)) {
      throw new Error('Run method needs a callback function');
    }

    var result;
    switch (self._kind) {
      case 'single':
        try {
          result = self._task.apply(null, data);
          callback(null, result);
        }
        catch (e) {
          callback(e);
        }
        break;
      case 'promise':
        try {
          self._promise.then(function(promiseResult) {
            try {
              result = self._task(promiseResult);
              callback(null, result);
            }
            catch (e) {
              callback(e);
            }
          }, callback);
        }
        catch (e) {
          callback(e);
        }
        break;
      case 'function':
        var fnCallback = function() {
          try {
            var err = arguments[0];
            if (err && err instanceof Error) {
              callback(err);
            }
            else {
              var resData = [];
              var startIndex = 1;

              // for some node functions such as fs.exists(path, function(exists) {})
              if (!err instanceof Error) {
                startIndex = 0;
              }

              for (var i = startIndex, argumentsLen = arguments.length; i < argumentsLen; i++) {
                resData.push(arguments[i]);
              }
              result = self._task.apply(null, resData);
              callback(null, result);
            }
          }
          catch (e) {
            callback(e);
          }
        };
        var fnArgs = (self._asyncFnArgs || []).concat(fnCallback);
        self._asyncFn.apply(null, fnArgs);
        break;
      default:
        throw new Error('Unexpected AtomTask kind.');
    }
  };


  /**
   * Controller constructor
   */
  var Controller = function() {
    this._kind = 'init';
    this._status = 'init'; // status: 'init', 'success', 'error'
  };

  Controller.prototype.go = function() {
    if (this._kind === 'init') {
      this._kind = 'go';
    }
    if (this._kind !== 'go') {
      throw new Error('Mixed flow control type.');
    }

    if (!this._goTasks) {
      this._goTasks = [];
    }
    this._goTasks.push(new AtomTask(arguments));

    return this;
  };

  Controller.prototype.parallel = function() {
    if (this._kind === 'init') {
      this._kind = 'parallel';
    }
    if (this._kind !== 'parallel') {
      throw new Error('Mixed flow control type.');
    }

    if (!this._parallelTasks) {
      this._parallelTasks = [];
    }
    this._parallelTasks.push(new AtomTask(arguments));

    return this;
  };

  Controller.prototype.while = function(conditionFunc) {
    if (this._kind === 'init') {
      this._kind = 'while-do';
    }
    if (this._kind !== 'while-do' && this._kind !== 'do-while') {
      throw new Error('Mixed flow control type.');
    }

    this._whileConditionFunc = conditionFunc;

    return this;
  };

  Controller.prototype.do = function() {
    if (this._kind === 'init') {
      this._kind = 'do-while';
    }
    if (this._kind !== 'while-do' && this._kind !== 'do-while') {
      throw new Error('Mixed flow control type.');
    }

    this._doTask = new AtomTask(arguments);

    return this;
  };

  Controller.prototype.each = function(array) {
    if (this._kind !== 'init') {
      throw new Error('Mixed flow control type.');
    }

    this._kind = 'each';
    this._data = array;

    return this;
  };

  Controller.prototype.map = function(array) {
    if (this._kind !== 'init') {
      throw new Error('Mixed flow control type.');
    }

    this._kind = 'map';
    this._data = array;

    return this;
  };

  Controller.prototype.iter = function() {
    if (this._kind !== 'each' && this._kind !== 'map') {
      throw new Error('Mixed flow control type.');
    }

    this._iterTask = new AtomTask(arguments);

    return this;
  };

  Controller.prototype._runNestedController = function(ctrl, callback) {
    var self = this;
    ctrl._bubbleErrorHandler = function(err) {
      self._handleError(err);
    };
    ctrl.run(function() {
      ctrl._bubbleErrorHandler = null; // free reference
      if (callback) {
        callback();
      }
    });
  };

  Controller.prototype._finish = function() {
    var self = this;
    if (self._status !== 'init') {
      return;
    }
    self._status = 'success';

    var onRunTaskComplete = function(err, result) {
      if (err) {
        self._handleError(err);
      }
    };
    var onFinishTaskComplete = function(err, result) {
      if (err) {
        self._handleError(err);
      }
      else if (self._runTask) {
        self._runTask.run(onRunTaskComplete);
      }
    };

    if (self._finishTask) {
      self._finishTask.run(onFinishTaskComplete);
    }
    else if (self._runTask) {
      self._runTask.run(onRunTaskComplete);
    }
  };

  Controller.prototype._handleError = function(err) {
    if (this._status === 'error') {
      return;
    }
    this._status = 'error';

    if (this._errorHandler) {
      var result = this._errorHandler(err);
      if (result === tiny.bubble) {
        if (this._bubbleErrorHandler) {
          this._bubbleErrorHandler(err);
        }
      }
    }
    else {
      if (this._bubbleErrorHandler) {
        this._bubbleErrorHandler(err);
      }
      else {
        console.log(err.stack || err);
      }
    }
  };

  Controller.prototype._runGoTask = function(index) {
    var self = this;

    // finish the go tasks
    if (index === self._goTasks.length) {
      self._finish();
      return;
    }

    var atom = self._goTasks[index];
    if (!atom) {
      return;
    }
    atom.run(function(err, result) {
      if (err) {
        self._handleError(err);
        return;
      }
      if (result === tiny.break) {
        self._finish();
      }
      else if (result instanceof tiny.Controller) {
        self._runNestedController(result, function() {
          self._runGoTask(index + 1);
        });
      }
      else {
        self._runGoTask(index + 1);
      }
    });

  };

  Controller.prototype._runGoTasks = function() {
    this._runGoTask(0);
  };

  Controller.prototype._runParallelTasks = function() {
    var self = this;
    var finishCount = 0;
    var tasksLen = self._parallelTasks.length;

    var toFinish = function() {
      finishCount++;
      if (finishCount === tasksLen) {
        self._finish();
      }
    };

    self._parallelTasks.forEach(function(atom) {
      atom.run(function(err, result) {
        if (err) {
          self._handleError(err);
          return;
        }

        if (result instanceof tiny.Controller) {
          self._runNestedController(result, toFinish);
        }
        else {
          toFinish();
        }
      });
    });
  };

  Controller.prototype._runWhileTask = function(isDoAtOnce) {
    var self = this;
    var runDoTask = function() {
      self._doTask.run(function(err, result) {
        if (err) {
          self._handleError(err);
          return;
        }

        if (result instanceof tiny.Controller) {
          self._runNestedController(result, function() {
            self._runWhileTask();
          });
        }
        else {
          self._runWhileTask();
        }
      });
    };
    var dealCondition = function(condResult) {
      if (condResult) {
        runDoTask();
      }
      else {
        self._finish();
      }
    };

    try {
      if (isDoAtOnce) {
        runDoTask();
        return;
      }
      var result = self._whileConditionFunc();
      dealCondition(result);
    }
    catch (e) {
      self._handleError(e);
    }

  };

  Controller.prototype._runEachAtomTask = function(index) {
    var self = this;
    if (index === self._data.length) {
      self._finish();
      return;
    }
    self._iterTask.run([self._data[index], index], function(err, result) {
      if (err) {
        self._handleError(err);
        return;
      }

      if (result instanceof tiny.Controller) {
        self._runNestedController(result, function() {
          self._runEachAtomTask(index + 1);
        });
      }
      else {
        self._runEachAtomTask(index + 1);
      }
    });
  };

  Controller.prototype._runEachTask = function() {
    this._runEachAtomTask(0);
  };

  Controller.prototype._runMapTask = function() {
    var self = this;
    var finishCount = 0;
    var toFinish = function() {
      finishCount++;
      if (finishCount === self._data.length) {
        self._finish();
      }
    };
    var iterCallback = function(err, result) {
      if (err) {
        self._handleError(err);
        return;
      }

      if (result instanceof tiny.Controller) {
        self._runNestedController(result, toFinish);
      }
      else {
        toFinish();
      }
    };

    for (var i = 0, len = self._data.length; i < len; i++) {
      self._iterTask.run([self._data[i], i], iterCallback);
    }
  };

  Controller.prototype.onError = function(errCallback) {
    this._errorHandler = errCallback;

    return this;
  };

  Controller.prototype.onFinish = function() {
    this._finishTask = new AtomTask(arguments);

    return this;
  };

  Controller.prototype.run = function() {
    var self = this;
    if (arguments.length > 0) {
      self._runTask = new AtomTask(arguments);
    }
    switch (self._kind) {
      case 'go':
        self._runGoTasks();
        break;
      case 'parallel':
        self._runParallelTasks();
        break;
      case 'while-do':
        self._runWhileTask();
        break;
      case 'do-while':
        self._runWhileTask(true);
        break;
      case 'each':
        self._runEachTask();
        break;
      case 'map':
        self._runMapTask();
        break;
      default:
        self._handleError(new Error('Unexpected kind of Controller'));
    }
  };

  /**
   * Helper functions
   */

  function isPromise(obj) {
    return typeof obj.then === 'function';
  }

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  function getKind(obj) {
    if (isPromise(obj)) {
      return 'promise';
    }
    else if (isFunction(obj)) {
      return 'function';
    }
    else {
      return false;
    }
  }

  tiny.Controller = Controller;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = tiny;
  }
  else if (typeof define !== 'undefined' && define.amd) {
    define([], function() {
      return tiny;
    });
  }
  else {
    this.tiny = tiny;
  }

}());
