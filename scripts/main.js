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
var DateRange = require('./date_range');
var EpicDataset = require('./epic_dataset');
var d3 = require('d3');
var TimeChart = require('./ui/time_chart');
var Simulator = require('./simulator');
var Randomizer = require('./randomizer');

$(function() {
  var jiraClient = new JiraClient({
    domain: window.location.origin
  });

  Handlebars.registerHelper('issue_link', function() {
    var escapedKey = Handlebars.Utils.escapeExpression(this.key);
    return new Handlebars.SafeString("<a href='/browse/" + escapedKey + "'>" + escapedKey + "</a>");
  });
  Handlebars.registerHelper('duration', function(duration, unit) {
    var durationString = Handlebars.Utils.escapeExpression(moment.duration(duration, 'days').as(unit).toFixed(2) + " " + unit);
    return new Handlebars.SafeString(durationString);
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
  Handlebars.registerHelper('round', function(value) {
    return value.toFixed(2);
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

    function drawReport(epics) {
      var indicator = new Indicator(function(count, position) {
        this.setText("Loaded " + position + " / " + count + " epics.");
      });
      indicator.display(target);
      indicator.begin(epics.length);

      var table = $(tableTemplate()).hide().appendTo(target);

      indicator.begin(epics.length);
      Q.all(
        _(epics)
          .map(function(epic) {
            return epic.analyze().then(function(epic) {
              indicator.increment();
              return epic;
            });
          })
          .value()
      ).then(function() {
          indicator.remove();
          var now = moment(),
            startDate = getStartDate(epics);
          var dataset = new EpicDataset(epics);
          
          function drawRow(rowDate) {
            var dateRange = new DateRange(rowDate, rowDate.clone().add('weeks', 1));
            var cycleTime = dataset.getCycleTimeForRange(dateRange);
            var throughput = dataset.getThroughputForRange(dateRange);
            var rowData = {
              rowDate: rowDate,
              cycleTime: cycleTime,
              throughput: throughput,
              workInProgress: throughput * cycleTime
            };
            $(rowTemplate(rowData)).appendTo(table);
          }
          
          if (startDate) {
            for (var rowDate = startDate.clone(); rowDate.isBefore(now); rowDate.add('weeks', 1)) {
              drawRow(rowDate);
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
  
  function drawEpicCycleTime(target) {
    
    var indicator = new Indicator(function(count, position) {
      this.setText("Loaded " + position + " / " + count + " epics.");
    });
    indicator.display(target);
    
    var loadEpics = function(view) {
      return view.getEpics();
    };
    
    var analyzeEpics = function(epics) {
      indicator.begin(epics.length);
      return Q.all(
        _(epics)
          .map(function(epic) {
            return epic.analyze()
              .then(function() {
                indicator.increment();
                return epic;
              });
          }).value()
      );
    };
    
    var drawChart = function(epics) {
      indicator.remove();
      
      var epicDataset = new EpicDataset(epics);
      
      var cycleTimeData = epicDataset.getCycleTimeData();
      var workInProgressData = epicDataset.getWorkInProgressData();
      
      var timeChart = new TimeChart();
      timeChart.addSeries({
        key: 'cycle_time',
        color: 'red',
        circle: true,
        axisOrientation: 'left',
        data: cycleTimeData
      });
      timeChart.addSeries({
        key: 'wip',
        color: 'blue',
        axisOrientation: 'right',
        data: workInProgressData
      });
      timeChart.draw(target);

      var reportTemplate = require("./templates/epic_cycle_time/report.hbs");
      var reportSection = $(reportTemplate()).appendTo(target);

      var backlogSizeInput = reportSection.find('#backlog_size');
      var sampleDurationInput = reportSection.find('#sample_duration');
      var sampleDurationUnitsInput = reportSection.find('#sample_duration_units');
      var exclusionFilterInput = reportSection.find('#exclusion_filter');
      var forecastSection = reportSection.find('#forecast_section');
        
      function forecast() {
        var backlogSize = Number(backlogSizeInput.val());
        var dateRangeDuration = Number(sampleDurationInput.val());
        var dateRangeUnits = sampleDurationUnitsInput.val();

        if (backlogSize > 0 && dateRangeDuration > 0) {
          var filterOpts = {
          };
          if (dateRangeDuration > 0) {
            filterOpts.dateRange = {
              duration: dateRangeDuration,
              units: dateRangeUnits
            }
          }

          var sampleCycleTimeData = epicDataset.getCycleTimeData({
            filter: _.assign({ exclude: exclusionFilterInput.val().split(',') }, filterOpts)
          });
          var sampleWorkInProgressData = epicDataset.getWorkInProgressData({
            filter: filterOpts
          });

          var simulator = new Simulator(new Randomizer());
          var forecastResult = simulator.forecast({
            backlogSize: backlogSize,
            cycleTimeData: sampleCycleTimeData,
            workInProgressData: sampleWorkInProgressData
          });
      
          var forecastTemplate = require('./templates/epic_cycle_time/forecast.hbs');
          forecastSection.html(forecastTemplate(forecastResult));
        } else {
          forecastSection.empty();
        }
      }  
      
      backlogSizeInput.blur(forecast);
      sampleDurationInput.blur(forecast);
      exclusionFilterInput.blur(forecast);
      sampleDurationUnitInput.change(forecast);
    };
    
    var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
    jiraClient.getRapidViewById(rapidViewId)
      .then(loadEpics)
      .then(analyzeEpics)
      .then(drawChart);
  }

  function drawEpicsBySprint(target) {

    var reportTemplate = require("./templates/epics_by_sprint/sprint_report.hbs");

    var loadSprints = _.bind(function(rapidView) {
      return rapidView.getSprints();
    }, this);

    var loadReports = _.bind(function(sprints) {
      return Q.all(
        _(sprints).map(function(sprint) {
          return sprint.getReport();
        }).value()
      );
    }, this);

    var drawReports = _.bind(function(reports) {
      _(reports).map(function(report) {
        $(reportTemplate(report)).appendTo(target);
      });
    }, this);

    var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
    jiraClient.getRapidViewById(rapidViewId)
      .then(loadSprints)
      .then(loadReports)
      .then(drawReports);
  }
  
  var chartMenu = new ChartMenu();
  chartMenu.configureCharts([
    new Chart({
      menuItemId: 'issues-by-epic',
      title: 'Issues By Epic',
      onDraw: drawIssuesByEpic
    }),
    // new Chart({
    //   menuItemId: 'epic-throughput',
    //   title: 'Epic Throughput',
    //   onDraw: drawEpicThroughput
    // }),
    new Chart({
      menuItemId: 'epic-cycle-time',
      title: 'Epic Cycle Time',
      onDraw: drawEpicCycleTime
    }),
    new Chart({
      menuItemId: 'epics-by-sprint',
      title: 'Epics by Sprint',
      onDraw: drawEpicsBySprint
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

  