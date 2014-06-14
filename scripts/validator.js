function Validator() {
  
}

Validator.prototype.hasArguments = function(arguments) {
  if (arguments.length == 0) {
    throw "Expected at least one argument.";
  }
  return this;
}

Validator.prototype.isNotNull = function(value, name) {
  if (value == null) {
    throw ("Expected " + name + " to be defined.");
  }
  return this;
}

module.exports = Validator;
