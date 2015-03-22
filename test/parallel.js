var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('parallel', function() {

  it('single test', function() {
    var ctrl = new tiny.Controller();
    var testData = {};
    ctrl.parallel(function() {
      testData.stepOne = 'one';
    });
    ctrl.parallel(function() {
      testData.stepTwo = 'two';
    });
    ctrl.run(function() {
      testData.stepOne.should.equal('one');
      testData.stepTwo.should.equal('two');
    });

  });

  it('async timer test', function(done) {
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

  it('promise test', function(done) {
    var ctrl = new tiny.Controller();
    var testData = {};
    ctrl.parallel(helper.createPromise('pr'), function(data) {
      data.should.equal('pr');
      testData.pr = data;
    });
    ctrl.parallel(helper.createPromise('pr2'), function(data) {
      data.should.equal('pr2');
      testData.pr2 = data;
    });
    ctrl.run(function() {
      testData.pr.should.equal('pr');
      testData.pr2.should.equal('pr2');
      done();
    });
  });

  it('nested test', function(done) {
    var ctrl = new tiny.Controller();
    var nestedData = {};
    ctrl.parallel(function() {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        nestedData.single = true;
      });
      return ctrl;
    });
    ctrl.parallel(helper.singleAsyncFunc, function() {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        nestedData.singleAsyncFunc = true;
      });
      return ctrl;
    });
    ctrl.parallel(helper.asyncFunc, 'async', function(data) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        nestedData.asyncFunc = true;
      });
      return ctrl;
    });
    ctrl.parallel(helper.createPromise('pr'), function(data) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        nestedData.promise = true;
      });
      return ctrl;
    });
    ctrl.run(function() {
      for (var key in nestedData) {
        nestedData[key].should.be.true;
      }
      done();
    });
  });

  describe('error test', function() {
    it('single func', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        throw new Error('aa');
      });
      ctrl.onError(function(err) {
        err.message.should.equal('aa');
        done();
      });
      ctrl.run(function() {
        should(true).be.false;
      });
    });

    it('single async', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(helper.singleAsyncFunc, function() {
        throw new Error('aa');
      });
      ctrl.onError(function(err) {
        err.message.should.equal('aa');
        done();
      });
      ctrl.run(function() {
        should(true).be.false;
      });
    });

    it('multi args async', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(helper.asyncMultiArgsFunc, 1, 2, 3, function() {
        throw new Error('aa');
      });
      ctrl.onError(function(err) {
        err.message.should.equal('aa');
        done();
      });
      ctrl.run(function() {
        should(true).be.false;
      });
    });

    it('promise fail', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(helper.createPromise('pr', true), function() {
        throw new Error('aa');
      });
      ctrl.onError(function(err) {
        err.message.should.equal('promise error');
        done();
      });
      ctrl.run(function() {
        should(true).be.false;
      });
    });

    it('promise throw', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(helper.createPromise('pr'), function() {
        throw new Error('aa');
      });
      ctrl.onError(function(err) {
        err.message.should.equal('aa');
        done();
      });
      ctrl.run(function() {
        should(true).be.false;
      });
    });

  });



  describe('nested error test', function() {
    it('should use root error handler if sub tiny error handler is default', function(done) {
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

    it('should use sub error handler if sub tiny error handler is inited', function(done) {
      var ctrl = new tiny.Controller();
      ctrl.parallel(function() {
        var ctrl = new tiny.Controller();
        ctrl.parallel(function() {
          throw new Error('sub ctrl');
        });
        ctrl.onError(function(err) {
          err.message.should.equal('sub ctrl');
          done();
        })
        return ctrl;
      });
      ctrl.onError(function(err) {
        should(true).be.false;
      });
      ctrl.run();
    });
  });

});
