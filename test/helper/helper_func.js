/**
 * helper functions for test
 */

exports.singleAsyncFunc = function (callback) {
  setTimeout(function () {
    callback();
  });
};

exports.singleAsyncFailFunc = function (callback) {
  setTimeout(function () {
    callback(new Error());
  });
};

exports.asyncFunc = function (arg, callback) {
  setTimeout(function () {
    callback(null, arg);
  });
};

exports.asyncFailFunc = function (arg, callback) {
  setTimeout(function () {
    callback(new Error());
  });
};

exports.createPromise = function (data) {
  var promise = {};
  promise.then = function (resolve, reject) {
    setTimeout(function () {
      resolve(data);
    });
  };
  return promise;
};

exports.createFailPromise = function () {
  var promise = {};
  promise.then = function (resolve, reject) {
    setTimeout(function () {
      reject(new Error());
    });
  };
  return promise;
};
