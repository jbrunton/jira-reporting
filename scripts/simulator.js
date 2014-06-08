var _ = require('lodash');

function Simulator(randomizer) {
  this._randomizer = randomizer;
  _.bindAll(this);
}

Simulator.prototype._pickValues = function(data, count) {
  var pickValue = _.bind(function() {
    var index = this._randomizer.get(data.length - 1);
    return data[index].value;
  }, this);
  return _(Array(count))
    .map(pickValue)
    .value();
}

Simulator.prototype._pickCycleTimeValues = function(opts) {
  return this._pickValues(opts.cycleTimeData, opts.backlogSize);
}

Simulator.prototype._pickWorkInProgressValues = function(opts) {
  return this._pickValues(opts.workInProgressData, 5);
}

Simulator.prototype._playOnce = function(opts) {
  var cycleTimeValues = this._pickCycleTimeValues(opts);
  var workInProgressValues = this._pickWorkInProgressValues(opts);

  var totalTime = _(cycleTimeValues)
    .reduce(function(a,b) { return a + b; });
  var averageWorkInProgress = _(workInProgressValues)
    .reduce(function(a,b) { return a + b; }) / workInProgressValues.length;

  var averageCycleTime = totalTime / opts.backlogSize;
  var actualTime = totalTime / averageWorkInProgress;
  
  return {
    averageCycleTime: averageCycleTime,
    averageWorkInProgress: averageWorkInProgress,
    totalTime: totalTime,
    actualTime: actualTime
  };
}

Simulator.prototype.play = function(opts) {
  return _(Array(opts.playCount))
    .map(this._playOnce)
    .value();
}

module.exports = Simulator;
