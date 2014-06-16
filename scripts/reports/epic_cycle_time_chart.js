var $ = require('jquery');
var Q = require('q');
var Chart = require('../ui/chart');
var TimeChart = require('../ui/time_chart');
var reportTemplate = require('./templates/cycle_time_report.hbs');
var Indicator = require('../ui/indicator');

function EpicCycleTimeChart(jiraClient) {
  Chart.call(this, jiraClient, {
    menuItemId: 'epic-cycle-time',
    title: 'Epic Cycle Time'
  });
}

EpicCycleTimeChart.prototype = Chart.prototype;

EpicCycleTimeChart.prototype.onDraw = function(target) {
  var report = $(reportTemplate()).appendTo(target);
  
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
  
  var drawChart = function() {
    var chartArea = report.find('#timechart');
    chartArea.html('Time Chart');
  };
  
  this._jiraClient.getCurrentRapidView()
    .then(loadEpics)
    .then(analyzeEpics)
    .then(drawChart);
}

//EpicCycleTimeChart.prototype.constructor = EpicCycleTimeChart;

module.exports = EpicCycleTimeChart;
