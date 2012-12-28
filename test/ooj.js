var should = require("should"),
    ooj = require("../index");

var testTypeFunk = function(type) {
  return function() {
    return ooj.define(type, {names: ["name"]});
  };
};

describe("Object Oriented Javascript", function() {
  
  describe("ooj", function() {
    it("should have a 'define' function", function() {
      ooj.should.have.property("define");
      ooj.define.should.be.a("function");
    });

    it("should have a 'Class' function on it", function() {
      ooj.should.have.property("Class");
      ooj.Class.should.be.a("function");
    });

    it("should have an 'Interface' function on it", function() {
      ooj.should.have.property("Interface");
      ooj.Interface.should.be.a("function");
    });

    it("should have an 'Enum' function on it", function() {
      ooj.should.have.property("Enum");
      ooj.Enum.should.be.a("function");
    });
  });

  describe("The define function", function() {
    it("should accept 'class' as a type", function() {
      testTypeFunk("class").should.not.throw();
    });

    it("should accept 'interface' as a type", function() {
      testTypeFunk("interface").should.not.throw();
    });

    it("should accept 'enum' as a type", function() {
      testTypeFunk("enum").should.not.throw();
    });

    it("should accept types regardless of case", function() {
      testTypeFunk("ClAsS").should.not.throw();
    });

    it("should throw an error on invalid type", function() {
      testTypeFunk("invalid").should.throw();
    });

    it("should return the same thing as Class", function() {
      var testData = {value: 10},
          first = ooj.define("class", testData),
          second = ooj.Class(testData);
      first.should.eql(second);
    });

    it("should return the same thing as Interface", function() {
      var testData = {functions: ["first"]},
          first = ooj.define("interface", testData),
          second = ooj.Interface(testData);
      first.should.eql(second);
    });

    it("should return the same thing as Enum", function() {
      var testData = {names: ["One"]},
          first = ooj.define("enum", testData),
          second = ooj.Enum(testData);
      first.should.eql(second);
    });
  });

  describe("the 'Enum' function", function() {
    var TestEnum;

    before(function() {
      TestEnum = ooj.Enum({
        names: [
          "One",
          "Two",
          "Three",
          "Four"
        ]
      });
    });

    it("should create an object with the right properties", function() {
      TestEnum.should.be.a("object");
      TestEnum.should.have.property("One", 0);
      TestEnum.should.have.property("Two", 1);
      TestEnum.should.have.property("Three", 2);
      TestEnum.should.have.property("Four", 3);
    });

    it("should allow you to set values", function() {
      var e = ooj.Enum({
        names: ["One", "Two"], 
        values: [1]
      });

      e.should.have.property("One", 1);
      e.should.have.property("Two", 2);
    });
  });

});