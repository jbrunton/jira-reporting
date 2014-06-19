var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var Chart = require('../ui/chart');
var TimeChart = require('../ui/time_chart');
var reportTemplate = require('./templates/cycle_time_report.hbs');
var Indicator = require('../ui/indicator');
var EpicDataset = require('../epic_dataset');

function EpicCycleTimeChart(jiraClient) {
  Chart.call(this, jiraClient, {
    menuItemId: 'epic-cycle-time',
    title: 'Epic Cycle Time'
  });
}

EpicCycleTimeChart.prototype = _.clone(Chart.prototype);

EpicCycleTimeChart.prototype._drawLayout = function() {
  $(this.getTarget()).html(reportTemplate());
}

EpicCycleTimeChart.prototype._renderChart = function(epics) {
  var chartArea = $(this.getTarget()).find('#timechart');
  var epicDataset = new EpicDataset(epics);
  
  var cycleTimeData = epicDataset.getCycleTimeData();
  var workInProgressData = epicDataset.getWorkInProgressData();
  
  // report.show();

  function drawChart() {
    chartArea.empty();
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
    timeChart.draw(chartArea.get(0)); 
  }
  
  drawChart();
  $(window).resize(drawChart);  
}

EpicCycleTimeChart.prototype.onUpdate = function(formValues) {
  if (_.isEqual(formValues, this._formValues)) {
    return;
  }
  
  this._formValues = formValues;
  
  this._drawLayout(this.getTarget());

  var report = $(this.getTarget()).find('#report');
  
  var indicator = new Indicator(function(count, position) {
    this.setText("Loaded " + position + " / " + count + " epics.");
  });
  indicator.display(this.getTarget());
  
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
  
  var hideIndicator = function() {
    indicator.remove();
  };
  
  var forecastSection = report.find('#forecast_section');
  
  var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
  this._jiraClient.getRapidViewById(rapidViewId)
    .then(loadEpics)
    .then(analyzeEpics)
    .then(this._renderChart)
    .then(hideIndicator);
}

EpicCycleTimeChart.prototype.onDraw = function() {

}

//EpicCycleTimeChart.prototype.constructor = EpicCycleTimeChart;

module.exports = EpicCycleTimeChart;
