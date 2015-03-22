var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('catch exception', function() {

  it('should catch exception that throw by single task', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function() {
      throw new Error('aa');
    });
    ctrl.onError(function(err) {
      err.message.should.equal('aa');
      done();
    });
    ctrl.run();
  });

  it('should catch exception that throw by async task', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(helper.singleAsyncFunc, function() {
      throw new Error('aa');
    });
    ctrl.onError(function(err) {
      err.message.should.equal('aa');
      done();
    });
    ctrl.run();
  });

  it('should catch error when promise failed', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(helper.createPromise('pr', true), function() {
      throw new Error('aa');
    });
    ctrl.onError(function(err) {
      err.message.should.equal('promise error');
      done();
    });
    ctrl.run();
  });

  it('should catch exception that throw by promise task', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(helper.createPromise('pr'), function() {
      throw new Error('aa');
    });
    ctrl.onError(function(err) {
      err.message.should.equal('aa');
      done();
    });
    ctrl.run();
  });

});
