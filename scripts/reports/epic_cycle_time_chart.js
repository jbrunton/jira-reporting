var $ = require('jquery');
var Chart = require('../ui/chart');
var TimeChart = require('../ui/time_chart');
var reportTemplate = require('./templates/cycle_time_report.hbs');

function EpicCycleTimeChart(jiraClient) {
  Chart.call(this, jiraClient, {
    menuItemId: 'epic-cycle-time',
    title: 'Epic Cycle Time'
  });
}

EpicCycleTimeChart.prototype = Chart.prototype;

EpicCycleTimeChart.prototype.onDraw = function(target) {
  var report = $(reportTemplate()).appendTo(target);
  
  var chartArea = report.find('#timechart');
  chartArea.html('Time Chart');
  //var timeChart = new TimeChart();
  //timeChart.draw(chartArea.get(0));
}

//EpicCycleTimeChart.prototype.constructor = EpicCycleTimeChart;

module.exports = EpicCycleTimeChart;
