var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('finish', function() {

  it('base finish test', function(done) {
    var ctrl = new tiny.Controller();
    var count = 0;
    ctrl.go(helper.singleAsyncFunc, function() {
      var subCtrl = new tiny.Controller();
      subCtrl.go(helper.singleAsyncFunc, function() {
        count++;
      });
      subCtrl.onFinish(function() {
        count++;
      });
      return subCtrl;
    });
    ctrl.run(function() {
      count.should.equal(2);
      done();
    });
  });

  it('throw err in finish callback function', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function() {});
    ctrl.onFinish(function() {
      throw new Error('finish err');
    });
    ctrl.onError(function(err) {
      err.message.should.equal('finish err');
      done();
    });
    ctrl.run();
  });

});
