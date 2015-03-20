var Tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('finish', function () {

  it('base finish test', function (done) {
    var ti = new Tiny();
    var count = 0;
    ti.go(helper.singleAsyncFunc, function () {
      var subti = new Tiny();
      subti.go(helper.singleAsyncFunc, function () {
        count++;
      });
      subti.finish(function (callback) {
        count++;
        callback();
      });
      return subti;
    });
    ti.run(function () {
      count.should.equal(2);
      done();
    });
  });

  it('throw err in finish callback function', function (done) {
    var ti = new Tiny();
    ti.go(function () {});
    ti.finish(function (callback) {
      throw new Error('finish err');
    });
    ti.onError(function (err) {
      err.message.should.equal('finish err');
      done();
    });
    ti.run();
  });

  it('callback err in finish callback function', function (done) {
    var ti = new Tiny();
    ti.go(function () {});
    ti.finish(function (callback) {
      callback(new Error('finish err'));
    });
    ti.onError(function (err) {
      err.message.should.equal('finish err');
      done();
    });
    ti.run();
  });

});
