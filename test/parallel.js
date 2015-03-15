var Tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('parallel', function () {

  it('single test', function () {
    var ti = new Tiny();
    var testData = {};
    ti.parallel(function () {
        testData.stepOne = 'one';
      })
      .parallel(function () {
        testData.stepTwo = 'two';
      })
      .run();
    testData.stepOne.should.equal('one');
    testData.stepTwo.should.equal('two');
  });

  it('async timer test', function (done) {
    var ti = new Tiny();
    var testData = [];
    ti.parallel(helper.asyncTimerFunc, 20, function () {
        testData.push('first');
      })
      .parallel(helper.asyncTimerFunc, 15, function () {
        testData.push('two');
      })
      .run(function () {
        testData[0].should.equal('two');
        testData[1].should.equal('first');
        done();
      });
  });

  it('promise test', function (done) {
    var ti = new Tiny();
    var testData = {};
    ti.parallel(helper.createPromise('pr'), function (data) {
        data.should.equal('pr');
        testData.pr = data;
      })
      .parallel(helper.createPromise('pr2'), function (data) {
        data.should.equal('pr2');
        testData.pr2 = data;
      })
      .run(function () {
        testData.pr.should.equal('pr');
        testData.pr2.should.equal('pr2');
        done();
      });
  });

  it('nested test', function (done) {
    var ti = new Tiny();
    var nestedData = {};
    ti.parallel(function () {
        var subti = new Tiny();
        subti.parallel(function () {
          nestedData.single = true;
        });
        return subti;
      })
      .parallel(helper.singleAsyncFunc, function () {
        var subti = new Tiny();
        subti.parallel(function () {
          nestedData.singleAsyncFunc = true;
        });
        return subti;
      })
      .parallel(helper.asyncFunc, 'async', function (data) {
        var subti = new Tiny();
        subti.parallel(function () {
          nestedData.asyncFunc = true;
        });
        return subti;
      })
      .parallel(helper.createPromise('pr'), function (data) {
        var subti = new Tiny();
        subti.parallel(function () {
          nestedData.promise = true;
        });
        return subti;
      })
      .run(function () {
        for (var key in nestedData) {
          nestedData[key].should.be.true;
        }
        done();
      });
  });

});