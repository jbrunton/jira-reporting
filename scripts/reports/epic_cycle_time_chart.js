var $ = require('jquery');
var Chart = require('../ui/chart');
var TimeChart = require('../ui/time_chart');
var reportTemplate = require('./templates/cycle_time_report.hbs');

function EpicCycleTimeChart() {
}

EpicCycleTimeChart.prototype = new Chart(null, {
  menuItemId: 'epic-cycle-time',
  title: 'Epic Cycle Time'
});

EpicCycleTimeChart.prototype.onDraw = function(target) {
  var report = $(reportTemplate()).appendTo(target);
  
  var chartArea = report.find('#timechart');
  chartArea.html('Time Chart');
  //var timeChart = new TimeChart();
  //timeChart.draw(chartArea.get(0));
}

//EpicCycleTimeChart.prototype.constructor = EpicCycleTimeChart;

module.exports = EpicCycleTimeChart;
