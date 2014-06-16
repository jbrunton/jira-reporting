var $ = require('jquery');
var EpicCycleTimeChart = require('../../scripts/reports/epic_cycle_time_chart');

describe ('EpicCycleTimeChart', function() {
  var chart;
  
  beforeEach(function() {
    var jiraClient = build('jira_client');
    chart = new EpicCycleTimeChart(jiraClient);
  });
  
  describe ('constructor', function() {
    it ("initializes the instance", function() {
      expect(chart.title).toBe('Epic Cycle Time');
      expect(chart.menuItemId).toBe('epic-cycle-time');
    });
  });
  
  describe ('#onDraw', function() {
    it ("draws the UI for the report", function() {
      var target = createFakeDom();

      chart.draw(target);

      var chartContent = $(target).find('#ghx-chart-content');
      expect(chartContent).toContainElement('input#backlog_size');
      expect(chartContent).toContainElement('input#sample_duration');
      expect(chartContent).toContainElement('select#sample_duration_units');
      expect(chartContent).toContainElement('input#exclusion_filter');
    });
  });
});
