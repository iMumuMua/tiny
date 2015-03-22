var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('while', function() {

  describe('while-do', function() {

    it('while-do should work', function(done) {
      var ctrl = new tiny.Controller();
      var i = 0;
      var condOnce = false;
      ctrl.while(function() {
        if (!condOnce) {
          i.should.equal(0);
          condOnce = true;
        }
        return i < 2;
      });
      ctrl.do(function() {
        i++;
      });
      ctrl.run(function() {
        i.should.equal(2);
        done();
      });
    });

  });

  describe('do-while', function() {

    it('do task should run first', function(done) {
      var ctrl = new tiny.Controller();
      var i = 0;
      var condOnce = false;
      ctrl.do(function() {
        i++;
      });
      ctrl.while(function() {
        if (!condOnce) {
          i.should.equal(1);
          condOnce = true;
        }
        return i < 2;
      });
      ctrl.onFinish(function() {
        i.should.equal(2);
        done();
      });
      ctrl.run();
    });

  });

  describe('error handle', function() {

    it('should catch exception that throw by task', function(done) {
      var ctrl = new tiny.Controller();
      var i = 0;
      ctrl.while(function() { return i < 2; });
      ctrl.do(helper.singleAsyncFunc, function() {
        throw new Error('while err');
      });
      ctrl.onError(function(err) {
        err.message.should.equal('while err');
        done();
      });
      ctrl.run();
    });

    it('should catch exception that throw by sub controller', function(done) {
      var ctrl = new tiny.Controller();
      var i = 0;
      ctrl.while(function() { return i < 2; });
      ctrl.do(helper.singleAsyncFunc, function() {
        var subCtrl = new tiny.Controller();
        subCtrl.go(function() {
          throw new Error('while err');
        });
        return subCtrl;
      });
      ctrl.onError(function(err) {
        err.message.should.equal('while err');
        done();
      });
      ctrl.run();
    });

    it('should not catch sub controller exception if the sub controller has inited error handler', function(done) {
      var ctrl = new tiny.Controller();
      var i = 0;
      ctrl.while(function() { return i < 2; });
      ctrl.do(helper.singleAsyncFunc, function() {
        var subCtrl = new tiny.Controller();
        subCtrl.go(function() {
          throw new Error('while err');
        });
        subCtrl.onError(function(err) {
          err.message.should.equal('while err');
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
