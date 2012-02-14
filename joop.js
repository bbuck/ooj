(function() {
  var helpers, jOOP;

  helpers = {
    processClassName: function(qualifiedName) {
      var name;
      if (qualifiedName.indexOf('.' >= 0)) {
        name = qualifiedName.split('.');
        if (name.length === 0) {
          throw new "jOOP.define received an empty class name, failed to define class.";
        }
        return name;
      } else if (qualifiedName.length > 0) {
        return [name];
      } else {
        return [];
      }
    },
    processScope: function(namespaces, type) {
      var namespace, scope, _i, _len;
      if (type == null) type = jOOP.types.cls;
      switch (type) {
        case jOOP.types.cls:
          scope = jOOP._classes;
          break;
        case jOOP.types.itf:
          scope = jOOP._interfaces;
      }
      if (namespaces.length > 0) {
        for (_i = 0, _len = namespaces.length; _i < _len; _i++) {
          namespace = namespaces[_i];
          if (!(scope[namespace] != null)) scope[namespace] = {};
          scope = scope[namespace];
        }
      }
      return scope;
    },
    isCopyableProperty: function(property) {
      switch (property) {
        case 'constructor':
        case 'extend':
        case 'implement':
        case 'abstract':
        case 'type':
        case 'functions':
          return false;
        default:
          return true;
      }
    },
    implementItfs: function(proto, itfs) {
      var implFunc, intClass, intName, intScope, interfce, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = itfs.length; _i < _len; _i++) {
        interfce = itfs[_i];
        intName = helpers.processClassName(interfce);
        intClass = intName[intName.length - 1];
        intName.splice(intName - 1, 1);
        intScope = helpers.processScope(intName, jOOP.types.itf);
        if (intScope[intClass] != null) {
          _results.push((function() {
            var _j, _len2, _ref, _results2;
            _ref = intScope[intClass].functions;
            _results2 = [];
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              implFunc = _ref[_j];
              _results2.push(proto[implFunc] = jOOP.defaults.unimplemented);
            }
            return _results2;
          })());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    extendAbs: function(proto, abs) {
      var absFunc, absName, className, def, member, scope, _ref, _results;
      absName = this.processClassName(absClass);
      className = absName[absName.length - 1];
      absName.splice(absName.length - 1, 1);
      scope = this.processScope(absName, jOOP.types.abs);
      if (scope[className] != null) {
        _ref = scope[className];
        _results = [];
        for (member in _ref) {
          def = _ref[member];
          if (this.isCopyableProperty(member)) {
            _results.push(proto[member] = def);
          } else if (member === 'abstract') {
            _results.push((function() {
              var _i, _len, _results2;
              _results2 = [];
              for (_i = 0, _len = def.length; _i < _len; _i++) {
                absFunc = def[_i];
                _results2.push(proto[absFunc] = jOOP.defaults.unimplemented);
              }
              return _results2;
            })());
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    extendCls: function(proto, extendedCls) {
      var def, extendedClass, extendedName, extendedScope, member, _ref, _results;
      extendedName = helpers.processClassName(extendedCls);
      extendedClass = extendedName[extendedName.length - 1];
      extendedName.splice(extendedName.length - 1, 1);
      extendedScope = helpers.processScope(extendedName);
      if (extendedScope[extendedClass] != null) {
        proto._parent = extendedScope[extendedClass];
        _ref = extendedScope[extendedClass].prototype;
        _results = [];
        for (member in _ref) {
          def = _ref[member];
          if (helpers.isCopyableProperty(member)) {
            _results.push(proto[member] = def);
          } else if (member === 'extend') {
            _results.push(this.extendAbs(def));
          } else if (member === 'implements') {
            _results.push(this.implementItfs(proto, def));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    defaultConstructor: function() {
      return (function() {});
    }
  };

  jOOP = {
    _classes: {},
    _interfaces: {},
    /*
        The following are types, types of objects that jOOP lets you define
    */
    types: {
      itf: 'interface',
      cls: 'class',
      abs: 'abstract',
      en: 'enum'
    },
    objectMethods: {
      /*
            This method does not test functionality or data, it tests types, but only functions.
            If a class contains all the functions of it's parent class (and by contains I mean it
            has a property of the same name and it's a function as well) then it will be considered
            an instanceof the Object given. This function compares prototypes, so anonymous objects
            will not be compared.
      
            Correct usage of this function is:
      
                myObject.instanceOf(AnInterface);
      
            For example:
      
              // Interface Fruit, child class Apple
              myApple = new Apple();
              assert(myApple.instanceOf(Fruit));
      */
      instanceOf: function(object) {
        var func, prop, type, value, _i, _len, _ref, _ref2;
        if (!this._parent) return false;
        if (object._interface != null) {
          _ref = object._interface.functions;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            func = _ref[_i];
            if (this[func] == null) return false;
          }
        } else if (object.prototype != null) {
          _ref2 = object.prototype;
          for (prop in _ref2) {
            value = _ref2[prop];
            type = typeof value;
            if (type === 'function') {
              if (this[prop] != null) {
                if (typeof this[prop] !== 'function') return false;
              } else {
                return false;
              }
            }
          }
        } else {
          return false;
        }
        return true;
      }
    },
    /*
        Contains defaults for functions and properties created by jOOP
    */
    defaults: {
      unimplemented: function() {
        throw new "Unimplemented inherited function, please inherit me.";
      }
    },
    /*
        Constructs a new class that matches the given class (if one exists) and forwards
        the arguments given.
    */
    init: function(qualifiedName) {
      var args, className, i, nameArr, scope, tempCls, tempObj, _ref;
      nameArr = helpers.processClassName(qualifiedName);
      className = nameArr[nameArr.length - 1];
      nameArr.splice(nameArr.length - 1, 1);
      scope = helpers.processScope(nameArr);
      if ((scope[className]._interface != null) || scope[className]._abstract) {
        throw new "Interfaces and Abstract classes cannot be instantiated!";
      }
      if ((scope[className] != null) && typeof scope[className] === 'function') {
        args = [];
        for (i = 1, _ref = arguments.length; 1 <= _ref ? i < _ref : i > _ref; 1 <= _ref ? i++ : i--) {
          args.push(arguments[i]);
        }
        tempCls = function() {};
        tempCls.prototype = scope[className].prototype;
        tempObj = new tempCls();
        scope[className].apply(tempObj, args);
        return tempObj;
      }
      return null;
    },
    /*
        Define and build a function.
    
        Mixed params:
          String qualified Class name, object definition
          object definition
    */
    define: function(qualifiedName, type, definition) {
      if (type == null) type = null;
      if (definition == null) definition = null;
      if (typeof qualifiedName === 'object') {
        definition = qualifiedName;
        if (definition.name != null) {
          qualifiedName = definition.name;
        } else {
          throw new "No name given for the class definition, cannot define anonymous classes";
        }
        if (!(type != null)) {
          if (definition.type != null) {
            type = definition.type;
          } else {
            throw new "jOOP cannot read your mind and guess what type of object you want to define!";
          }
        }
      }
      switch (type) {
        case this.types.cls:
          return this.cls(qualifiedName, definition);
        case this.types.itf:
          return this.itf(qualifiedName, definition);
        default:
          throw new ("Invalid type given, jOOP doesn't konw how to define type " + type);
      }
    },
    cls: function(qualifiedName, definition) {
      var className, def, member, name, proto, scope;
      if (definition == null) definition = null;
      scope = null;
      className = null;
      if (typeof qualifiedName === 'string') {
        name = helpers.processClassName(qualifiedName);
        className = name[name.length - 1];
        name.splice(name.length - 1, 1);
        scope = helpers.processScope(name);
      } else if (typeof qualifiedName === 'object') {
        definition = qualifiedName;
        qualifiedName = null;
        if ((definition.name != null) && typeof definition.name === 'string') {
          qualifiedName = definition.name;
          name = helpers.processClassName(defintion.name);
          className = name[name.length - 1];
          name.splice(name.length - 1, 1);
          scope = helpers.processScope(name);
        } else {
          throw new "Error: no name given in the definition, jOOP cannot create anonymous classes!";
        }
      }
      scope[className] = definition.constructor || helpers.defaultConstructor;
      scope[className].prototype = {};
      proto = scope[className].prototype;
      proto._className = {
        full: qualifiedName,
        simple: className
      };
      if ((definition.extend != null) && typeof definition.extend === 'string') {
        helpers.extendCls(definition.extend);
      }
      for (member in definition) {
        def = definition[member];
        if (helpers.isCopyableProperty(member)) proto[member] = def;
      }
      return scope[className];
    },
    /*
        Define an interface
    
        Mixed params:
          String qualified class name, object definition
          object definition
    */
    itf: function(qualifiedName, definition) {
      var className, name, nameArr, scope;
      if (definition == null) definition = null;
      scope = null;
      className = null;
      if (typeof qualifiedName === 'string') {
        nameArr = helpers.processClassName(qualifiedName);
        className = nameArr[nameArr.length - 1];
        nameArr.splice(nameArr.length - 1, 1);
        scope = helpers.processScope(nameArr);
      } else if (typeof qualifiedName === 'object') {
        definition = qualifiedName;
        qualifiedName = null;
        if ((definition.name != null) && typeof definition.name === 'string') {
          qualifiedName = definition.name;
          name = helpers.processProcessClassName(definition.name);
          className = name[name.length - 1];
          name.splice(name.length - 1, 1);
          scope = helpers.processScope(name, this.types.itf);
        } else {
          throw new "Error: no name given in the definition, jOOP cannot create anonymous classes!";
        }
      }
      if (definition.functions != null) {
        if (!defintion.functions instanceof Array) {
          defintion.functions = [definition.functions];
        }
        scope[className] = new Object;
        return scope[className].functions = functions;
      } else {
        throw new "Do you want to define functions for this interface? No 'functions' definition found.";
      }
    }
  };

  this.jOOP = jOOP;

}).call(this);
