var $ = require('jquery');
var _ = require('lodash');
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
  var report = $(reportTemplate()).hide().appendTo(target);
  
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
    indicator.remove();
    var chartArea = report.find('#timechart');
    chartArea.html('Time Chart');
    report.show();
  };
  
  var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
  this._jiraClient.getRapidViewById(rapidViewId)
    .then(loadEpics)
    .then(analyzeEpics)
    .then(drawChart);
}

//EpicCycleTimeChart.prototype.constructor = EpicCycleTimeChart;

module.exports = EpicCycleTimeChart;
