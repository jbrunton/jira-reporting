var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var moment = require('moment');
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
  
  function cleanQuery(query) {
    if (/ORDER BY/.exec(query)) {
      return /(.*)(ORDER BY.*)/.exec(query)[1];
    } else {
      return query;
    }    
  }
  
  var genQuery = _.bind(function() {
    var query = "";
    
    if (formValues && formValues.sample_duration && formValues.sample_duration_units) {
      var since = moment().subtract(formValues.sample_duration, formValues.sample_duration_units);
      query += 'created >= "' + since.format('YYYY/MM/DD') + '"';
    }
    
    if (formValues && formValues.jira_filter && formValues.jira_filter > 0) {
      return this._jiraClient.getFilterById(formValues.jira_filter)
        .then(function(filter) {
          if (query != "") {
            query += " AND ";
          }
          query += "(" + cleanQuery(filter.jql) + ")";
          return query;
        });
    } else {
      return Q(query);
    }    
  }, this);
  
  var searchIssues = _.bind(function(query) {
    var opts = {
      expand: ['changelog']      
    };
    if (query && query != "") {
      opts.query = query;
    }
    return this._jiraClient.search(opts);
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