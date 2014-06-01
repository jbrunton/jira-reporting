var JiraClient = require('./jira_client');
var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var Handlebars = require("hbsfy/runtime");
var moment = require('moment');
var Spinner = require('../vendor/spin');
var ChartMenu = require('./chart_menu');
var EpicDataset = require('./epic_dataset');

$(function() {
  var jiraClient = new JiraClient(window.location.origin);
  
  function getSprintFieldId() {
    return jiraClient.getResourceByName('field', 'Sprint')
      .then(function(field) {
        return field.id;
      });
  }
  
  function getEpicLinkFieldId() {
    return jiraClient.getResourceByName('field', 'Epic Link')
      .then(function(field) {
        return field.schema.customId;
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
  
  // function getCurrentRapidViewIssues() {
  //   return getCurrentRapidView().then(function(view) {
  //     return jiraClient.search(view.filter.query);
  //   });
  // }
  
  function getCurrentRapidViewEpics() {
    return getCurrentRapidView().then(function(view) {
      return jiraClient.search("issuetype=Epic AND " + view.filter.query);
    });
  }
  
  function isEpic(issue) {
    return issue.fields.issuetype.name == 'Epic';
  }
  
  function getProjectEpics() {
    return getCurrentRapidViewEpics();
    // return getCurrentRapidViewIssues()
    //   .then(function(issues) {
    //     return _(issues).filter(isEpic);
    //   });
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
    var issueStartedDates = _(epic.issues)
      .map(function(issue) {
        return issue.startedDate;
      })
      .compact();
    
    if (issueStartedDates.any()) {
      var startedDate = issueStartedDates
        .min(function(date) {
          return date.unix();
        })
        .value();
      
      return startedDate;
    } else {
      return null
    }
  }
  
  function getEpicCompletedDate(epic) {
    var issueCompletedDates = _(epic.issues)
      .map(function(issue) {
        return issue.completedDate;
      });
      
    if (issueCompletedDates.any()
      && issueCompletedDates.all())
    {
      var completedDate = issueCompletedDates
        .max(function(date) {
          return date.unix();
        })
        .value();
      
      return completedDate;
    } else {
      return null;
    }
  }
  
  function getIssuesForEpic(epicKey, epicLinkFieldId) {
    return jiraClient.search({
      query: "cf[" + epicLinkFieldId + "]=" + epicKey,
      expand: ['changelog']
    }).then(function(issues) {
      _(issues).each(function(issue) {
        issue.startedDate = getIssueStartedDate(issue);
        issue.completedDate = getIssueCompletedDate(issue);
      });
      return issues;
    });
  }
  
  function expandEpic(epic, epicLinkFieldId) {
    return getIssuesForEpic(epic.key, epicLinkFieldId)
      .then(function(issues) {
        epic.issues = issues;
        epic.startedDate = getEpicStartedDate(epic);
        epic.completedDate = getEpicCompletedDate(epic);
        return epic;
      })
  }
  
  function generateReportData() {
    // return getProjectEpics()
    //   .then(function (epics) {
    //     return Q.all(
    //       _(epics).map(function(epic) {
    //         return expandEpic(epic);
    //       }).value()
    //     );
    //   }).then(function(epics) {
    //     return {
    //       epics: epics
    //     };
    //   });
    
    return getProjectEpics().then(function(epics) {
      return {
        epics: epics
      };
    })
  }
  
  function renderReport() {
    
    _(['message', 'intro', 'header', 'content'])
      .each(function(divName) {
        $('#ghx-chart-' + divName).empty();
      });
    
    Handlebars.registerHelper('issue_link', function() {
      var escapedKey = Handlebars.Utils.escapeExpression(this.key);
      return new Handlebars.SafeString("<a href='/browse/" + escapedKey + "'>" + escapedKey + "</a>");
    });
    Handlebars.registerHelper('date', function(date) {
      if (date) {
        var dateString = Handlebars.Utils.escapeExpression(date.format('MMMM Do YYYY, h:mm:ss a'));
        return new Handlebars.SafeString(dateString);
      }
    });
    Handlebars.registerHelper('cycle_time', function() {
      if (this.startedDate && this.completedDate) {
        var diffString = Handlebars.Utils.escapeExpression(this.startedDate.from(this.completedDate, true));
        return new Handlebars.SafeString(diffString);
      }
    });

    var tableTemplate = require("./templates/report.hbs");
    var epicRowTemplate = require('./templates/epic_row.hbs');
    var issueRowTemplate = require('./templates/issue_row.hbs');
    var spinnerRowTemplate = require('./templates/spinner_row.hbs');
    
    getEpicLinkFieldId().then(function(epicLinkFieldId) {
      generateReportData()
        .then(function(reportData) {
          $('#ghx-chart-content')
            .append(tableTemplate());

          var table = $('#ghx-chart-content table');

          _(reportData.epics)
            .each(function(epic) {
              var epicRow = $(epicRowTemplate(epic)).hide().appendTo(table);
              var spinnerRow = $(spinnerRowTemplate(epic)).appendTo(table);

              var opts = { length: 4, width: 3, radius: 6 };
              var spinner = new Spinner(opts);
              spinner.spin(spinnerRow.find('td.spinner-cell').get(0));
            
              expandEpic(epic, epicLinkFieldId).then(function(epic) {
                _(epic.issues).each(function(issue) {                
                  var issueRow = $(issueRowTemplate(issue)).insertAfter(epicRow);
                });
                epicRow.replaceWith(epicRowTemplate(epic));
                spinnerRow.remove();
              });        
            });          
          });
        });
  }
  
  function renderEpicThroughput() {
    getEpicLinkFieldId()
      .then(function(epicLinkFieldId) {
        var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
        var dataset = new EpicDataset(jiraClient, epicLinkFieldId);
        dataset.load(rapidViewId, function(epic, epics) {
          // alert('loaded ' + epic.key + ", from " + epics.length + ' epics');
        });
      });
  }

  var chartMenu = new ChartMenu();
  chartMenu.init({
    items: [
      { id: 'issues-by-epic', title: 'Issues By Epic', render: renderReport },
      { id: 'epic-throughput', title: 'Epic Throughput', render: renderEpicThroughput }
    ]
  });
  
  // Q.all([
  //   getSprintFieldId(),
  //   getCurrentRapidViewIssues()
  // ]).spread(function(sprintFieldId, issues) {
  //   console.log('sprintField: ' + sprintField);
  //   console.log('issues: ' + issues);
  // });
});

  