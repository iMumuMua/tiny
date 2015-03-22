var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('parallel', function() {

  it('async tasks should run parallelly', function(done) {
    var ctrl = new tiny.Controller();
    var testData = [];
    ctrl.parallel(helper.asyncTimerFunc, 30, function() {
      testData.push('first');
    });
    ctrl.parallel(helper.asyncTimerFunc, 15, function() {
      testData.push('two');
    });
    ctrl.run(function() {
      testData[0].should.equal('two');
      testData[1].should.equal('first');
      done();
    });
  });

  it('the sub controller should run', function(done) {
    var ctrl = new tiny.Controller();
    var stepData = false;
    ctrl.parallel(function() {
      var subCtrl = new tiny.Controller();
      subCtrl.parallel(function() {
        stepData = true;
      });
      return subCtrl;
    });
    ctrl.onFinish(function() {
      stepData.should.be.true;
      done();
    });
    ctrl.run();
  });

  describe('error handle', function() {

    it('should catch exception that throw by task', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        throw new Error('aa');
      });
      ctrl.onError(function(err) {
        err.message.should.equal('aa');
        done();
      });
      ctrl.run();
    });

    it('should catch exception that throw by sub controller', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        var ctrl = new tiny.Controller();
        ctrl.parallel(function() {
          throw new Error('sub ctrl');
        });
        return ctrl;
      });
      ctrl.onError(function(err) {
        err.message.should.equal('sub ctrl');
        done();
      });
      ctrl.run();
    });

    it('should not catch sub controller exception if the sub controller has inited error handler', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        var ctrl = new tiny.Controller();
        ctrl.parallel(function() {
          throw new Error('sub ctrl');
        });
        ctrl.onError(function(err) {
          err.message.should.equal('sub ctrl');
          done();
        });
        return ctrl;
      });
      ctrl.onError(function(err) {
        should(true).be.false;
      });
      ctrl.run();
    });

  });

});
