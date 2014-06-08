function Randomizer() {
  
}

Randomizer.prototype.get = function(max) {
  return Math.floor(Math.random() * (max + 1));
}

module.exports = Randomizer;