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

Chart.prototype.draw = function(target) {
  var chartContentTarget = $(target).find('#ghx-chart-content').get(0);
  _(['message', 'intro', 'header', 'content'])
    .each(function(divName) {
      $(target).find('#ghx-chart-' + divName).empty();
    });
  this.onDraw(chartContentTarget);
  
  var notifyUpdateListener = _.bind(function() {
    var inputs = $(target).find('input,select');
    var values = _(inputs)
      .reduce(function(values, el) {
        var valObj = {};
        var val = $(el).val();
        valObj[el.id] = $.isNumeric(val) ? Number(val) : val;
        return _.assign(valObj, values);
      }, {});
    this.onUpdate(chartContentTarget, values);
  }, this);
  
  $(target).on('blur', 'input', notifyUpdateListener);
  $(target).on('change', 'select', notifyUpdateListener);
}

module.exports = Chart;
