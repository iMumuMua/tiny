/**
 * tiny
 * https://github.com/iMumuMua/tiny
 */

/**
 * Tiny constructor
 * @return {Object}
 */
var Tiny = function () {
  this._flowTasks = [];
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

/**
 * Add flow task
 *
 *  examples:
 *    var ti = new Tiny();
 *    var mongoose = require('mongoose'),
 *      User = mongoose.model('User');
 *    var user;
 *    ti.go(function () {
 *        // do something
 *      })
 *      .go(fs.readdir, './path', function (files) {
 *        // do something
 *      })
 *      .go(User.findOne(options).exec(), function (_user) {
 *        user = _user;
 *        // do something such as user.nickname = 'tiny';
 *      })
 *      .go(user.save, function () {
 *        // do something when save success
 *      })
 *      .run();
 *
 * @return {Tiny} return this
 */
Tiny.prototype.go = function () {
  var cell = this._createCell(arguments);
  this._flowTasks.push(cell);
  return this;
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

  var next = function (data) {
    var ti = task.task.apply(null, data);
    if (ti instanceof Tiny) {
      ti.run(function () {
        self._runFlowTask(index + 1);
      });
    }
    else {
      self._runFlowTask(index + 1);
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
      };
      var args = (task.fnArgs || []).concat(fnCallback);
      task.fn.apply(null, args);
      break;
    default:
      self._errorHandler(new Error('Unexpected kind of Tiny cell.'));
  }
};

Tiny.prototype.run = function (finishCallback) {
  // TODO
  if (finishCallback) {
    this._finishCallback = finishCallback;
  }
  this._runFlowTask(0);
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

module.exports = Tiny;
