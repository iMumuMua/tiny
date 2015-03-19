var Tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('while', function () {

  describe('while-do', function () {
    it('simple', function (done) {
      var ti = new Tiny();
      var i = 0;
      var condOnce = false;
      ti.while(function () {
        if (!condOnce) {
          i.should.equal(0);
          condOnce = true;
        }
        return i < 2;
      });
      ti.do(function () {
        i++;
      });
      ti.run(function () {
        i.should.equal(2);
        done();
      });
    });

    it('async do', function (done) {
      var ti = new Tiny();
      var i = 0;
      ti.while(function () { return i < 2; });
      ti.do(helper.singleAsyncFunc, function () {
        i++;
      });
      ti.run(function () {
        i.should.equal(2);
        done();
      });
    });

    it('throw error', function (done) {
      var ti = new Tiny();
      var i = 0;
      ti.while(function () { return i < 2; });
      ti.do(helper.singleAsyncFunc, function () {
        throw new Error('while err');
      });
      ti.onError(function (err) {
        err.message.should.equal('while err');
        done();
      });
      ti.run(function () {
        (true).should.be.false;
      });
    });

    it('child error', function (done) {
      var ti = new Tiny();
      var i = 0;
      ti.while(function () { return i < 2; });
      ti.do(helper.singleAsyncFunc, function () {
        var subti = new Tiny();
        subti.go(function () {
          throw new Error('while err');
        });
        return subti;
      });
      ti.onError(function (err) {
        err.message.should.equal('while err');
        done();
      });
      ti.run(function () {
        (true).should.be.false;
      });
    });

  });

  describe('do-while', function () {
    it('simple', function (done) {
      var ti = new Tiny();
      var i = 0;
      var condOnce = false;
      ti.do(function () {
        i++;
      });
      ti.while(function () {
        if (!condOnce) {
          i.should.equal(1);
          condOnce = true;
        }
        return i < 2;
      });
      ti.run(function () {
        i.should.equal(2);
        done();
      });
    });

  });


});
