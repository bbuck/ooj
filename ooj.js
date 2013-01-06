var _ = require("underscore");

// Define errors
function InvalidArgumentError(msg) {
  msg = msg || "Invalid arguments given.";
  this.message = msg;
}

InvalidArgumentError.prototype = new Error();

function InterfacesCannotBeInstantiatedError(msg) {
  msg = msg || "Interfaces cannot be instantiated. They must be extended.";
  this.message = msg;
}

InterfacesCannotBeInstantiatedError.prototype = new Error();

function CannotExtendMultipleClasses(msg) {
  msg = msg || "Cannot extend multiple classes, only one.";
  this.message = msg;
}

CannotExtendMultipleClasses.prototype = new Error();

// Helper functions

// Test if value exists
function exists(val) {
  return !(_.isNull(val)) && !(_.isUndefined(val))
}

// Implement the given interfaces
function implementInterfaces(obj, impl) {
  if (!exists(impl))
    return obj;
  if (!(_.isArray(impl)))
    impl = [impl];
  var proto = obj.prototype,
      iproto, i, len, prop;
  for (i = 0, len = impl.length; i < len; i++) {
    if (impl[i].__interface) {
      iproto = impl[i].prototype;
      for (prop in iproto) {
        if (_.isFunction(iproto[prop]) && !exists(proto[prop]))
          proto[prop] = function() {};
      }
    }
  }
  return obj;
}

// Extend the object with the given object
function extendClass(obj, _super) {
  if (!(exists(_super)) || _.isArray(_super))
    return obj;
  var self, oldProto, prop, proto, sproto;
  oldProto = obj.prototype;
  self = obj;
  self.prototype = {};
  sproto = _super.prototype;
  obj = function() {
    _super.apply(this, arguments);
    self.apply(this, arguments);
  };
  obj.prototype = oldProto;
  proto = obj.prototype;
  for (prop in sproto) {
    if (!exists(proto[prop]))
      proto[prop] = sproto[prop];
  }
  return obj;
}

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
    var clsObj, proto, prop, i, len;
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
    clsObj = implementInterfaces(clsObj, data.implement);
    clsObj = extendClass(clsObj, data.extend);
    return clsObj;
  },

  // Build an interface class
  // functions
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
    for (i = 0, len = functions.length; i < len; i++) {
      funkName = functions[i];
      proto[funkName] = function() {};
    }
    intObj.__interface = true;
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