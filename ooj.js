var _ = require("underscore");

// Define errors
var InvalidArgumentError = function(msg) {
  msg = msg || "Invalid arguments given.";
  this.message = msg;
};

InvalidArgumentError.prototype = new Error


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

  Class: function(data) { return data; },

  Interface: function(data) { return data; },

  // Build an Enum object and return it
  Enum: function(data) { 
    var enumObj = {}, names, values, value = 0, i, len;
    if (!(_.isObject(data)))
      throw new InvalidArgumentError("Data must be an object!");
    if (!(_(data).has("names") && _.isArray(data.names)))
      throw new InvalidArgumentError("In order to define an Enum, you must define the \"names\" property as an array.")
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