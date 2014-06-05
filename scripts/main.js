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

  function drawEpicThroughput(target) {
    var tableTemplate = require("./templates/epic_throughput/table.hbs");
    var rowTemplate = require("./templates/epic_throughput/row.hbs");

    function getStartDate(epics) {
      var earliestDate = _(epics)
        .reduce(function(earliestDate, epic) {
          if (!earliestDate || epic.startedDate.isBefore(earliestDate)) {
            return epic.startedDate;
          } else {
            return earliestDate;
          }
        }, null);

      if (earliestDate) {
        return earliestDate.clone().isoWeekday(1).startOf("day");
      }
    }

    function analyzeEvents(epics) {
      var events = [];
      _(epics)
        .each(function(epic) {
          if (epic.startedDate) {
            events.push({ key: 'started', date: epic.startedDate});
          }
          if (epic.completedDate) {
            events.push({ key: 'completed', date: epic.completedDate});
          }
        });

      var sortedEvents =  _(events)
        .sortBy(function(event) {
          return event.date.valueOf();
        })
        .value();

      var workInProgress = 0;
      var previousEvent;
      _(sortedEvents)
        .each(function(event) {
          if (event.key == 'started') {
            ++workInProgress;
          } else if (event.key == 'completed') {
            --workInProgress;
          }

          event.workInProgress = workInProgress;

          if (previousEvent) {
            previousEvent.nextEvent = event;
          }
          previousEvent = event;
        });

      return sortedEvents;
    }

    function analyzeDateRange(startDate, endDate, events) {
      var rangeEvents = _(events)
        .filter(function(event) {
          return (startDate.isBefore(event.date) || startDate.isSame(event.date)
            && event.date.isBefore(endDate));
        });
      var throughput = rangeEvents
        .reduce(function(sum, event) {
          return sum + (event.key == 'completed' ? 1 : 0);
        }, 0);
      var eventAtDate = getEventAtDate(startDate, events);
      return {
        rowDate: startDate,
        throughput: throughput,
        workInProgress: (eventAtDate || {}).workInProgress || 0
      };
    }

    function getEventAtDate(date, events) {
      var matchingEvent = _(events)
        .find(function(event) {
          var onOrBeforeDate = event.date.isBefore(date) || event.date.isSame(date);
          var endsBeforeDate = event.nextEvent && event.nextEvent.date.isBefore(date);
          return onOrBeforeDate && !endsBeforeDate;
        });
      return matchingEvent;
    }

    function drawReport(epics) {
      var indicator = new Indicator(function(count, position) {
        this.setText("Loaded " + position + " / " + count + " epics.");
      });
      indicator.display(target);

      var table = $(tableTemplate()).hide().appendTo(target);

      indicator.begin(epics.length);
      Q.all(
        _(epics)
          .map(function(epic) {
            return epic.analyze()
          })
          .value()
      ).then(function() {
          indicator.remove();
          var now = moment(),
            startDate = getStartDate(epics);
          var events = analyzeEvents(epics);
          if (startDate) {
            for (var rowDate = startDate.clone(); rowDate.isBefore(now); rowDate.add('weeks', 1)) {
              var rowData = analyzeDateRange(rowDate, rowDate.clone().add(7, 'days'), events);
              $(rowTemplate(rowData)).appendTo(table);
            }
            table.show();
          }
        });
    }

    var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
    jiraClient.getRapidViewById(rapidViewId)
      .then(function(view) {
        view.getEpics()
          .then(drawReport);
      });
  }
  
  function drawIssuesByEpic(target) {
    var tableTemplate = require("./templates/issues_by_epic/table.hbs");
    var epicRowTemplate = require('./templates/issues_by_epic/epic_row.hbs');
    var issueRowTemplate = require('./templates/issues_by_epic/issue_row.hbs');
    var spinnerRowTemplate = require('./templates/spinner_row.hbs');

    var indicator = new Indicator(function(count, position) {
      this.setText("Loaded " + position + " / " + count + " epics.");
    });
    indicator.display(target);

    var table = $(tableTemplate()).hide().appendTo(target);

    function drawEpic(epic) {
      var placeholderRow = $("<tr>").appendTo(table);

      function drawIssue(issue) {
        $(issueRowTemplate(issue)).insertAfter(placeholderRow);
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

  