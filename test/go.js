var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('go', function() {

  it('sequence tasks should run one by one', function(done) {
    var ctrl = new tiny.Controller();
    var testData = [];
    ctrl.go(function () {
      testData.push('zero');
    });
    ctrl.go(helper.singleAsyncFunc, function() {
      testData.push('one');
    });
    ctrl.go(helper.asyncFunc, 'two', function(data) {
      testData.push(data);
    });
    ctrl.go(helper.createPromise('three'), function(data) {
      testData.push(data);
    });
    ctrl.go(function() {
      testData[0].should.equal('zero');
      testData[1].should.equal('one');
      testData[2].should.equal('two');
      testData[3].should.equal('three');
      done();
    });
    ctrl.run();
  });

  it('the task after break should not run', function(done) {
    var ctrl = new tiny.Controller();
    var steps = [false, false];
    ctrl.go(helper.singleAsyncFunc, function() {
      steps[0] = true;
      return tiny.break;
    });
    ctrl.go(helper.singleAsyncFunc, function() {
      steps[1] = true;
    });
    ctrl.onFinish(function() {
      steps[0].should.be.true;
      steps[1].should.be.false;
      done();
    });
    ctrl.run();
  });

  it('the sub controller should run', function(done) {
    var ctrl = new tiny.Controller();
    var stepData = false;
    ctrl.go(function() {
      var subCtrl = new tiny.Controller();
      subCtrl.go(function() {
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
      ctrl.go(function() {
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

  });

});
