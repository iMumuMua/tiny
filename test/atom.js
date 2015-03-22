var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('atom test', function() {

  describe('single task', function() {
    it('single task should run', function(done) {
      var ctrl = new tiny.Controller();
      var stepData = false;
      ctrl.go(function() {
        stepData = true;
      });
      ctrl.onFinish(function() {
        stepData.should.be.true;
        done();
      });
      ctrl.run();
    });
  });

  describe('async task', function() {
    it('async function without args should work', function(done) {
      var ctrl = new tiny.Controller();
      var stepData = false;
      ctrl.go(helper.singleAsyncFunc, function() {
        stepData = true;
      });
      ctrl.onFinish(function() {
        stepData.should.be.true;
        done();
      });
      ctrl.run();
    });

    it('one arg async function should work', function(done) {
      var ctrl = new tiny.Controller();
      var stepData = false;
      ctrl.go(helper.asyncFunc, 'hello', function(data) {
        stepData = true;
        data.should.equal('hello');
      });
      ctrl.onFinish(function() {
        stepData.should.be.true;
        done();
      });
      ctrl.run();
    });

    it('multi args async function should work', function(done) {
      var ctrl = new tiny.Controller();
      var stepData = false;
      ctrl.go(helper.asyncMultiArgsFunc, 'miao~', 'wang~', 'mie~', function(cat, dog, sheep) {
        stepData = true;
        cat.should.equal('miao~');
        dog.should.equal('wang~');
        sheep.should.equal('mie~');
      });
      ctrl.onFinish(function() {
        stepData.should.be.true;
        done();
      });
      ctrl.run();
    });
  });

  describe('promise task', function() {
    it('promise task should run', function(done) {
      var ctrl = new tiny.Controller();
      var stepData = false;
      ctrl.go(helper.createPromise('pr'), function(data) {
        stepData = true;
        data.should.equal('pr');
      });
      ctrl.onFinish(function() {
        stepData.should.be.true;
        done();
      });
      ctrl.run();
    });
  });

});
