var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var Chart = require('../ui/chart');
var Validator = require('../validator');

function IssuesByIntervalChart(jiraClient, uiHelper) {
  Chart.call(this, jiraClient, {
    menuItemId: 'issues-by-interval',
    title: 'Issues By Interval'
  });
  
  new Validator()
    .requires(uiHelper, 'uiHelper');
    
  this._uiHelper = uiHelper;
}

IssuesByIntervalChart.prototype = _.clone(Chart.prototype);

IssuesByIntervalChart.prototype.onDraw = function() {
  var optionsTemplate = require('./templates/issues_by_interval_options.hbs');
  $(this.getTarget()).html(optionsTemplate());
  this._uiHelper.loadFilters($(this.getTarget()).find('#jira_filter'));
}

IssuesByIntervalChart.prototype.onUpdate = function(formValues) {
  var reportTemplate = require('./templates/issues_by_interval_report.hbs');
  
  var genQuery = _.bind(function() {
    if (formValues && formValues.jira_filter && formValues.jira_filter > 0) {
      return this._jiraClient.getFilterById(formValues.jira_filter)
        .then(function(filter) {
          return filter.jql;
        });
    } else {
      return Q(null);
    }    
  }, this);
  
  var searchIssues = _.bind(function(query) {
    return this._jiraClient.search(query);
  }, this);
  
  var drawReport = _.bind(function(issues) {
    $(this.getTarget()).find('#report').html(reportTemplate({
      issues: issues
    }));
    return Q();
  }, this);
  
  return genQuery()
    .then(searchIssues)
    .then(drawReport);
}


module.exports = IssuesByIntervalChart;

// created >= startOfMonth(-3) and created <= endOfMonth()