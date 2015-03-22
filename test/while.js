var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('while', function() {

  describe('while-do', function() {
    it('simple', function(done) {
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

    it('async do', function(done) {
      var ctrl = new tiny.Controller();
      var i = 0;
      ctrl.while(function() { return i < 2; });
      ctrl.do(helper.singleAsyncFunc, function() {
        i++;
      });
      ctrl.run(function() {
        i.should.equal(2);
        done();
      });
    });

    it('throw error', function(done) {
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
      ctrl.run(function() {
        (true).should.be.false;
      });
    });

    it('child error', function(done) {
      var ctrl = new tiny.Controller();
      var i = 0;
      ctrl.while(function() { return i < 2; });
      ctrl.do(helper.singleAsyncFunc, function() {
        var ctrl = new tiny.Controller();
        ctrl.go(function() {
          throw new Error('while err');
        });
        return ctrl;
      });
      ctrl.onError(function(err) {
        err.message.should.equal('while err');
        done();
      });
      ctrl.run(function() {
        (true).should.be.false;
      });
    });

  });

  describe('do-while', function() {
    it('simple', function(done) {
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
      ctrl.run(function() {
        i.should.equal(2);
        done();
      });
    });

  });


});
