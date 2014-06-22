var _ = require('lodash');
var $ = require('jquery');
var Validator = require('../validator');

function Chart(jiraClient, opts) {
  new Validator()
    .requires(jiraClient, 'jiraClient')
    .requires(opts, 'opts')
    .requires(opts.menuItemId, 'menuItemId')
    .requires(opts.title, 'title');

  this._jiraClient = jiraClient;
  _.assign(this, opts);
  
  _.bindAll(this);
}

Chart.prototype.getTarget = function() {
  return this._target;
};

Chart.prototype.onDraw = function() {
  
}

Chart.prototype.onUpdate = function(formValues) {
  
}

Chart.prototype.draw = function(target) {
  _(['message', 'intro', 'header', 'content'])
    .each(function(divName) {
      $(target).find('#ghx-chart-' + divName).empty();
    });

  var chartContentTarget = $(target).find('#ghx-chart-content').get(0);
  this._target = chartContentTarget;

  var notifyUpdateListener = _.bind(function() {
    var inputs = $(chartContentTarget).find('input,select');
    var values = _(inputs)
      .reduce(function(values, el) {
        var valObj = {};
        var val = $(el).val();
        valObj[el.id] = $.isNumeric(val) ? Number(val) : val;
        return _.assign(valObj, values);
      }, {});
    this.onUpdate(values);
  }, this);
  
  this.onDraw();
  notifyUpdateListener()

  $(target).on('blur', 'input', notifyUpdateListener);
  $(target).on('change', 'select', notifyUpdateListener);
}

module.exports = Chart;
