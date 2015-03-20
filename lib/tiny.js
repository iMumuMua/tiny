/**
 * tiny
 * https://github.com/iMumuMua/tiny
 */

(function () {

  'use strict';

  /**
   * Tiny constructor
   * @return {Object}
   */
  var Tiny = function () {
    this._kind = 'init';
    this._flowTasks = [];
    this._parallelTasks = [];
    this._whileConditionFunc = null;
    this._doTask = null;
    this._isDefaultErrorHandler = true;
    this._errorHandler = function (err) {
      console.log(err.stack || err);
    };
  };

  Tiny.prototype._createCell = function (args) {
    var fn, fnArgs, task, kind;

    var setKind = function (fn) {
      if (isPromise(fn)) {
        kind = 'promise';
      }
      else if (isFunction(fn)) {
        kind = 'function';
      }
      else {
        this._errorHandler(new Error('The first args must be a function or promise.'));
      }
    };

    switch (args.length) {
      case 0:
        return;
      case 1:
        kind = 'single';
        task = args[0];
        break;
      case 2:
        fn = args[0];
        setKind(fn);
        task = args[1];
        break;
      default:
        fn = args[0];
        setKind(fn);
        fnArgs = [];
        for (var i = 1, argsLen = args.length; i < argsLen - 1; i++) {
          fnArgs.push(args[i]);
        }
        task = args[args.length - 1];
    }

    return {
      kind: kind,
      fn: fn,
      fnArgs: fnArgs,
      task: task
    };

  };

  Tiny.prototype.go = function () {
    if (this._kind === 'init') {
      this._kind = 'go';
    }
    if (this._kind !== 'go') {
      this._errorHandler(new Error('Should not use method go in unflow control'));
    }

    var cell = this._createCell(arguments);
    this._flowTasks.push(cell);
    return this;
  };

  Tiny.prototype.parallel = function () {
    if (this._kind === 'init') {
      this._kind = 'parallel';
    }
    if (this._kind !== 'parallel') {
      this._errorHandler(new Error('Should not use method parallel in unparallel control'));
    }

    var cell = this._createCell(arguments);
    this._parallelTasks.push(cell);
    return this;
  };

  /**
   * Tiny loop control: while
   * @param {Function} conditionFunc conditionFunc looks like function (callback) {}, callback(true) to continue, callback(false) to break; or just return true or false.
   */
  Tiny.prototype.while = function (conditionFunc) {
    if (this._kind === 'init') {
      this._kind = 'while-do';
    }
    if (this._kind !== 'while-do' && this._kind !== 'do-while') {
      this._errorHandler(new Error('Should not use while in other control type.'));
    }

    this._whileConditionFunc = conditionFunc;
    return this;
  };

  /**
   * Tiny loop control: do
   */
  Tiny.prototype.do = function () {
    if (this._kind === 'init') {
      this._kind = 'do-while';
    }
    if (this._kind !== 'while-do' && this._kind !== 'do-while') {
      this._errorHandler(new Error('Should not use do in other control type.'));
    }

    this._doTask = this._createCell(arguments);
    return this;
  };

  /**
   * Run a task
   * @param {Object} task a cell task
   * @param {Array} args the task fn arguments
   * @param {Function} callback callback when the task succeed, the callback looks like function(result) {}, the result is value that the task return.
   */
  Tiny.prototype._runTask = function (task, callback) {
    var self = this;
    var preCallback = function (err, result) {
      if (err) {
        self._errorHandler(err);
      }
      else {
        if (result instanceof Tiny) {
          if (result._isDefaultErrorHandler) {
            result.onError(self._errorHandler);
          }
          result.run(function () {
            callback(result);
          });
        }
        else {
          callback(result);
        }
      }
    };

    try {
      var result;
      switch (task.kind) {
        case 'single':
          result = task.task();
          preCallback(null, result);
          break;
        case 'promise':
          task.fn.then(function () {
            try {
              result = task.task.apply(null, arguments);
              preCallback(null, result);
            }
            catch (e) {
              preCallback(e);
            }
          }, preCallback);
          break;
        case 'function':
          var fnCallback = function () {
            try {
              var err = arguments[0];
              if (err) {
                preCallback(err);
              }
              else {
                var resData = [];
                for (var i = 1, argumentsLen = arguments.length; i < argumentsLen; i++) {
                  resData.push(arguments[i]);
                }
                result = task.task.apply(null, resData);
                preCallback(null, result);
              }
            }
            catch (e) {
              preCallback(e);
            }
          };
          var fnArgs = (task.fnArgs || []).concat(fnCallback);
          task.fn.apply(null, fnArgs);
          break;
        default:
          preCallback(new Error('Unexpected kind of Tiny cell.'));
      }
    }
    catch (e) {
      preCallback(e);
    }
  };

  Tiny.prototype._runFlowTask = function (index) {
    var self = this;
    var task = self._flowTasks[index];
    if (!task) {
      if (self._finishCallback) {
        self._finishCallback();
      }
      return;
    }

    self._runTask(task, function (result) {
      if (result === false) {
        if (self._finishCallback) {
          self._finishCallback();
        }
      }
      else {
        self._runFlowTask(index + 1);
      }
    });

  };

  Tiny.prototype._runFlowTasks = function () {
    this._runFlowTask(0);
  };

  Tiny.prototype._runParallelTasks = function () {
    var self = this;
    var finishCount = 0;
    var tasksLen = self._parallelTasks.length;

    var toFinish = function () {
      finishCount++;
      if (finishCount === tasksLen) {
        if (self._finishCallback) {
          self._finishCallback();
        }
      }
    };

    self._parallelTasks.forEach(function (task) {
      self._runTask(task, toFinish);
    });
  };

  Tiny.prototype._runWhileTask = function (isDoAtOnce) {
    var self = this;
    var dealCondition = function (result) {
      try {
        if (result) {
          self._runTask(self._doTask, function () {
            self._runWhileTask();
          });
        }
        else {
          if (self._finishCallback) {
            self._finishCallback();
          }
        }
      }
      catch (e) {
        self._errorHandler(e);
      }
    };

    try {
      if (isDoAtOnce) {
        self._runTask(self._doTask, function () {
          self._runWhileTask();
        });
        return;
      }
      var result = self._whileConditionFunc(dealCondition);
      if (result !== undefined) { // access true or false
        dealCondition(result);
      }
    }
    catch (e) {
      self._errorHandler(e);
    }

  };

  Tiny.prototype.onError = function (errCallback) {
    this._errorHandler = errCallback;
    this._isDefaultErrorHandler = false;
    return this;
  };

  Tiny.prototype.run = function (finishCallback) {
    var self = this;
    if (finishCallback) {
      self._finishCallback = function () {
        try {
          finishCallback();
        }
        catch (e) {
          self._errorHandler(e);
        }
      };
    }
    switch (self._kind) {
      case 'go':
        self._runFlowTasks();
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
      default:
        self._errorHandler(new Error('Unexpected kind of Tiny'));
    }
  };


  /**
   * Helper functions
   */

  /**
   * isPromise - Determine whether an object is a promise.
   *
   * @param  {Object} obj
   * @return {Boolean}     return true if obj is a promise.
   */
  function isPromise(obj) {
    return typeof obj.then === 'function';
  }


  /**
   * isFunction - Determine whether an object is a function.
   *
   * @param  {Object} obj
   * @return {Boolean}     return true if obj is a function.
   */
  function isFunction(obj) {
    return typeof obj === 'function';
  }


  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tiny;
  }
  else if (typeof define !== 'undefined' && define.amd) {
    define([], function () {
      return Tiny;
    });
  }
  else {
    this.Tiny = Tiny;
  }

}());
