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
  
  function isStatusTransition(item) {
    return item.field == "status";
  }
  
  function getIssueStartedDate(issue) {
    var startedTransitions = _(issue.changelog.histories)
      .filter(function(entry) {
        return _(entry.items).any(function(item) {
          return isStatusTransition(item) && item.toString == "In Progress";
        });      
      });
    
    if (startedTransitions.any()) {
      return moment(startedTransitions.first().created);
    } else {
      return null;
    }
  }
  
  function getIssueCompletedDate(issue) {
    var lastTransition = _(issue.changelog.histories)
      .filter(function(entry) {
        return _(entry.items)
          .any(isStatusTransition);      
      }).last();
    
    if (lastTransition && _(lastTransition.items)
      .find(isStatusTransition).toString == "Done") {
      return moment(lastTransition.created);
    } else {
      return null;
    }
  }
  
  function getEpicStartedDate(epic) {
    var startedDate = _(epic.issues)
      .map(function(issue) {
        return issue.startedDate;
      })
      .compact()
      .min(function(d1, d2) {
        return d1.isBefore(d2);
      })
      .value();

    return startedDate;
  }
  
  function getIssuesForEpic(epicKey) {
    return jiraClient.search({
      query: "cf[10008]=" + epicKey,
      expand: ['changelog']
    }).then(function(issues) {
      var issues = _(issues).map(function(issue) {
        issue.startedDate = getIssueStartedDate(issue);
        issue.completedDate = getIssueCompletedDate(issue);
        return issue;
      }).value();
      return issues;
    });
  }
  
  function expandEpic(epic) {
    return getIssuesForEpic(epic.key)
      .then(function(issues) {
        epic.issues = issues;
        epic.startedDate = getEpicStartedDate(epic);
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
      }).then(function(epics) {
        return {
          epics: epics
        };
      });
  }
  
  function renderReport() {
    $('#ghx-chart-panel-content')
      .empty();
    
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
    Handlebars.registerHelper('completed_date', function() {
      if (this.completedDate) {
        var dateString = Handlebars.Utils.escapeExpression(this.completedDate.format('MMMM Do YYYY, h:mm:ss a'));
        return new Handlebars.SafeString(dateString);
      }
    });

    var reportTemplate = require("./templates/report.hbs");
    
    generateReportData()
      .then(function(reportData) {
        $('#ghx-chart-panel-content')
          .append(reportTemplate(reportData));
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

  