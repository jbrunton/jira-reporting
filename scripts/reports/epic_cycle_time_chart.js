var $ = require('jquery');
var _ = require('lodash');
var Q = require('q');
var Chart = require('../ui/chart');
var TimeChart = require('../ui/time_chart');
var reportTemplate = require('./templates/cycle_time_report.hbs');
var Indicator = require('../ui/indicator');
var EpicDataset = require('../epic_dataset');
var Simulator = require('../simulator');
var Randomizer = require('../randomizer');

function EpicCycleTimeChart(jiraClient) {
  Chart.call(this, jiraClient, {
    menuItemId: 'epic-cycle-time',
    title: 'Epic Cycle Time'
  });
}

EpicCycleTimeChart.prototype = _.clone(Chart.prototype);

EpicCycleTimeChart.prototype._setFilters = function(filters) {
  var jiraFilter = $(this.getTarget()).find('#jira_filter');
  _(filters).each(function(filter) {
    jiraFilter.append($("<option>", { value: filter.id }).text(filter.name));
  });
}

EpicCycleTimeChart.prototype._drawLayout = function() {
  $(this.getTarget()).html(reportTemplate());
  this._jiraClient.getFavouriteFilters()
    .then(this._setFilters);
}

EpicCycleTimeChart.prototype._renderForecast = function() {
  var forecastSection = $(this.getTarget()).find('#forecast_section');

  var backlogSize = this._formValues.backlog_size;
  var dateRangeDuration = this._formValues.sample_duration;
  var dateRangeUnits = this._formValues.sample_duration_units;

  if (backlogSize > 0 && dateRangeDuration > 0) {
    var filterOpts = {
    };
    if (dateRangeDuration > 0) {
      filterOpts.dateRange = {
        duration: dateRangeDuration,
        units: dateRangeUnits
      }
    }

    var sampleCycleTimeData = this._epicDataset.getCycleTimeData({
      filter: _.assign({ exclude: this._formValues.exclusion_filter.split(',') }, filterOpts)
    });
    var sampleWorkInProgressData = this._epicDataset.getWorkInProgressData({
      filter: filterOpts
    });

    var simulator = new Simulator(new Randomizer());
    var forecastResult = simulator.forecast({
      backlogSize: backlogSize,
      cycleTimeData: sampleCycleTimeData,
      workInProgressData: sampleWorkInProgressData
    });

    var forecastTemplate = require('./templates/cycle_time_forecast.hbs');
    forecastSection.html(forecastTemplate(forecastResult));
  } else {
    forecastSection.empty();
  }
}

EpicCycleTimeChart.prototype._renderChart = function(epics) {
  var chartArea = $(this.getTarget()).find('#timechart');
  var epicDataset = new EpicDataset(epics);
  this._epicDataset = epicDataset;
  
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
  this._renderForecast();
  $(window).resize(drawChart);  
}

EpicCycleTimeChart.prototype.onUpdate = function(formValues) {
  if (_.isEqual(formValues, this._formValues)) {
    return;
  }
  
  var updateChart = !this._formValues || (this._formValues.jira_filter != formValues.jira_filter);
  this._formValues = formValues;

  if (!updateChart) {
    this._renderForecast();
    return;
  }

  var report = $(this.getTarget()).find('#report');
  
  var indicator = new Indicator(function(count, position) {
    this.setText("Loaded " + position + " / " + count + " epics.");
  });
  indicator.display(this.getTarget());
  
  var loadEpics = _.bind(function(view) {
    var opts = {};
    if (this._formValues.jira_filter) {
      opts.filter = this._formValues.jira_filter;
    }
    return view.getEpics(opts);
  }, this);
  
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
  this._drawLayout(this.getTarget());
}

//EpicCycleTimeChart.prototype.constructor = EpicCycleTimeChart;

module.exports = EpicCycleTimeChart;
