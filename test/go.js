var Tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('go', function () {

  it('single test', function () {
    var testVal;
    var ti = new Tiny();
    ti.go(function () {
        testVal = 'gua gua';
      })
      .run();
    testVal.should.equal('gua gua');
  });

  it('single async test', function (done) {
    var ti = new Tiny();
    ti.go(helper.singleAsyncFunc, function () {
        done();
      })
      .run();
  });

  it('async test', function (done) {
    var ti = new Tiny();
    ti.go(helper.asyncFunc, 'gua', function (data) {
        data.should.equal('gua');
        done();
      })
      .run();
  });

  it('async multi args test', function (done) {
    var ti = new Tiny();
    ti.go(helper.asyncMultiArgsFunc, 'g1', 'g2', 'g3', function (g1, g2, g3) {
        g1.should.equal('g1');
        g2.should.equal('g2');
        g3.should.equal('g3');
        done();
      })
      .run();
  });

  it('promise test', function (done) {
    var ti = new Tiny();
    ti.go(helper.createPromise('pr'), function (data) {
        data.should.equal('pr');
        done();
      })
      .run();
  });

  it('flow test', function (done) {
    var ti = new Tiny();
    var testData = [];
    ti.go(function () {
        testData.push('zero');
      })
      .go(helper.singleAsyncFunc, function () {
        testData.push('one');
      })
      .go(helper.asyncFunc, 'two', function (data) {
        testData.push(data);
      })
      .go(helper.createPromise('three'), function (data) {
        testData.push(data);
      })
      .go(function () {
        testData[0].should.equal('zero');
        testData[1].should.equal('one');
        testData[2].should.equal('two');
        testData[3].should.equal('three');
        done();
      })
      .run();
  });

  it('break test', function (done) {
    var ti = new Tiny();
    var steps = [false, false];
    ti.go(helper.singleAsyncFunc, function () {
      steps[0] = true;
      return false;
    });
    ti.go(helper.singleAsyncFunc, function () {
      steps[1] = true;
    });
    ti.run(function () {
      steps[0].should.be.true;
      steps[1].should.be.false;
      done();
    });
  });

  it('nested test', function (done) {
    var ti = new Tiny();
    var testData = [];

    ti.go(helper.singleAsyncFunc, function () {
        testData.push('ti one');
      })
      .go(helper.singleAsyncFunc, function () {
        var subti = new Tiny();
        subti.go(helper.singleAsyncFunc, function () {
            testData.push('subti');
          });
        return subti;
      })
      .go(helper.singleAsyncFunc, function () {
        testData.push('ti two');
      })
      .run(function () {
        testData[0].should.equal('ti one');
        testData[1].should.equal('subti');
        testData[2].should.equal('ti two');
        done();
      });

  });

  describe('error test', function () {
    it('single func', function (done) {
      var ti = new Tiny();
      ti.go(function () {
          throw new Error('aa');
        })
        .onError(function (err) {
          err.message.should.equal('aa');
          done();
        })
        .run(function () {
          should(true).be.false;
        });
    });

    it('single async', function (done) {
      var ti = new Tiny();
      ti.go(helper.singleAsyncFunc, function () {
          throw new Error('aa');
        })
        .onError(function (err) {
          err.message.should.equal('aa');
          done();
        })
        .run(function () {
          should(true).be.false;
        });
    });

    it('multi args async', function (done) {
      var ti = new Tiny();
      ti.go(helper.asyncMultiArgsFunc, 1, 2, 3, function () {
          throw new Error('aa');
        })
        .onError(function (err) {
          err.message.should.equal('aa');
          done();
        })
        .run(function () {
          should(true).be.false;
        });
    });

    it('promise fail', function (done) {
      var ti = new Tiny();
      ti.go(helper.createPromise('pr', true), function () {
          throw new Error('aa');
        })
        .onError(function (err) {
          err.message.should.equal('promise error');
          done();
        })
        .run(function () {
          should(true).be.false;
        });
    });

    it('promise throw', function (done) {
      var ti = new Tiny();
      ti.go(helper.createPromise('pr'), function () {
          throw new Error('aa');
        })
        .onError(function (err) {
          err.message.should.equal('aa');
          done();
        })
        .run(function () {
          should(true).be.false;
        });
    });

  });


  describe('nested error test', function () {
    it('should use root error handler if sub tiny error handler is default', function (done) {
      var ti = new Tiny();
      ti.go(function () {
        var subti = new Tiny();
        subti.go(function () {
          throw new Error('subti');
        });
        return subti;
      });
      ti.onError(function (err) {
        err.message.should.equal('subti');
        done();
      });
      ti.run();
    });

    it('should use sub error handler if sub tiny error handler is inited', function (done) {
      var ti = new Tiny();
      ti.go(function () {
        var subti = new Tiny();
        subti.go(function () {
          throw new Error('subti');
        });
        subti.onError(function (err) {
          err.message.should.equal('subti');
          done();
        });
        return subti;
      });
      ti.onError(function (err) {
        should(true).be.false;
      });
      ti.run();
    });
  });

});
