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

  function defineOoj() {
    var isNull, isUndefined, isNumber, isArray, isFunction, isObject, keys,
        compact, has, each;
    var exists, implementInterfaces, extendClass, methodWithSuper,
        generateIsInstanceOf, createEnumClassObject, ooj;

    isNumber = function(item) {
      return Object.prototype.toString.call(item) === "[object Number]";
    };

    has = function(obj, key) {
      return obj !== null && obj.hasOwnProperty(key);
    };

    each = function(arr, fn) {
      if (Array.prototype.forEach) {
        arr.forEach(fn);
      } else {
        var i, len;
        for (i = 0, len = arr.length; i < len; ++i) {
          fn(arr[i]);
        }
      }
    };

    keys = function(obj) {
      var output = [], key;
      for (key in obj) {
        // Filter on unique keys
        if (has(obj, key)) {
          output.push(key);
        }
      }

      return output;
    };

    compact = function(arr) {
      var output = [], i, len;
      if (isArray(arr)) {
        for (i = 0, len = arr.length; i < len; ++i) {
          if (arr[i]) {
            output.push(arr[i]);
          }
        }
      }

      return output;
    };

    isObject = function(obj) {
      var type = typeof obj;
      return type === "object" || type === "function" && !!obj;
    };

    isFunction = function(funk) {
      return typeof funk === "function";
    };

    isNull = function(item) {
      return item === null;
    };

    isUndefined = function(item) {
      return typeof item === "undefined";
    };

    isArray = Array.isArray || function(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };

    // Test if value exists
    exists = function(val) {
      return !(isNull(val)) && !(isUndefined(val))
    };

    // Implement the given interfaces
    implementInterfaces = function(obj, impls) {
      if (!exists(impls)) {
        return obj;
      }
      if (!(isArray(impls))) {
        impls = [impls];
      }
      var proto = obj.prototype,
          iproto, _impl, prop;
      each(impls, function(impl) {
        if (impl._ooj_interface) {
          iproto = impl.prototype;
          for (prop in iproto) {
            if (isFunction(iproto[prop]) && !exists(proto[prop])) {
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
      if (isArray(_super)) {
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
        } else if (isFunction(sproto[prop]) && isFunction(proto[prop])) {
          proto[prop] = methodWithSuper(proto[prop], sproto[prop]);
        }
      }
      if (has(_super, "__statics") && _super.__statics) {
        each(_super.__statics, function(prop) {
          if (!exists(obj[prop])) {
            obj[prop] = _super[prop];
          }
        });
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
      if (exists(funks) && isObject(funks)) {
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
        var cons, cls, proto, prop, parents;

        if (!(isObject(data))) {
          throw new InvalidArgumentError("Data must be an object");
        }
        if (has(data, "construct") && isFunction(data.construct)) {
          cls = data.construct;
        } else {
          cls = function() {};
        }
        proto = cls.prototype;
        for (prop in data) {
          if ("construct extend implement statics".indexOf(prop) < 0) {
            (function(property, value) {
              proto[property] = value;
            })(prop, data[prop]);
          }
        }
        if (has(data, "statics") && isObject(data.statics)) {
          for (prop in data.statics) {
            (function(property, value) {
              cls[property] = value;
            })(prop, data.statics[prop]);
          }
          cls.__statics = keys(data.statics);
        }
        cls = implementInterfaces(cls, data.implement);
        cls = extendClass(cls, data.extend);
        parents = compact([].concat(data.extend).concat(data.implement));
        proto.isInstanceOf = cls.isAssignableFrom = generateIsInstanceOf(parents);
        proto.getClass = function() { return cls; };
        proto.constructor = cls;

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
        if (!(isObject(data))) {
          throw new InavlidArgumentError("Data must be an object");
        }
        if (!(has(data, "functions") && isArray(data.functions))) {
          throw new InvalidArgumentError("In order to define an Interface, you must define the \"functions\" property as an array");
        }
        intFunk = function() {
          throw new InterfacesCannotBeInstantiatedError();
        };
        proto = intFunk.prototype;
        each(data.functions, function(funkName) {
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

        if (!isObject(data)) {
          throw new InvalidArgumentError("Data must be an object!");
        }
        if (!(has(data, "values") && isArray(data.values))) {
          throw new InvalidArgumentError("In order to define an Enum, you must define the \"values\" property as an array.");
        }
        enumClass = createEnumClassObject(data.functions);
        values = data.values;
        each(values, function(item) {
          var name, value;
          if (isArray(item)) {
            name = item[0],
            value = item[1];
            if (isNumber(value)) {
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

  var windowDefined = typeof window !== "undefined" && window != null,
      requireDefined = typeof require !== "undefined" && require != null
                        && typeof require === "function",
      isBrowser = windowDefined && typeof window.location !== "undefined",
      hasRequire = isBrowser && requireDefined;

  // Require JS
  if (hasRequire) {
    require("ooj", defineOoj);
  // Standard browser
  } else if (isBrowser) {
    window.ooj = defineOoj();
  // Node - Common JS
  } else {
    module.exports = defineOoj();
  }
})();