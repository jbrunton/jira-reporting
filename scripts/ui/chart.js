var _ = require('lodash');
var $ = require('jquery');
var Validator = require('../validator');

function Chart(opts) {
  new Validator()
    .hasArguments(arguments)
    .isNotNull(opts.menuItemId, 'menuItemId')
    .isNotNull(opts.title, 'title')
    .isNotNull(opts.onDraw, 'onDraw');
  
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
