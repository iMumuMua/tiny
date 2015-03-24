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

  it('should not run finish task when throw error', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function() {
      throw new Error('aa');
    });
    ctrl.onError(function(err) {
      err.message.should.equal('aa');
      done();
    });
    ctrl.onFinish(function() {
      should(true).be.false;
    });
    ctrl.run();
  });

  it('should use default error handler to console.log', function() {
    var ctrl = new tiny.Controller();
    ctrl.go(function() {
      throw new Error('default error handler');
    });
    ctrl.onError();
    ctrl.run();
  });

  it('should catch exception that throw by sub controller', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function() {
      var subCtrl = new tiny.Controller();
      subCtrl.go(function() {
        throw new Error('go');
      });
      return subCtrl;
    });
    ctrl.onError(function(err) {
      err.message.should.equal('go');
      done();
    });
    ctrl.run();
  });

  it('should not catch sub controller exception if the sub controller has inited error handler', function(done) {
    var ctrl = new tiny.Controller();
    ctrl.go(function() {
      var subCtrl = new tiny.Controller();
      subCtrl.go(function() {
        throw new Error('go error');
      });
      subCtrl.onError(function(err) {
        err.message.should.equal('go error');
        done();
      });
      return subCtrl;
    });
    ctrl.onError(function(err) {
      should(true).be.false;
    });
    ctrl.run();
  });

  it('should bubble error if sub controller error handler return tiny.bubble', function(done) {
    var ctrl = new tiny.Controller();
    var step = false;
    ctrl.go(function() {
      var subCtrl = new tiny.Controller();
      subCtrl.go(function() {
        throw new Error('go error');
      });
      subCtrl.onError(function(err) {
        err.message.should.equal('go error');
        step = true;
        return tiny.bubble;
      });
      return subCtrl;
    });
    ctrl.onError(function(err) {
      err.message.should.equal('go error');
      step.should.be.true;
      done();
    });
    ctrl.run();
  });

});
