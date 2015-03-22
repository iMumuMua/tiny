var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('finish', function() {

  it('finish task should run', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function() {});
    ctrl.onFinish(function() {
      done();
    });
    ctrl.run();
  });

  it('should catch exception that throw by finish task', function(done) {
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
