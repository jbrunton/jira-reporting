var JiraClient = require('./jira_client');
var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var Handlebars = require("hbsfy/runtime");
var moment = require('moment');

$(function() {
  var jiraClient = new JiraClient('https://jbrunton.atlassian.net');
  
  function getSprintFieldId() {
    return jiraClient.getResourceByName('field', 'Sprint')
      .then(function(field) {
        return field.id;
      });
  }
  
  function getCurrentRapidView() {
    var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
    return jiraClient.getRapidViews().then(function(views) {
      return _(views).find(function(view) {
        return view.id == rapidViewId;
      });
    });
  }
  
  function getCurrentRapidViewIssues() {
    return getCurrentRapidView().then(function(view) {
      return jiraClient.search(view.filter.query);
    });
  }
  
  function isEpic(issue) {
    return issue.fields.issuetype.name == 'Epic';
  }
  
  function getProjectEpics() {
    return getCurrentRapidViewIssues()
      .then(function(issues) {
        return _(issues).filter(isEpic);
      });
  }
  
  function getIssueStartedDate(issue) {
    var startedTransitions = _(issue.changelog.histories).filter(function(entry) {
      return _(entry.items).any(function(item) {
        return item.field == "status" && item.toString == "In Progress";
      });      
    });
    if (startedTransitions.any()) {
      return moment(startedTransitions.first().created);
    } else {
      return null;
    }
  }
  
  function getIssuesForEpic(epicKey) {
    return jiraClient.search({
      query: "cf[10008]=" + epicKey,
      expand: ['changelog']
    }).then(function(issues) {
      var issues = _(issues).map(function(issue) {
        issue.startedDate = getIssueStartedDate(issue);
        return issue;
      }).value();
      return issues;
    });
  }
  
  function expandEpic(epic) {
    return getIssuesForEpic(epic.key)
      .then(function(issues) {
        epic.issues = issues;
        return epic;
      })
  }
  
  function generateReportData() {
    return getProjectEpics()
      .then(function (epics) {
        return Q.all(
          _(epics).map(function(epic) {
            return expandEpic(epic);
          }).value()
        );
      });
  }

  function getProjectData() {
    return generateReportData();
  }
  
  function renderReport() {
    $('#ghx-chart-panel-content')
      .empty()
      .append("<table id='jira-reporting-sprints' class='aui'></table>")
      .append("<table id='jira-reporting-issues' class='aui'></table>");
      
    var issuesTable = $('#ghx-chart-panel-content table#jira-reporting-issues');
    var sprintsTable = $('#ghx-chart-panel-content table#jira-reporting-sprints');
    
    Handlebars.registerHelper('link_to', function() {
      var escapedKey = Handlebars.Utils.escapeExpression(this.key);
      return new Handlebars.SafeString("<a href='/browse/" + escapedKey + "'>" + escapedKey + "</a>");
    });
    Handlebars.registerHelper('started_date', function() {
      if (this.startedDate) {
        var dateString = Handlebars.Utils.escapeExpression(this.startedDate.format('MMMM Do YYYY, h:mm:ss a'));
        return new Handlebars.SafeString(dateString);
      }
    });
    var epicRowTemplate = require("./templates/epic_table_row.hbs");
    var issueRowTemplate = require("./templates/issue_table_row.hbs");
    
    getProjectData()
      .then(function(data) {
        _(data).each(function(epic) {
          issuesTable.append(epicRowTemplate(epic));          
          _(epic.issues).each(function(issue) {
            issuesTable.append(issueRowTemplate(issue));                    
          });
        });      
      });
  }

  $('#ghx-chart-nav')
    .append("<li id='jira-reporting-link' data-tooltip='Foo' original-title=''><a href='#'>Jira Reporting</a></li>")
    .click(renderReport);
  
  Q.all([
    getSprintFieldId(),
    getCurrentRapidViewIssues()
  ]).spread(function(sprintFieldId, issues) {
    console.log('sprintField: ' + sprintField);
    console.log('issues: ' + issues);
  });
});

  