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

    it('sub controller should work', function(done) {
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
        var subCtrl = new tiny.Controller();
        subCtrl.go(function() {
          i++;
        });
        return subCtrl;
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

});
