var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var Chart = require('../ui/chart');

function IssuesByIntervalChart(jiraClient) {
  Chart.call(this, jiraClient, {
    menuItemId: 'issues-by-interval',
    title: 'Issues By Interval'
  });
}

IssuesByIntervalChart.prototype = _.clone(Chart.prototype);

IssuesByIntervalChart.prototype.onDraw = function() {
}

IssuesByIntervalChart.prototype.onUpdate = function() {
  var reportTemplate = require('./templates/issues_by_interval_report.hbs');
  var drawReport = _.bind(function(issues) {
    $(this.getTarget()).html(reportTemplate({
      issues: issues
    }));
    return Q();
  }, this);
  
  return this._jiraClient.search()
    .then(drawReport);
}


module.exports = IssuesByIntervalChart;

// created >= startOfMonth(-3) and created <= endOfMonth()