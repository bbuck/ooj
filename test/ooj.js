var should = require("should"),
    ooj = require("../index");

function testTypeFunk(type) {
  return function() {
    return ooj.define(type, {
      values: ["name"],
      functions: ["one"]
    });
  };
}

function instantiate(Klass) {
  return function() {
    var test = new Klass();
  };
}

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
          fproto = first.prototype,
          second = ooj.Class(testData),
          sproto = second.prototype,
          prop;
      for (prop in fproto) {
        sproto.should.have.property(prop);
        sproto[prop].should.be.a(typeof(fproto[prop]));
      }
    });

    it("should return the same thing as Interface", function() {
      var testData = {functions: ["first"]},
          first = ooj.define("interface", testData),
          fproto = first.prototype,
          second = ooj.Interface(testData),
          sproto = second.prototype,
          prop;
      for (prop in fproto) {
        sproto.should.have.property(prop);
        sproto[prop].should.be.a(typeof(fproto[prop]));
      }
    });

    it("should return the same thing as Enum", function() {
      var testData = {values: ["One"]},
          first = ooj.define("enum", testData),
          second = ooj.Enum(testData);
      first.should.eql(second);
    });
  });

  describe("the 'Enum' function", function() {
    var TestEnum;

    before(function() {
      TestEnum = ooj.Enum({
        values: [
          "One",
          "Two",
          "Three",
          "Four"
        ]
      });
    });

    it("should create an object with the right properties", function() {
      TestEnum.should.be.a("object");

      TestEnum.should.have.property("One");
      TestEnum.One.value.should.eql(0);

      TestEnum.should.have.property("Two");
      TestEnum.Two.value.should.eql(1);

      TestEnum.should.have.property("Three");
      TestEnum.Three.value.should.eql(2);

      TestEnum.should.have.property("Four");
      TestEnum.Four.value.should.eql(3);
    });

    it("should allow you to set values", function() {
      var e = ooj.Enum({
        values: [
          ["One", 1],
          "Two"
        ]
      });

      e.should.have.property("One");
      e.One.value.should.eql(1);
      e.should.have.property("Two");
      e.Two.value.should.eql(2);
    });

    it("should allow you to define functions", function() {
      var e = ooj.Enum({
        values: [
          "Male",
          "Female"
        ],
        functions: {
          heShe: function() {
            if (this.value === 0) {
              return "he";
            } else {
              return "she";
            }
          }
        }
      });

      e.Male.should.have.property("heShe");
      e.Male.heShe.should.be.a("function");
      e.Male.heShe().should.eql("he");

      e.Female.should.have.property("heShe");
      e.Female.heShe.should.be.a("function");
      e.Female.heShe().should.eql("she");
    });
  });

  describe("the 'Interface' function", function() {
    var TestInterface,
        functions = [
          "testOne",
          "testTwo",
          "testThree"
        ];

    before(function() {
      TestInterface = ooj.Interface({
        functions: functions
      });
    });

    it("should return a function", function() {
      TestInterface.should.be.a("function");
    });

    it("should not be able to instantiate a new object", function() {
      instantiate(TestInterface).should.throw();
    });

    it("should contain the given functions", function() {
      for (var i = 0, len = functions.length; i < len; i++) {
        var funk = functions[i];
        TestInterface.prototype.should.have.property(funk);
        TestInterface.prototype[funk].should.be.a("function");
      }
    });
  });

  describe("the 'Class' function", function() {
    var TestClass;

    before(function() {
      TestClass = ooj.Class({
        construct: function(val) {
          this.value = val;
        },
        setValue: function(val) {
          this.value = val;
        },
        getValue: function() {
          return this.value;
        }
      });
    });

    it("should return a function", function() {
      TestClass.should.be.a("function");
    });

    it("should be capable of instantiation", function() {
      (function() {
        var item = new TestClass(10);
      }).should.not.throw();
    });

    it("should use the construct function defined", function() {
      var item = new TestClass(10);
      item.value.should.eql(10);
    });

    it("should be defined as a proper class", function() {
      var item = new TestClass(10);
      item.setValue(18);
      item.getValue().should.eql(18);
    });
  });

  describe("The implement functionality", function() {
    var TestInterface, TestClass;

    before(function() {
      TestInterface = ooj.Interface({
        functions: [
          "hasOne",
          "hasTwo"
        ]
      });
      TestClass = ooj.Class({
        implement: TestInterface,
        hasOne: function() {
          return "defined differently";
        }
      });
    });

    describe("the TestClass", function() {
      it("should have the same functions as the TestInterface", function() {
        var p = TestClass.prototype;
        p.should.have.property("hasOne");
        p.hasOne.should.be.a("function");
        p.should.have.property("hasTwo");
        p.hasTwo.should.be.a("function");
      });

      it("should have it's custom defined testOne function", function() {
        var temp = new TestClass(),
            ret = temp.hasOne();
        ret.should.eql("defined differently");
      });
    });
  });

  describe("The extend functionality", function() {
    var Fruit, Apple;

    before(function() {
      Fruit = ooj.Class({
        construct: function() {
          this.eaten = false;
        },
        eat: function() {
          this.eaten = true;
        },
        hasBeenEaten: function() {
          return this.eaten;
        },
        getName: function() {
          return "Unnamed";
        }
      });
      Apple = ooj.Class({
        extend: Fruit,
        getName: function() {
          return "Apple";
        }
      });
    });

    describe("The Apple class", function() {
      var app;

      before(function() {
        app = new Apple();
      });

      it("should have the same functions as Fruit", function() {
        app.should.have.property("eaten", false);
        app.should.have.property("eat");
        app.eat.should.be.a("function");
        app.should.have.property("hasBeenEaten");
        app.hasBeenEaten.should.be.a("function");
        app.should.have.property("getName");
        app.getName.should.be.a("function");
      });

      it("should function like Fruit", function() {
        app.eat();
        app.hasBeenEaten().should.eql(true);
      });

      it("should have a different getName function", function() {
        app.getName().should.eql("Apple");
      });
    });

    describe("chained inheritance", function() {
      var Edible, Food, IceCream;

      before(function() {
        Edible = ooj.Class({
          construct: function() {
            this.eaten = false;
          },
          eat: function() {
            this.eaten = true;
          }
        });
        Food = ooj.Class({
          extend: Edible,
          construct: function() {
            this.isFood = true;
            this.flavor = "None";
          },
          getFlavor: function() {
            return this.flavor;
          }
        });
        IceCream = ooj.Class({
          extend: Food,
          construct: function() {
            this.flavor = "Sugary Sweet";
          }
        });
      });

      describe("the 'Edible' class", function() {
        it("should work like a normal class", function() {
          instantiate(Edible).should.not.throw();
        });

        it("should be 'edible'", function() {
          var item = new Edible();
          item.eat();
          item.eaten.should.eql(true);
        });
      });

      describe("the 'Food' class", function() {
        it("should work like a normal class", function() {
          instantiate(Food).should.not.throw();
        });

        it("should be 'edible'", function() {
          var item = new Food();
          item.eat();
          item.eaten.should.eql(true);
        });

        it("should have a flavor", function() {
          var item = new Food();
          item.getFlavor().should.eql("None");
        });
      });

      describe("the 'IceCream' class", function() {
        it("should function like a normal class", function() {
          instantiate(IceCream).should.not.throw();
        });

        it("should be 'edible'", function() {
          var item = new IceCream();
          item.eat();
          item.eaten.should.eql(true);
        });

        it("should have a flavor", function() {
          var item = new IceCream();
          item.getFlavor().should.eql("Sugary Sweet");
        });

        it("should have a flavor different from Food", function() {
          var food = new Food(),
              ic = new IceCream();
          food.getFlavor().should.not.eql(ic.getFlavor());
        });
      });
    });

    describe("$super functionality", function() {
      var Animal, Dog;

      before(function() {
        Animal = ooj.Class({
          move: function() {
            return "Moves...";
          },

          toString: function() {
            return "Animal";
          }
        });

        Dog = ooj.Class({
          extend: Animal,
          move: function() {
            return this.$super();
          }
        });
      });

      it("should not interfere with standard usage", function() {
        instantiate(Dog).should.not.throw();
      });

      it("should should allow super class method to be called", function() {
        var d = new Dog();
        d.move().should.eql("Moves...");
      });
    });
  });

  describe("the 'isInstanceOf' function", function() {
    var ClassA, InterfaceA, ClassB, ClassC;

    before(function() {
      ClassA = ooj.Class({
        one: function() {
          return 1;
        }
      });
      InterfaceA = ooj.Interface({
        functions: [
          "two"
        ]
      });
      ClassB = ooj.Class({
        extend: ClassA,
        implement: InterfaceA,
        three: function() {
          return 3;
        }
      });
      ClassC = ooj.Class({
        extend: ClassB,
        four: function() {
          return 4;
        }
      });
    });

    it("should have an isInstanceOf function", function() {
      ClassA.prototype.should.have.property("isInstanceOf");
      ClassA.prototype.isInstanceOf.should.be.a("function");
      InterfaceA.prototype.should.not.have.property("isInstanceOf");
      ClassB.prototype.should.have.property("isInstanceOf");
      ClassB.prototype.isInstanceOf.should.be.a("function");
    });

    it("should determine ClassB extends ClassA", function() {
      var b = new ClassB();
      b.isInstanceOf(ClassA).should.eql(true);
    });

    it("should determine ClassB implements InterfaceA", function() {
      var b = new ClassB();
      b.isInstanceOf(InterfaceA).should.eql(true);
    });

    describe("class C", function() {
      it("should inherit from ClassB", function() {
        var c = new ClassC();
        c.isInstanceOf(ClassB).should.eql(true);
      });

      it("should inherit from the same things as ClassB", function() {
        var c = new ClassC();
        c.isInstanceOf(ClassA).should.eql(true);
        c.isInstanceOf(InterfaceA).should.eql(true);
      });
    });
  });

});