var $ = require('jquery');
var _ = require('lodash');

function ChartMenu(renderReport) {
  this._renderReport = renderReport;
  _.bindAll(this);
}

ChartMenu.prototype.layout = function() {
  var renderReport = this._renderReport;
  function jiraReportingClicked() {
    var selectedClass = 'aui-nav-selected';
    var menuItemSelector = '#ghx-chart-nav li';
    $(menuItemSelector).removeClass(selectedClass);
    $(this).closest(menuItemSelector).addClass(selectedClass);
    renderReport();
  }
  
  var chartNav = $('#ghx-chart-nav');
  if (chartNav.size()) {
    var jiraReportingLink = $('#jira-reporting-link');
    if (!jiraReportingLink.size()) {
      $("<li id='jira-reporting-link' original-title=''><a href='#'>Jira Reporting</a></li>")
        .click(jiraReportingClicked)
        .appendTo('#ghx-chart-nav');
    } else {
      jiraReportingLink
        .appendTo('#ghx-chart-nav');
    }
  }  
}

ChartMenu.prototype.init = function() {
  $("#ghx-chart-nav").on('DOMNodeInserted', this.layout);
  $('#ghx-view-modes .aui-button').click(this.layout);
  
  this.layout();
}

module.exports = ChartMenu;