var JiraClient = require('./jira/jira_client');
var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var Handlebars = require("hbsfy/runtime");
var moment = require('moment');
var Spinner = require('../vendor/spin');
var ChartMenu = require('./ui/chart_menu');
var EpicDataset = require('./epic_dataset');
var Chart = require('./ui/chart');
var Indicator = require('./ui/indicator');

$(function() {
  var jiraClient = new JiraClient(window.location.origin);

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

  function drawEpicThroughput(target) {
  }
  
  function drawIssuesByEpic(target) {
    var indicator = new Indicator(function(count, position) {
      this.setText("Loaded " + position + " / " + count + " epics.");
    });
    indicator.display(target);

    var table = $(tableTemplate()).hide().appendTo(target);

    function drawEpic(epic) {
      var placeholderRow = $("<tr>").appendTo(table);

      function drawIssue(issue) {
        return issue.analyze().then(function() {
          $(issueRowTemplate(issue)).insertAfter(placeholderRow);
        });
      }

      return epic.analyze()
        .then(function() {
          Q.all(
            _(epic.issues)
              .reverse()
              .map(drawIssue)
              .value()
          ).then(function() {
            placeholderRow.replaceWith(epicRowTemplate(epic));
            indicator.increment();
          });
        });
    }

    function drawEpics(epics) {
      indicator.begin(epics.length);
      Q.all(
        _(epics)
          .map(drawEpic)
          .value()
      ).then(function() {
        indicator.remove();
        table.show();
      });
    }

    var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
    jiraClient.getRapidViewById(rapidViewId)
      .then(function(view) {
        view.getEpics()
          .then(drawEpics);
      });
  }
  
  var chartMenu = new ChartMenu();
  chartMenu.configureCharts([
    new Chart({
      menuItemId: 'issues-by-epic',
      title: 'Issues By Epic',
      onDraw: drawIssuesByEpic
    }),
    new Chart({
      menuItemId: 'epic-throughput',
      title: 'Epic Throughput',
      onDraw: drawEpicThroughput
    })
  ]);
  

  // var chartMenu = new ChartMenu();
  // chartMenu.init({
  //   items: [
  //     { id: 'issues-by-epic', title: 'Issues By Epic', render: renderReport },
  //     { id: 'epic-throughput', title: 'Epic Throughput', render: renderEpicThroughput }
  //   ]
  // });
  
  // Q.all([
  //   getSprintFieldId(),
  //   getCurrentRapidViewIssues()
  // ]).spread(function(sprintFieldId, issues) {
  //   console.log('sprintField: ' + sprintField);
  //   console.log('issues: ' + issues);
  // });
});

  