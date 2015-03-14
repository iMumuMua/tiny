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

});
