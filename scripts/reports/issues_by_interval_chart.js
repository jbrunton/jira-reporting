var $ = require('jquery');
var _ = require('lodash');
var Chart = require('../ui/chart');

function IssuesByIntervalChart(jiraClient) {
  Chart.call(this, jiraClient, {
    menuItemId: 'issues-by-interval',
    title: 'Issues By Interval'
  });
}

IssuesByIntervalChart.prototype = _.clone(Chart.prototype);

IssuesByIntervalChart.prototype.onDraw = function() {
  var reportTemplate = require('./templates/issues_by_interval_report.hbs');
  $(this.getTarget()).append(reportTemplate({
    issues: [
      { summary: 'foo' }
    ]
  }));
}

module.exports = IssuesByIntervalChart;

// created >= startOfMonth(-3) and created <= endOfMonth()