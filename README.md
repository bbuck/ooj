# Object Oriented Javascript

**OOJ** is a Javascript library designed to combine Object Oriented helpers in Javascript in a
single library. Using **OOJ** you can create an **Enum**, **Interface** and **Class** by defining
objects and calling the necessary functions.

## Creating Enum Objects

In order to create an Enum object you must define a `names` property as an array of names, with
an optionally given set of values for each Enum property.

Defining a simple Enum is... well simple!

```javascript
var Gender = ooj.Enum({
  names: [
    "Male",
    "Female"
  ]
});

// From here, you can use the Enum
var user = {};
user.gender = Gender.Male;
if (gender === Gender.Male)
  console.log("True");
```

By default, each name is assigned a value starting 0 unless values are specified.

```javascript
var Gender = ooj.Enum({
  names: [
    "Male",
    "Female"
  ],
  values: [
    10,
    20
  ]
});

// From here, you can use the Enum
if (Gender.Male === 10)
  console.log("True");
```

Values can be set to start a sequence, and if the value is a number it will continue from that point, but values can be set to whatever is necessary.

```javascript
var Sample = ooj.Enum({
  names: [
    "One",
    "Five",
    "Six",
    "Ten",
    "DefaultName"
  ],
  values: [
    1,
    5,
    null,
    10,
    "Peter Programmer"
  ]
});

if (Sample.Six === 6)
  console.log("This is completely true");
```

## Creating Interfaces

An Interface made by OOJ is simply a Javascript class with empty functions and a constructor
function that throws an error when the Interface is instantiated. Interfaces can be
implemented by OOJ Classes. Interfaces are extremely easy to define, assuming you want create
an object that has an area function, like a Shape:

```javascript
var Shape = ooj.Interface({
  functions: [
    "area"
  ]
});
```
And OOJ Interface is defined by simple specifying the functions that are present on the
Interface.

## Creating Classes

An OOJ Class isn't much different from a standard Javascript class but with a simpler and more
strightforward declaration syntax. Defining a simple class is just like defining a Javascript
object.

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

In order to define a constructor function for OOJ Classes you define a function called
`construct` on the object given to the call to ooj.Class. There are two other special
properties for OOJ Classes, `extend` and `implement` properties are used to create
Classes that receive functionality from other Classes.

The `extend` property is used to to extend the functionality of a single class, while the
`implement` property is used to implement functions from one or more interfaces. The
relationships created by these properties can be tested for with a function on each
OOJ Class instance, `isInstanceOf`.

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

A class can implement one or more interfaces as needed, you can either pass an
interface or an array of interfaces via the `implement` property such as:
`implement: Fruit` or `implement: [Fruit, Edible]` depending on the needs of the
class.