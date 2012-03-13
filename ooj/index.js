(function() {
  var ooj;

  ooj = {
    hello: function(name) {
      if (name == null) name = "You didn't give me a name";
      return console.log("Hello " + name + "!");
    }
  };

  module.exports = ooj;

}).call(this);
