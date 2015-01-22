# Object Oriented JavaScript

**OOJ** is a JavaScript library designed to combine Object Oriented helpers in JavaScript in a
single library. Using **OOJ** you can create an **Enum**, **Interface** and **Class** by defining
objects and calling the necessary functions.

## Creating Enum Objects

In order to create an Enum object you must define a `values` property as an array of names or name-value pairs.

Defining a simple Enum is... well simple!

```javascript
var Gender = ooj.Enum({
  values: [
    "Male",
    "Female"
  ]
});

// From here, you can use the Enum
var user = {
  gender: Gender.Male
};
if (user.gender === Gender.Male) {
  console.log("True");
}
```

By default, each name is assigned a value starting at 0 unless values are specified. Specify values by passing an array as the member in the values key.

```javascript
var Gender = ooj.Enum({
  values: [
    ["Male", 10],
    ["Female", 20]
  ]
});

// From here, you can use the Enum
if (Gender.Male.value === 10) {
  console.log("True");
}
```

Values can be set to start a sequence, and if the value is a number it will continue from that point, but values can be set to any type necessary - although the last number in the numeric sequence will be used for all enumerated values without an explicit value.

```javascript
var Sample = ooj.Enum({
  values: [
    ["One", 1],
    ["Five", 5],
    "Six",
    ["Ten", 10],
    ["DefaultName", "Peter Programmer"]
  ]
});

if (Sample.Six.value === 6) {
  console.log("This is completely true");
}
```

You can define functions on enum objects, allowing for more useful and dynamic enum objects. After all, if this wasn't the case then an enum would be nothing more than a plain JavaScript object.

```javascript
var Gender = ooj.Enum({
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

if (Gender.Male.heShe() === "he" && Gender.Female.heShe() === "she") {
  console.log("True again.");
}
```

## Creating Interfaces

An Interface made by OOJ is simply a JavaScript class with empty functions and a constructor function that throws an error when the Interface is instantiated. Interfaces can be implemented by OOJ Classes. Interfaces are extremely easy to define, assuming you want create an object that has an area function, like a Shape:

```javascript
var Shape = ooj.Interface({
  functions: [
    "area"
  ]
});
```

An OOJ Interface is defined by simply specifying the functions that are present on the Interface.

**Note:** OOJ interfaces, like interfaces from a standard Object Oriented language cannot be instantiated.

```javascript
var s = new Shape();
// InterfacesCannotBeInstantiatedError: Interfaces cannot be instantiated. They must be implemented.
```

## Creating Classes

An OOJ Class isn't much different from a standard JavaScript class but with a simpler and more strightforward declaration syntax. Defining a simple class is just like defining a JavaScript object.

```javascript
var Simple = ooj.Class({
  hello: function() {
    console.log("Hello, World");
  }
});

// Use the class
var test = new Simple();
test.hello();
// "Hello, World"
```

In order to define a constructor function for OOJ Classes you define a function called `construct` on the object given to the call to ooj.Class. There are two other special properties for OOJ Classes, `extend` and `implement` properties are used to create Classes that receive functionality from other Classes.

The `extend` property is used to to extend the functionality of a single class, while the `implement` property is used to implement functions from one or more interfaces. The relationships created by these properties can be tested for with a function on each OOJ Class instance, `isInstanceOf`.

```javascript
var Fruit = ooj.Interface({
  functions: [
    "eat",
    "isFruit"
  ]
});

var Apple = ooj.Class({
  implement: Fruit,
  construct: function() {
    this.eaten = false;
  },
  eat: function() {
    this.eaten = true;
  },
  isFruit: function() {
    return true;
  }
});

var test = new Apple();
console.log(test.isInstanceOf(Fruit));
// true
```

A class can implement one or more interfaces as needed, you can either pass an interface or an array of interfaces via the `implement` property such as: `implement: Fruit` or `implement: [Fruit, Edible]` depending on the needs of the class.

OOJ classes that extend parent classes use a special property on the current instance called `$super` that you shouldn't assign or use yourself. This special property will allow you to call your superclass method from the child class method.

```javascript
var One = ooj.Class({
  value: function() {
    return 1;
  }
});
new One().value(); // => 1

var Two = ooj.Class({
  extend: One,

  value: function() {
    return this.$super() + 1;
  }
});
new Two().value(); // => 2

var Three = ooj.Class({
  extend: Two,

  value: function() {
    return this.$super() + 1;
  }
});
new Three().value(); // => 3
```

This magical `$super` function is only available in methods that override a parent class method of the same name, and should equal `undefined` in all other methods.

OOJ Classes also support static methods (which can be inherited). Unlike instance methods, class methods do not feature the `this.$super` parent version to call into so if static functions share functionality then it must be reimplemented (unfortunately :/ I'm searching for a solution to this).

```javascript
var MyObject = ooj.Class({
  statics: {
    identity: function(value) {
      return value;
    }
  }
});

// Now you can call the static method like this
MyObject.identity(10); // => 10

// And they can be inherited.
var MyOtherObject = ooj.Class({
  extend: MyObject
});

MyOtherObject.identity("one"); // => "one"
```