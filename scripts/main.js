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
    //Width and height
		var w = 1000;
		var h = 300;
		var padding = 30;
		
		//Static dataset
    // var dataset = [
    //   [moment("May 1, 2014"), 20],
    //   [moment("May 8, 2014"), 50],
    //   [moment("May 15, 2014"), 30]
    //        //[5, 20], [480, 90], [250, 50], [100, 33], [330, 95],
    //        //[410, 12], [475, 44], [25, 67], [85, 21], [220, 88],
    //        //[600, 150]
    //        ];
    
    var dataset = [
      { date: moment("May 1, 2014"), cycleTime: 10 },
      { date: moment("May 8, 2014"), cycleTime: 35 },
      { date: moment("May 15, 2014"), cycleTime: 30 }
    ];
    
    var timeChart = new TimeChart(dataset);
    timeChart.addSeries({
      key: 'cycle_time',
      getY: function(d) {
        return d.cycleTime
      }
    });
    
    timeChart.draw(target);
		
		/*
		//Dynamic, random dataset
		var dataset = [];					//Initialize empty array
		var numDataPoints = 50;				//Number of dummy data points to create
		var xRange = Math.random() * 1000;	//Max range of new x values
		var yRange = Math.random() * 1000;	//Max range of new y values
		for (var i = 0; i < numDataPoints; i++) {					//Loop numDataPoints times
			var newNumber1 = Math.round(Math.random() * xRange);	//New random integer
			var newNumber2 = Math.round(Math.random() * yRange);	//New random integer
			dataset.push([newNumber1, newNumber2]);					//Add new number to array
		}
		*/

		//Create scale functions
    // var xScale = d3.time.scale()
    //           .domain([moment("Apr 1, 2014").toDate(), moment("Jul 1, 2014").toDate()])
    //           .range([padding, w - padding * 2]);
    // 
    // var yScale = d3.scale.linear()
    //           .domain([0, d3.max(dataset, function(d) { return d.cycleTime; })])
    //           .range([h - padding, padding]);
    // 
    // var rScale = d3.scale.linear()
    //           .domain([0, d3.max(dataset, function(d) { return d.cycleTime; })])
    //           .range([2, 5]);
    // 
    // //Define X axis
    // var xAxis = d3.svg.axis()
    //          .scale(xScale)
    //          .orient("bottom")
    //          .ticks(5)
    //          .tickFormat(function(d) {
    //            return moment(d).format("DD MMM YYYY");
    //          });
    // 
    // //Define Y axis
    // var yAxis = d3.svg.axis()
    //          .scale(yScale)
    //          .orient("left")
    //          .ticks(5);
    // 
    // 
    // //Create SVG element
    // var svg = d3.select(target)
    //      .append("svg")
    //      .attr("width", w)
    //      .attr("height", h);
    // 
    // //Create circles
    // svg.selectAll("circle")
    //    .data(dataset)
    //    .enter()
    //    .append("circle")
    //    .attr("cx", function(d) {
    //        return xScale(d.date);
    //    })
    //    .attr("cy", function(d) {
    //        return yScale(d.cycleTime);
    //    })
    //    .attr("r", function(d) {
    //        return rScale(d.cycleTime);
    //    });
    // 
    // 
    // //Create labels
    // svg.selectAll("text")
    //    .data(dataset)
    //    .enter()
    //    .append("text")
    //    .text(function(d) {
    //        // return d[0] + "," + d[1];
    //        return moment(d).format("DD MMM YYYY") + "," + d.cycleTime;
    //    })
    //    .attr("x", function(d) {
    //        return xScale(d.date);
    //    })
    //    .attr("y", function(d) {
    //        return yScale(d.cycleTime);
    //    })
    //    .attr("font-family", "sans-serif")
    //    .attr("font-size", "11px")
    //    .attr("fill", "red");
    //      
    // 
    // //Create X axis
    // svg.append("g")
    //  .attr("class", "axis")
    //  .attr("transform", "translate(0," + (h - padding) + ")")
    //  .call(xAxis);
    // 
    // //Create Y axis
    // svg.append("g")
    //  .attr("class", "axis")
    //  .attr("transform", "translate(" + padding + ",0)")
    //  .call(yAxis);
    // 
    // // TODO: figure out why CSS isn't being loaded for the extension
    // svg.selectAll('.axis path, .axis path')
    //   .style({fill: 'none', stroke: 'black', 'shape-rendering': 'crispEdges'});
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

  