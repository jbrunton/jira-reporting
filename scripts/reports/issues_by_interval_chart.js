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
  $(this.getTarget()).append("<p>Issues</p>");
}

module.exports = IssuesByIntervalChart;

// created >= startOfMonth(-3) and created <= endOfMonth()