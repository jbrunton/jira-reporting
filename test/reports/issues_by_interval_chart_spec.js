var $ = require('jquery');
var Q = require('q');
var IssuesByIntervalChart = require('../../scripts/reports/issues_by_interval_chart');

describe ('IssuesByIntervalChart', function() {
  var chart, jiraClient;
  
  beforeEach(function() {
    jiraClient = build('jira_client');
    chart = new IssuesByIntervalChart(jiraClient);
  });
  
  describe ('constructor', function() {
    it ("initializes the instance", function() {
      expect(chart.title).toBe('Issues By Interval');
      expect(chart.menuItemId).toBe('issues-by-interval');
    });
  });
  
  describe ('#onDraw', function() {
    it ("dpes nothing", function() {
      var target = createFakeDom();

      chart.draw(target);

      var chartContent = $(target).find('#ghx-chart-content');
      expect(chartContent).toBeEmpty();
    });
  });
  
  describe ('#onUpdate', function() {
    it ("draws the issues for the project", function(done) {
      spyOn(jiraClient, 'search').and.returnValue(
        Q([
          build('issue', { summary: 'Some Issue' })
        ])
      );
      var target = createFakeDom();
      chart.draw(target);
      
      chart.onUpdate()
        .then(function() {
          var chartContent = $(target).find('#ghx-chart-content');
          expect(chartContent).toContainText('Some Issue');
          
          done();
        });      
    });
  });
});

