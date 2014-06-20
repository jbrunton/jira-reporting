function Validator() {
  
}

Validator.prototype.hasArguments = function(arguments) {
  if (arguments.length == 0) {
    throw "Expected at least one argument.";
  }
  return this;
}

Validator.prototype.requires = function(value, name) {
  if (value == null) {
    throw Validator.messages.requires(name);
  }
  return this;
}

Validator.messages = {
  requires: function(name) {
    return "Required " + name + ".";
  }
};

module.exports = Validator;
