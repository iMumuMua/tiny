var tiny = require('../lib/tiny.js');

describe('create atom error test', function() {

  var testArgs = function() {
    var args = arguments;
    it('should throw error when un correct arguments', function(done) {
      try {
        var ctrl = new tiny.Controller();
        ctrl.go.apply(ctrl, args);
        ctrl.run();
      }
      catch (e) {
        done();
      }
    });
  };

  testArgs();
  testArgs('hello');
  testArgs('hello', 'hi');
  testArgs('hello', 'hi', 'no func');

});
