var JiraClient = require('./jira_client');
var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');

$(function() {
  var jiraClient = new JiraClient('https://jbrunton.atlassian.net');
  //   $.ajax({
  //  type: 'GET',
  //  async: false,
  //  url: 'https://jbrunton.atlassian.net/rest/api/2/field/',
  //  contentType: "application/json",
  //  error: function() {
  //    alert('failure');
  //  },
  //  success: function(items) {
  //    console.log(items);
  //  }
  // });
  


  // $(".window-wrapper").on('DOMNodeInserted', function() {
  //   // $('#ghx-chart-nav')
  //   //   .append("<li data-tooltip="Foo" original-title=""><a href="#">Jira Reporting</a></li>");
  //   if ($('#ghx-chart-nav').length > 0) {
  //     alert('');
  //   }
  // });
  
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
  
  function getIssuesForEpic(epicKey) {
    return jiraClient.search({
      query: "cf[10008]=" + epicKey,
      expand: ['changelog']
    });
  }
  
  function getEpicData(epic) {
    return getIssuesForEpic(epic.key)
      .then(function(issues) {
        return {
          epic: epic,
          issues: issues
        };
      })
  }
  
  // function getIssuesByEpic(epics) {
  //   return Q.all(_(epics).map(function(epic) {
  //     return getIssuesForEpic(epic)
  //       .then(function(issues) {
  //         return {
  //           epic: epic,
  //           issues: issues
  //         };
  //       });
  //   }));
  // }
  
  function generateReportData() {
    return getProjectEpics()
      .then(function (epics) {
        return Q.all(
          _(epics).map(function(epic) {
            return getEpicData(epic);
          }).value()
        );
      });
  }
  
  // function generateReportData(issues, sprintFieldId) {
  //   var sprintIds = _(issues)
  //     .reduce(function(sprintIds, issue) {
  //       return sprintIds.concat(issue.fields[sprintFieldId] || []);
  //     }, []);
  //   
  //   var sprints = _(_.uniq(sprintIds))
  //     .map(function(sprintId) {
  //       var sprintName = /name=((\w|\s)+)/.exec(sprintId)[1];
  //       var sprintIssues = _(issues).filter(function(issue) {
  //         return _(issue.fields[sprintFieldId])
  //           .contains(sprintId);
  //       });
  //       return {
  //         id: sprintId,
  //         name: sprintName,
  //         issues: sprintIssues
  //       };
  //     });
  //   
  //   return {
  //     sprints: sprints,
  //     issues: issues
  //   };
  // }
  
  function getProjectData() {
    return generateReportData();
    /*return Q.all([
      getProjectEpics(),
      getSprintFieldId()
    ]).spread(function(issues, sprintFieldId) {
      return generateReportData(issues, sprintFieldId);      
    });*/
  }
  
  function renderReport() {
    $('#ghx-chart-panel-content')
      .empty()
      .append("<table id='jira-reporting-sprints' class='aui'></table>")
      .append("<table id='jira-reporting-issues' class='aui'></table>");
      
    var issuesTable = $('#ghx-chart-panel-content table#jira-reporting-issues');
    var sprintsTable = $('#ghx-chart-panel-content table#jira-reporting-sprints');
    
    getProjectData()
      .then(function(data) {
        _(data).each(function(epicData) {
          issuesTable.append("<tr><td>" + epicData.epic.key + "</td><td>" + epicData.epic.fields.summary + "</td></tr>");          
        });
        // _(data.issues).each(function(issue) {
        //   issuesTable.append("<tr><td>" + issue.key + "</td><td>" + issue.fields.summary + "</td></tr>");
        // });        
        // _(data.sprints).each(function(sprint) {
        //   sprintsTable.append("<tr><th colspan='2'>" + sprint.name + "</th></tr>");
        //   _(sprint.issues).each(function(issue) {
        //     sprintsTable.append("<tr><td>" + issue.key + "</td><td>" + issue.fields.summary + "</td></tr>");
        //   });
        // });        
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

  