helpers =
  # Breaks up the name - throws an error if theres nothing, returns an array
  processClassName: (qualifiedName) ->
    if qualifiedName.indexOf '.' >= 0
      name = qualifiedName.split '.'
      throw new "jOOP.define received an empty class name, failed to define class." if name.length is 0
      return name
    else if qualifiedName.length > 0
      return [name]
    else
      return []

  # Create namespaces if they don't exist and return the final scope -
  # Scope being the lowest level namespace.
  processScope: (namespaces, type = jOOP.types.cls) ->
    switch type
      when jOOP.types.cls
        scope = jOOP._classes
      when jOOP.types.itf
        scope = jOOP._interfaces
    if namespaces.length > 0
      for namespace in namespaces
        if not scope[namespace]?
          scope[namespace] = {}
        scope = scope[namespace]
    scope

  # Tests to see if the name given is a valid copyable property, properties not
  # valid for copy are constructor, extends, implements, and abstract
  isCopyableProperty: (property) ->
    switch property
      when 'constructor', 'extend', 'implement', 'abstract', 'type', 'functions'
        false
      else
        true

  # Returns a blank function
  defaultConstructor: ->
    return `(function() {})`

jOOP =
  # Used to store classes - possible going to change to jOOP.namespace.classOrInterface
  _classes: {}
  # A storage for base interfaces so they can't be altered - or attempt to hide them from
  # being altered
  _interfaces: {}
  ###
    The following are types, types of objects that jOOP lets you define
  ###
  types:
    itf: 'interface'
    cls: 'class'
    abs: 'abstract'
    en: 'enum'

  # Contains methods that will be given to the Object.prototype
  objectMethods:
    ###
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
    ###
    instanceOf: (object) ->
      # Return false if the parent doesn't exist
      return false unless @_parent
      # Test to see if the object given is an interface
      if object._interface?
        for func in object._interface.functions
          # functions is an array of name, just see if it exists
          return false unless @[func]?
      else if object.prototype?
        for prop, value of object.prototype
          type = typeof value
          if type is 'function'
            if @[prop]?
              if typeof @[prop] isnt 'function'
                return false
            else
              return false
      else
        return false
      # All ifs succedded, meaning it must be an instance of the object given
      return true
  ###
    Contains defaults for functions and properties created by jOOP
  ###
  defaults:
    unimplemented: ->
      throw new "Unimplemented inherited function, please inherit me."
  ###
    Constructs a new class that matches the given class (if one exists) and forwards
    the arguments given.
  ###
  init: (qualifiedName) ->
    nameArr = helpers.processClassName qualifiedName
    className = nameArr[nameArr.length - 1]
    nameArr.splice nameArr.length - 1, 1
    scope = helpers.processScope nameArr
    if scope[className]._interface? or scope[className]._abstract
      throw new "Interfaces and Abstract classes cannot be instantiated!"
    if scope[className]? and typeof scope[className] is 'function'
      args = []
      for i in [1...arguments.length]
        args.push arguments[i]
      tempCls = `function() {}`
      tempCls.prototype = scope[className].prototype
      tempObj = new tempCls()
      #tempObj.constructor = scope[className].constructor
      scope[className].apply tempObj, args
      return tempObj
    null
  ###
    Define and build a function.

    Mixed params:
      String qualified Class name, object definition
      object definition
  ###
  define: (qualifiedName, type = null, definition = null) ->
    if typeof qualifiedName is 'object'
      definition = qualifiedName
      if definition.name?
        qualifiedName = definition.name
      else
        throw new "No name given for the class definition, cannot define anonymous classes"
      if not type?
        if definition.type?
          type = definition.type
        else
          throw new "jOOP cannot read your mind and guess what type of object you want to define!"
    switch type
      when @types.cls then @cls qualifiedName, definition
      when @types.itf then @itf qualifiedName, definition
      else
        throw new "Invalid type given, jOOP doesn't konw how to define type #{type}"

  # Handles defnintion of a single class
  cls: (qualifiedName, definition = null) ->
    scope = null
    className = null
    if typeof qualifiedName is 'string'
        name = helpers.processClassName qualifiedName
        className = name[name.length - 1];
        name.splice name.length - 1, 1
        scope = helpers.processScope name
    else if typeof qualifiedName is 'object'
      definition = qualifiedName
      qualifiedName = null
      if definition.name? and typeof definition.name is 'string'
        qualifiedName = definition.name
        name = helpers.processClassName defintion.name
        className = name[name.length - 1]
        name.splice name.length - 1, 1
        scope = helpers.processScope name
      else
        throw new "Error: no name given in the definition, jOOP cannot create anonymous classes!"
    scope[className] = definition.constructor or helpers.defaultConstructor
    scope[className].prototype = {}
    proto = scope[className].prototype
    proto._className =
      full: qualifiedName
      simple: className
    for member, def of definition
      if helpers.isCopyableProperty member
        proto[member] = def
    if definition.extend? and typeof definition.extend is 'string'
      extendedName = helpers.process definition.extend
      extendedClass = extendedName[extendedName.length - 1]
      extendedName.splice extendedName.length - 1, 1
      extendedScope = helpers.processScope extendedName
      if extendedScope[extendedClass]?
        proto._parent = extendedScope[extendedClass]
        for member, def of extendedScope[extendedClass].prototype
          if helpers.isCopyableProperty member
            proto[member] = def
          else if member is 'abstract'
            for absFunc in def
              proto[absFunc] = @defaults.unimplemented

    return scope[className]
  ###
    Define an interface

    Mixed params:
      String qualified class name, object definition
      object definition
  ###
  itf: (qualifiedName, definition = null) ->
    scope = null
    className = null
    if typeof qualifiedName is 'string'
      nameArr = helpers.processClassName qualifiedName
      className = nameArr[nameArr.length - 1]
      nameArr.splice nameArr.length - 1, 1
      scope = helpers.processScope nameArr
    else if typeof qualifiedName is 'object'
      definition = qualifiedName
      qualifiedName = null
      if definition.name? and typeof definition.name is 'string'
        qualifiedName = definition.name
        name = helpers.processProcessClassName definition.name
        className = name[name.length - 1]
        name.splice name.length - 1, 1
        scope = helpers.processScope name, @types.itf
      else
        throw new "Error: no name given in the definition, jOOP cannot create anonymous classes!"
    if definition.functions?
      if not defintion.functions instanceof Array
        defintion.functions = [definition.functions]
      scope[className] = new Object
      scope[className].functions = functions
    else
      throw new "Do you want to define functions for this interface? No 'functions' definition found."

@jOOP = jOOP
