var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('finish', function () {

  it('base finish test', function (done) {
    var ctrl = new tiny.Controller();
    var count = 0;
    ctrl.go(helper.singleAsyncFunc, function () {
      var ctrl = new tiny.Controller();
      ctrl.go(helper.singleAsyncFunc, function () {
        count++;
      });
      ctrl.finish(function (callback) {
        count++;
        callback();
      });
      return ctrl;
    });
    ctrl.run(function () {
      count.should.equal(2);
      done();
    });
  });

  it('throw err in finish callback function', function (done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function () {});
    ctrl.finish(function (callback) {
      throw new Error('finish err');
    });
    ctrl.onError(function (err) {
      err.message.should.equal('finish err');
      done();
    });
    ctrl.run();
  });

  it('callback err in finish callback function', function (done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function () {});
    ctrl.finish(function (callback) {
      callback(new Error('finish err'));
    });
    ctrl.onError(function (err) {
      err.message.should.equal('finish err');
      done();
    });
    ctrl.run();
  });

});
