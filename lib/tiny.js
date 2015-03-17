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
        throw new Error('The first args must be a function or promise.');
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
    if (this._kind !== 'init' && this._kind !== 'go') {
      throw new Error('Should not use method go in unflow control');
    }

    var cell = this._createCell(arguments);
    this._flowTasks.push(cell);
    return this;
  };

  Tiny.prototype.parallel = function () {
    if (this._kind === 'init') {
      this._kind = 'parallel';
    }
    if (this._kind !== 'init' && this._kind !== 'parallel') {
      throw new Error('Should not use method parallel in unparallel control');
    }

    var cell = this._createCell(arguments);
    this._parallelTasks.push(cell);
    return this;
  };

  Tiny.prototype._runFlowTask = function (index) {
    try {
      var self = this;
      var task = self._flowTasks[index];
      if (!task) {
        if (self._finishCallback) {
          self._finishCallback();
        }
        return;
      }

      var next = function (data) {
        try {
          var ti = task.task.apply(null, data);
          if (ti instanceof Tiny) {
            if (ti._isDefaultErrorHandler) {
              ti.onError(self._errorHandler);
            }
            ti.run(function () {
              self._runFlowTask(index + 1);
            });
          }
          else if (ti === false) {
            if (self._finishCallback) {
              self._finishCallback();
            }
          }
          else {
            self._runFlowTask(index + 1);
          }
        }
        catch (e) {
          self._errorHandler(e);
        }
      };

      switch (task.kind) {
        case 'single':
          next();
          break;
        case 'promise':
          task.fn.then(function () {
            next(arguments);
          }, self._errorHandler);
          break;
        case 'function':
          var fnCallback = function () {
            try {
              var err = arguments[0];
              if (err) {
                self._errorHandler(err);
              }
              else {
                var data = [];
                for (var i = 1, argumentsLen = arguments.length; i < argumentsLen; i++) {
                  data.push(arguments[i]);
                }
                next(data);
              }
            }
            catch (e) {
              self._errorHandler(e);
            }
          };
          var args = (task.fnArgs || []).concat(fnCallback);
          task.fn.apply(null, args);
          break;
        default:
          self._errorHandler(new Error('Unexpected kind of Tiny cell.'));
      }
    }
    catch (e) {
      self._errorHandler(e);
    }

  };

  Tiny.prototype._runParallelTasks = function () {
    try {
      var self = this;
      var finishCount = 0;
      var tasksLen = self._parallelTasks.length;

      var toFinish = function () {
        try {
          finishCount++;
          if (finishCount === tasksLen) {
            if (self._finishCallback) {
              self._finishCallback();
            }
          }
        }
        catch (e) {
          self._errorHandler(e);
        }
      };

      var runNestedTiny = function (ti) {
        if (ti instanceof Tiny) {
          if (ti._isDefaultErrorHandler) {
            ti.onError(self._errorHandler);
          }
          ti.run(function () {
            toFinish();
          });
        }
        else {
          toFinish();
        }
      };

      self._parallelTasks.forEach(function (task) {
        switch (task.kind) {
          case 'single':
            var ti = task.task();
            runNestedTiny(ti);
            break;
          case 'promise':
            task.fn.then(function () {
              try {
                var ti = task.task.apply(null, arguments);
                runNestedTiny(ti);
              }
              catch (e) {
                self._errorHandler(e);
              }
            }, self._errorHandler);
            break;
          case 'function':
            var fnCallback = function () {
              try {
                var err = arguments[0];
                if (err) {
                  self._errorHandler(err);
                }
                else {
                  var data = [];
                  for (var i = 1, argumentsLen = arguments.length; i < argumentsLen; i++) {
                    data.push(arguments[i]);
                  }

                  var ti = task.task.apply(null, arguments);
                  runNestedTiny(ti);
                }
              }
              catch (e) {
                self._errorHandler(e);
              }
            };
            var args = (task.fnArgs || []).concat(fnCallback);
            task.fn.apply(null, args);
            break;
          default:
            self._errorHandler(new Error('Unexpected kind of Tiny cell.'));
        }
      });
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
    if (finishCallback) {
      this._finishCallback = finishCallback;
    }
    switch (this._kind) {
      case 'go':
        this._runFlowTask(0);
        break;
      case 'parallel':
        this._runParallelTasks();
        break;
      default:
        throw new Error('Unexpected kind of Tiny');
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
