var tiny = require('../lib/tiny.js');

describe('shotcut functions', function() {

  it('should work when call tiny.go', function(done) {
    var step = [false, false];
    tiny.go(function() {
      step[0] = true;
    })
    .go(function() {
      step[1] = true;
    })
    .onFinish(function() {
      step[0].should.be.true;
      step[1].should.be.true;
      done();
    })
    .run();
  });

  it('should work when call tiny.parallel', function(done) {
    var step = [false, false];
    tiny.parallel(function() {
      step[0] = true;
    })
    .parallel(function() {
      step[1] = true;
    })
    .onFinish(function() {
      step[0].should.be.true;
      step[1].should.be.true;
      done();
    })
    .run();
  });

  it('should work when call tiny.while', function(done) {
    var i = 0;
    var condOnce = false;
    tiny.while(function() {
      if (!condOnce) {
        i.should.equal(0);
        condOnce = true;
      }
      return i < 2;
    })
    .do(function() {
      i++;
    })
    .run(function() {
      i.should.equal(2);
      done();
    });
  });

  it('should work when call tiny.do', function(done) {
    var i = 0;
    var condOnce = false;
    tiny.do(function() {
      i++;
    })
    .while(function() {
      if (!condOnce) {
        i.should.equal(1);
        condOnce = true;
      }
      return i < 2;
    })
    .onFinish(function() {
      i.should.equal(2);
      done();
    })
    .run();
  });

  it('should work when call tiny.each', function(done) {
    var arr = ['cat', 'dog', 'sheep'];
    var count = 0;
    tiny.each(arr).iter(function(item, index) {
      arr[index].should.equal(item);
      count++;
    })
    .onFinish(function() {
      count.should.equal(arr.length);
      done();
    })
    .run();
  });

  it('should work when call tiny.map', function(done) {
    var arr = ['cat', 'dog', 'sheep'];
    var count = 0;
    tiny.map(arr).iter(function(item, index) {
      arr[index].should.equal(item);
      count++;
    })
    .onFinish(function() {
      count.should.equal(arr.length);
      done();
    })
    .run();
  });

});
