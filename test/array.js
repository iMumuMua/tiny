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

    it('the sub controller should run', function(done) {
      var arr = ['cat', 'dog', 'sheep'];
      var count = 0;
      var stepData = false;
      var ctrl = new tiny.Controller();
      ctrl.each(arr).iter(function(item, index) {
        arr[index].should.equal(item);
        count++;
        var subCtrl = new tiny.Controller();
        subCtrl.go(function() {
          stepData = true;
        });
        return subCtrl;
      });
      ctrl.onFinish(function() {
        count.should.equal(arr.length);
        stepData.should.be.true;
        done();
      });
      ctrl.run();
    });

    it('should catch exception that throw by iter task', function(done) {
      var arr = ['cat', 'dog', 'sheep'];
      var ctrl = new tiny.Controller();
      ctrl.each(arr).iter(function(item, index) {
        throw new Error(item);
      });
      ctrl.onError(function(err) {
        err.message.should.equal('cat');
        done();
      });
      ctrl.run();
    });

  });

  describe('map', function() {

    it('should iterate each item and run task parallely', function(done) {
      var arr = ['cat', 'dog', 'sheep'];
      var count = 0;
      var resData = [];
      var ctrl = new tiny.Controller();
      ctrl.map(arr).iter(function(item, index) {
        arr[index].should.equal(item);
        count++;
        var subCtrl = new tiny.Controller();
        var delayTime = (arr.length - index) * 15;
        subCtrl.go(helper.asyncTimerFunc, delayTime, function() {
          resData.push(index);
        });
        return subCtrl;
      });
      ctrl.onFinish(function() {
        count.should.equal(arr.length);
        resData[0].should.equal(2);
        resData[1].should.equal(1);
        resData[2].should.equal(0);
        done();
      });
      ctrl.run();
    });

    it('should catch exception that throw by iter task', function(done) {
      var arr = ['cat', 'dog', 'sheep'];
      var ctrl = new tiny.Controller();
      ctrl.map(arr).iter(function(item, index) {
        throw new Error(item);
      });
      ctrl.onError(function(err) {
        err.message.should.be.ok;
        done();
      });
      ctrl.run();
    });

  });

});
