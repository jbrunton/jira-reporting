var _ = require('lodash');
var seedrandom = require('seedrandom');

function Randomizer() {
  this._generator = seedrandom(0);
  _.bindAll(this);
}

Randomizer.prototype.get = function(max) {
  return Math.floor(this._generator() * (max + 1));
}

module.exports = Randomizer;