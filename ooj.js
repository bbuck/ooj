(function() {
  // Define errors
  function InvalidArgumentError(msg) {
    this.name = "InvalidArgumentError";
    this.message = msg || "Invalid arguments given.";
  }

  InvalidArgumentError.prototype = Error.prototype;

  function InterfacesCannotBeInstantiatedError(msg) {
    this.name = "InterfacesCannotBeInstantiatedError";
    this.message = msg || "Interfaces cannot be instantiated. They must be implemented.";
  }

  InterfacesCannotBeInstantiatedError.prototype = Error.prototype;

  function CannotExtendMultipleClasses(msg) {
    this.name = "CannotExtendMultipleClasses";
    this.message = msg || "Cannot extend multiple classes, only one.";;
  }

  CannotExtendMultipleClasses.prototype = Error.prototype;

  // Helper functions

  function defineOoj(_) {
    var exists, implementInterfaces, extendClass, methodWithSuper,
        generateIsInstanceOf, createEnumClassObject, ooj;

    // Test if value exists
    exists = function(val) {
      return !(_.isNull(val)) && !(_.isUndefined(val))
    };

    // Implement the given interfaces
    implementInterfaces = function(obj, impls) {
      if (!exists(impls)) {
        return obj;
      }
      if (!(_.isArray(impls))) {
        impls = [impls];
      }
      var proto = obj.prototype,
          iproto, _impl, prop;
      impls.forEach(function(impl) {
        if (impl._ooj_interface) {
          _impl = _(impl);
          iproto = impl.prototype;
          for (prop in iproto) {
            if (_.isFunction(iproto[prop]) && !exists(proto[prop])) {
              proto[prop] = function() {};
            }
          }
        }
      });

      return obj;
    };

    // Extend the object with the given object
    extendClass = function(obj, _super) {
      if (!(exists(_super))) {
        return obj;
      }
      if (_.isArray(_super)) {
        throw new CannotExtendMultipleClasses();
      }
      var self, oldProto, prop, proto, sproto;

      oldProto = obj.prototype;
      self = obj;
      sproto = _super.prototype;
      obj = function() {
        _super.apply(this, arguments);
        self.apply(this, arguments);
      };
      proto = obj.prototype = oldProto;
      for (prop in sproto) {
        if (!exists(proto[prop])) {
          proto[prop] = sproto[prop];
        } else if (_.isFunction(sproto[prop]) && _.isFunction(proto[prop])) {
          proto[prop] = methodWithSuper(proto[prop], sproto[prop]);
        }
      }

      return obj;
    };

    // Based on John Resig's sample: http://ejohn.org/blog/simple-javascript-inheritance/
    methodWithSuper = function(fn, parentFn) {
      return function() {
        var ret, self = this;

        this.$super = function() {
          return parentFn.apply(self, arguments);
        };
        ret = fn.apply(this, arguments);
        this.$super = undefined;

        return ret;
      };
    };

    // Generate an isInstanceOf function
    generateIsInstanceOf = function(list) {
      return function(_parent) {
        var i, len, _super;
        for (i = 0, len = list.length; i < len; i++) {
          _super = list[i];
          if (_parent === _super) {
            return true;
          } else if (exists(_super.prototype.isInstanceOf)) {
            var is = _super.prototype.isInstanceOf.call(this, _parent);
            if (is) {
              return true;
            }
          }
        }
        return false;
      };
    };

    // Generate class for enum values
    createEnumClassObject = function(funks) {
      var cls, proto, funkName, funk;
      cls = function(value) {
        this.value = value;
      };
      proto = cls.prototype;
      if (exists(funks) && _.isObject(funks)) {
        for (funkName in funks) {
          funk = funks[funkName];
          proto[funkName] = funk;
        }
      }

      return cls;
    };

    // OOJ object
    ooj = {
      define: function(type, obj) {
        switch (type.toLowerCase()) {
          case "class":
            return ooj.Class(obj);
          case "interface":
            return ooj.Interface(obj);
          case "enum":
            return ooj.Enum(obj);
          default:
            throw new InvliadArgumentError(["Invalid type given, \"", type, "\" is not a valid type."].join(""));
        }
      },

      // construct, extend, implement
      /**
       * Returns a JavaScript function that should function as a class defined
       * by the given data object.
       * @param {object} data Object defining the class that should be returned.
       *                      This object can contain the specific values
       *                      'construct' {function} which will become the class's
       *                      constructor function, 'extend' {function, array}
       *                      which passes another function to extend the prototype
       *                      from, 'implement' {function, array} passing ooj.Interface
       *                      functions that will guarantee method existence. All
       *                      other keys are used as method names for the prototype.
       */
      Class: function(data) {
        var cls, proto, prop, parents;

        if (!(_.isObject(data))) {
          throw new InvalidArgumentError("Data must be an object");
        }
        if (_(data).has("construct") && _.isFunction(data.construct)) {
          cls = data.construct;
        } else {
          cls = function() {};
        }
        proto = cls.prototype;
        for (prop in data) {
          if (prop !== "construct" && prop !== "extend" && prop !== "implement") {
            (function(property, value) {
              proto[property] = value;
            })(prop, data[prop]);
          }
        }
        cls = implementInterfaces(cls, data.implement);
        cls = extendClass(cls, data.extend);
        parents = _.compact(_.flatten([data.extend, data.implement]));
        proto.isInstanceOf = generateIsInstanceOf(parents);
        cls.isAssignableFrom = generateIsInstanceOf(parents);

        return cls;
      },

      /**
       * Return a simple JavaScript function that operates a class with stubbed
       * functions that were passed as the required names. This is to simulate
       * the interfaces of standard Object Oriented languages.
       * @param {object} data Object defining the functions the interface object
       *                      should have defined when returned. The 'functions'
       *                      {object} key is required.
      */
      Interface: function(data) {
        var intFunk, proto, funkName;

        if (!(_.isObject(data))) {
          throw new InavlidArgumentError("Data must be an object");
        }
        if (!(_(data).has("functions") && _.isArray(data.functions))) {
          throw new InvalidArgumentError("In order to define an Interface, you must define the \"functions\" property as an array");
        }
        intFunk = function() {
          throw new InterfacesCannotBeInstantiatedError();
        };
        proto = intFunk.prototype;
        data.functions.forEach(function(funkName) {
          proto[funkName] = function() {};
        });
        intFunk._ooj_interface = true;

        return intFunk;
      },

      /**
       * Returns a JavaScript object with keys equal to the named values given
       * as enum values, where each of the named values is a class that has at
       * least a value property and the functions passed along with it.
       * @param {object} data Object describing the expected Enum. This object
       *                 must have a 'values' {array} property and optionally
       *                 contain a 'functions' {object} property.
       */
      Enum: function(data) {
        var enumObj = {}, enumClass, values, currentValue = 0;

        if (!(_.isObject(data))) {
          throw new InvalidArgumentError("Data must be an object!");
        }
        if (!(_(data).has("values") && _.isArray(data.values))) {
          throw new InvalidArgumentError("In order to define an Enum, you must define the \"values\" property as an array.");
        }
        enumClass = createEnumClassObject(data.functions);
        values = data.values;
        values.forEach(function(item) {
          var name, value;
          if (_.isArray(item)) {
            name = item[0],
            value = item[1];
            if (_.isNumber(value)) {
              currentValue = value + 1;
            }
          } else {
            name = item;
            value = currentValue++;
          }
          enumObj[name] = new enumClass(value);
        });

        return enumObj;
      }
    };

    return ooj;
  }

  var windowDefined = typeof(window) !== "undefined" && window != null,
      requireDefined = typeof(require) !== "undefined" && require != null
                        && typeof(require) === "function",
      isBrowser = windowDefined && typeof(window.location) !== "undefined",
      hasRequire = isBrowser && requireDefined;

  // Require JS
  if (hasRequire) {
    require("ooj", ["underscore"], defineOoj);
  // Standard browser
  } else if (isBrowser) {
    window.ooj = defineOoj(window._);
  // Node - Common JS
  } else {
    module.exports = defineOoj(require("underscore"));
  }
})();