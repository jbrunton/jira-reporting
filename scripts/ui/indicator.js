var $ = require('jquery');
var Spinner = require('../../vendor/spin');

function Indicator(onPositionChanged) {
  this._count = 0;
  this._position = 0;
  this._onPositionChanged = onPositionChanged;
}

Indicator.prototype.display = function(target) {
  if (!this._container) {
    this._container = $('<ul><li id="spinner" style="position: relative; display: table-cell; width: 40px;"></li><li style="display: table-cell;"><p id="label">Loading epics...</p></li></ul>');
    this._label = this._container.find('#label');

    var opts = { length: 4, width: 3, radius: 6 };
    var spinner = new Spinner(opts);
    spinner.spin(this._container.find('#spinner').get(0));
  }
  this._container.appendTo(target);
}

Indicator.prototype.setText = function(text) {
  this._label.text(text);
}

Indicator.prototype.remove = function() {
  this._container.remove();
}

Indicator.prototype.begin = function(count) {
  this._count = count;
  this._position = 0;
  this._positionChanged();
}

Indicator.prototype.increment = function(amount) {
  this._position = this._position += (amount || 1);
  this._positionChanged();
}

Indicator.prototype._positionChanged = function() {
  this._onPositionChanged(this._count, this._position);
}

module.exports = Indicator;