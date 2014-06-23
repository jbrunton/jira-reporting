var $ = require('jquery');
var Q = require('q');
var IssuesByIntervalChart = require('../../scripts/reports/issues_by_interval_chart');
var Validator = require('../../scripts/validator');
var UiHelper = require('../../scripts/ui/ui_helper');

describe ('IssuesByIntervalChart', function() {
  var chart, jiraClient, uiHelper;
  
  beforeEach(function() {
    jiraClient = build('jira_client');
    uiHelper = new UiHelper(jiraClient);
    spyOn(uiHelper, 'loadFilters');
    chart = new IssuesByIntervalChart(jiraClient, uiHelper);
  });
  
  describe ('constructor', function() {
    it ("requires a JiraClient", function() {
      expect(function() {
        new IssuesByIntervalChart(null, uiHelper);
      }).toThrow(Validator.messages.requires('jiraClient'));
    });
    
    it ("requires a UiHelper", function() {
      expect(function() {
        new IssuesByIntervalChart(jiraClient, null);
      }).toThrow(Validator.messages.requires('uiHelper'));    
    });
    
    it ("initializes the instance", function() {
      expect(chart.title).toBe('Issues By Interval');
      expect(chart.menuItemId).toBe('issues-by-interval');
    });
  });
  
  describe ('#onDraw', function() {
    it ("renders the report options", function() {
      var target = createFakeDom();

      chart.draw(target);

      var chartContent = $(target).find('#ghx-chart-content');
      expect(chartContent).toContainElement('select#jira_filter');
      expect(uiHelper.loadFilters).toHaveBeenCalled();
    });
  });
  
  describe ('#onUpdate', function() {
    var target;
    
    beforeEach(function() {
      spyOn(jiraClient, 'search').and.returnValue(
        Q([
          build('issue', { summary: 'Some Issue' })
        ])
      );
      target = createFakeDom();
      chart.draw(target);
    });
    
    it ("draws the issues for the project", function(done) {
      chart.onUpdate()
        .then(function() {
          var chartContent = $(target).find('#ghx-chart-content');
          expect(chartContent.find('#report')).toContainText('Some Issue');
          
          done();
        });      
    });
    
    xit ("filters issues according to the selected filter option", function() {
      spyOn(jiraClient, 'getFilterById').and.returnValue(
        Q({ jql: 'some query' })
      );
      chart.onUpdate()
        .then(function() {
          expect(jiraClient.search).toHaveBeenCalledWith('some query');          
          done();
        });
    });
  });
  
  describe ('#_genQuery', function() {
    it ("filters out epics", function(done) {
      chart._genQuery()
        .then(function(query) {
          expect(query).toEqual("issuetype != Epic");
          done();
        });
    });
    
    it ("filters by sample time, if specified", function(done) {
      // TODO: something like ruby's timecop would be helpful here
      chart._genQuery()
        .then(function(query) {
          expect(query).toEqual("(issuetype != Epic) AND (foo)");
          done();
        });
    });
  });
});

