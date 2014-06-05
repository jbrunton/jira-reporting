var _ = require('lodash');
var $ = require('jquery');

function Chart(opts) {
  _.assign(this, opts);
  _.bindAll(this);
}

Chart.prototype.draw = function() {
  _(['message', 'intro', 'header', 'content'])
    .each(function(divName) {
      $('#ghx-chart-' + divName).empty();
    });
  this.onDraw($('#ghx-chart-content').get(0));
}

module.exports = Chart;
