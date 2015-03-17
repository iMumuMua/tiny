/**
 * helper functions for test
 */

var Q = require('q');

exports.singleAsyncFunc = function (callback) {
  setTimeout(function () {
    callback();
  }, 10);
};

exports.singleAsyncFailFunc = function (callback) {
  setTimeout(function () {
    callback(new Error());
  }, 10);
};

exports.asyncFunc = function (arg, callback) {
  setTimeout(function () {
    callback(null, arg);
  }, 10);
};

exports.asyncFailFunc = function (arg, callback) {
  setTimeout(function () {
    callback(new Error('async error'));
  }, 10);
};

exports.asyncTimerFunc = function (millisecond, callback) {
  setTimeout(function () {
    callback(null);
  }, millisecond);
};

exports.asyncMultiArgsFunc = function (arg1, arg2, arg3, callback) {
  setTimeout(function () {
    callback(null, arg1, arg2, arg3);
  }, 10);
};

exports.asyncMultiArgsFailFunc = function (arg1, arg2, arg3, callback) {
  setTimeout(function () {
    callback(new Error('multi args async error'));
  }, 10);
};

exports.createPromise = function (data, isThrowError) {
  var deferred = Q.defer();
  setTimeout(function () {
    if (isThrowError) {
      deferred.reject(new Error('promise error'));
    }
    else {
      deferred.resolve(data);
    }
  }, 10);
  return deferred.promise;
};
