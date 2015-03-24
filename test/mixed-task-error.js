var tiny = require('../lib/tiny.js');

describe('mixed task method error test', function() {

  it('should throw error when mixed task method (go, parallel)', function(done) {
    try {
      var ctrl = tiny.Controller();
      ctrl.go(function() {});
      ctrl.parallel(function() {});
      ctrl.run();
    }
    catch (e) {
      done();
    }
  });

  it('should throw error when mixed task method (parallel, go)', function(done) {
    try {
      var ctrl = tiny.Controller();
      ctrl.parallel(function() {});
      ctrl.go(function() {});
      ctrl.run();
    }
    catch (e) {
      done();
    }
  });

  it('should throw error when mixed task method (go, do)', function(done) {
    try {
      var ctrl = tiny.Controller();
      ctrl.go(function() {});
      ctrl.do(function() {});
      ctrl.while(function() {});
      ctrl.run();
    }
    catch (e) {
      done();
    }
  });

  it('should throw error when mixed task method (go, while)', function(done) {
    try {
      var ctrl = tiny.Controller();
      ctrl.go(function() {});
      ctrl.while(function() {});
      ctrl.do(function() {});
      ctrl.run();
    }
    catch (e) {
      done();
    }
  });

  it('should throw error when mixed task method (go, each)', function(done) {
    try {
      var ctrl = tiny.Controller();
      ctrl.go(function() {});
      ctrl.each([]);
      ctrl.iter(function() {});
      ctrl.run();
    }
    catch (e) {
      done();
    }
  });

  it('should throw error when mixed task method (go, map)', function(done) {
    try {
      var ctrl = tiny.Controller();
      ctrl.go(function() {});
      ctrl.map([]);
      ctrl.iter(function() {});
      ctrl.run();
    }
    catch (e) {
      done();
    }
  });

});
