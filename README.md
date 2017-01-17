# Object Oriented JavaScript

**OOJ** is a JavaScript library designed to combine Object Oriented helpers in JavaScript in a
single library. Using **OOJ** you can create an **Enum**, **Interface** and **Class** by defining
objects and calling the necessary functions.

**OOJ is currently defunct, with the onset of ES6 standards for classes and [Babel](http://babeljs.io/) and [TypeScript](https://www.typescriptlang.org/) to enable those features I'd hihgly recommend that you use that instead of using this. Do not use this. I'm only leaving this active on Github as a means for archiving work that I've done in the past.**

## Why OOJ?

**Native object creation runs faster, it's possible to handle making classes and doing inheritance with native JavaScript so why would I use this library?**

Well, that's a good question. And if native processes work for your needs then by all means - go with those methods. Also consider some similar styled methods like the `extend` method from Underscore.js which do a little bit of object creation. If you're using CoffeeScript or TypeScript then you have no need for OOJ, go enjoy your fancy JavaScript.

So, if you've read this far by now you might be even more confused what purpose this library serves. Here's my reasons for creating it (and using it myself). OOJ provides a clean, clear and somewhat familiar object oriented method for defining classes. It also emulates Interfaces and Enums to provide some additional functionality aside from simple classes. Creating a class, and extend classes does run slower than native JavaScript, but only whent the script is loaded - which isn't that much of an impact on overall performance.

Aside from the syntax it provides some other OO features that are harder to simulate without some work such as the ability to extend and implement previously defined classes. A proper `isInstanceOf` method (and for classes `isAssignableFrom`) which makes inheritance useful. The ability to call super methods from an overridden child method via `this.$super` and of course object creation chains to extended classes.

So, **Why should you choose OOJ?** Well, because it's a simple API to define classes that can extend and implement in a more true to life OO method that you might be familiar with! It makes large object heavy projects much simpler!

Just check out these examples of OOJ's features. 

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

In order to define a constructor function for OOJ Classes you define a function called `construct` on the object given to the call to ooj.Class. There are three other special properties for OOJ Classes, `extend` and `implement` properties are used to create Classes that receive functionality from other Classes and `statics` is an object defining static methods.

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

All OOJ classes have the ability to fetch the function that constructed the class. This functions similarly to Java's `getClass()` or Ruby's `#class` methods.

```javascript
var Fruit = ooj.Class({});
var f = new Fruit();
if (Fruit === f.getClass()) {
  console.log("This is true!"); // => "This is true!"
}
```
