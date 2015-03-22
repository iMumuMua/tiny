var tiny = require('../lib/tiny.js');
var helper = require('./helper/helper_func.js');

describe('array', function() {

  describe('each', function() {

    it('should iterate each item', function(done) {
      var arr = ['cat', 'dog', 'sheep'];
      var count = 0;
      var ctrl = new tiny.Controller();
      ctrl.each(arr).iter(function(item, index) {
        arr[index].should.equal(item);
        count++;
      });
      ctrl.onFinish(function() {
        count.should.equal(arr.length);
        done();
      });
      ctrl.run();
    });

  });

  describe('map', function() {

    it('should iterate each item and run task parallely', function(done) {
      var arr = ['cat', 'dog', 'sheep'];
      var count = 0;
      var ctrl = new tiny.Controller();
      ctrl.map(arr).iter(function(item, index) {
        // TODO: test parallely
        arr[index].should.equal(item);
        count++;
      });
      ctrl.onFinish(function() {
        count.should.equal(arr.length);
        done();
      });
      ctrl.run();
    });

  });

});
