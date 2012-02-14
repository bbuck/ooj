(function() {
  var Types, appleDef, fruitDef, jOOP, test;

  jOOP = require("./joop").jOOP;

  Types = jOOP.types;

  fruitDef = {
    name: 'Extensions.Fruits.Fruit',
    type: Types.itf,
    functions: ["eat", "isEaten"]
  };

  appleDef = {
    constructor: function(name) {
      return this.name = name;
    },
    name: 'None',
    hi: function() {
      return "" + this.name + " says hello!";
    }
  };

  jOOP.define("Extension.Fruits.Apple", Types.cls, appleDef);

  test = jOOP.init("Extension.Fruits.Apple", "Howard");

  console.log(test);

  console.log('name: ' + test.name);

  console.log('full: ' + test._className.full);

  console.log('simple: ' + test._className.simple);

  console.log('Hi: ' + test.hi());

}).call(this);
