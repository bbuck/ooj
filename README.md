# Object Oriented Javascript

**OOJ** is a Javascript library designed to combine Object Oriented helpers in Javascript in a
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