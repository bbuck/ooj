var _ = require("underscore");

// Define errors
var InvalidArgumentError = function(msg) {
  msg = msg || "Invalid arguments given.";
  this.message = msg;
};

InvalidArgumentError.prototype = new Error();

var InterfacesCannotBeInstantiatedError = function(msg) {
  msg = msg || "Interfaces cannot be instantiated. They must be extended.";
  this.message = msg;
};

InterfacesCannotBeInstantiatedError.prototype = new Error();

// OOJ object
var ooj = {
  define: function(type, obj) {
    type = type.toLowerCase();
    switch (type) {
      case "class":
        return this.Class(obj);
      case "interface":
        return this.Interface(obj);
      case "enum":
        return this.Enum(obj);
      default:
        throw new InvliadArgumentError("Invalid type given, \"" + type + "\" is not a valid type.");
    }
  },

  // Build a class object
  // construct, extend, implement
  Class: function(data) { 
    var clsObj, proto, construct, extend, implement, prop, i, len;
    if (!(_.isObject(data)))
      throw new InvalidArgumentError("Data must be an object");
    if (_(data).has("construct") && _.isFunction(data.construct))
      clsObj = data.construct;
    else
      clsObj = function() {};
    proto = clsObj.prototype;
    for (prop in data) {
      if (prop !== "construct" && prop !== "extend" && prop !== "implement") {
        (function(property, value) {
          proto[property] = value;
        })(prop, data[prop]);
      }
    }
    return clsObj;
  },

  // Build an interface class
  // extend, implement, functions
  Interface: function(data) { 
    var intObj, proto, functions, extend, implement, funkName, i, len;
    if (!(_.isObject(data)))
      throw new InvalidArgumentError("Data must be an object");
    if (!(_(data).has("functions") && _.isArray(data.functions)))
      throw new InvalidArgumentError("In order to define an Interface, you must define the \"functions\" property as an array.");
    intObj = function() {
      throw new InterfacesCannotBeInstantiatedError();
    };
    proto = intObj.prototype;
    functions = data.functions;
    // Handle extend, implement
    for (i = 0, len = functions.length; i < len; i++) {
      funkName = functions[i];
      proto[funkName] = function() {};
    }
    return intObj;
  },

  // Build an Enum object and return it
  // names
  Enum: function(data) { 
    var enumObj = {}, names, values, value = 0, i, len;
    if (!(_.isObject(data)))
      throw new InvalidArgumentError("Data must be an object!");
    if (!(_(data).has("names") && _.isArray(data.names)))
      throw new InvalidArgumentError("In order to define an Enum, you must define the \"names\" property as an array.");
    names = data.names;
    values = data.values || [];
    for (i = 0, len = names.length; i < len; i++) {
      var name = names[i],
          curValue = values[i];
      if (!!curValue) {
        enumObj[name] = curValue;
        if (_.isNumber(curValue))
          value = curValue + 1;
      }
      else {
        enumObj[name] = value;
        value++;
      }
    }
    return enumObj;
  }
};

module.exports = ooj;