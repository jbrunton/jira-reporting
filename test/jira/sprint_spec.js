var Sprint = require('../../scripts/jira/sprint');
var Factory = require('rosie').Factory;

describe ('Sprint', function() {
  var sprint;

  beforeEach(function() {
    sprint = Factory.build('sprint');
  });

  describe ('#getReport', function() {
    var promise, request;

    beforeEach(function() {
      promise = sprint.getReport();
      request = jasmine.Ajax.requests.mostRecent();
    });

    it ('queries the API for the sprint report', function() {
      expect(request.url).toEqual(
          'http://www.example.com/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId='
          + sprint.rapidViewId + '&sprintId=' + sprint.id);
      expect(request.method).toBe('GET');
    });
  });
});