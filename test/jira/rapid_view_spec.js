var RapidView = require('../../scripts/jira/rapid_view');
var Sprint = require('../../scripts/jira/sprint');
var Factory = require('rosie').Factory;

describe ('RapidView', function() {
  var rapidView;

  beforeEach(function() {
    rapidView = Factory.build('rapid_view');
  });

  describe ('#getSprints', function() {
    var promise, request;

    beforeEach(function() {
      promise = rapidView.getSprints();
      request = jasmine.Ajax.requests.mostRecent();
    });

    it('requests the sprints from the Jira API for the rapid view', function() {
      expect(request.url).toEqual('http://www.example.com/rest/greenhopper/1.0/sprintquery/' + rapidView.id);
      expect(request.method).toBe('GET');
    });

    it('returns a promise which resolves to a list of the items in the response', function(done) {
      // TODO: use handlebars to generate more complete JSON response
      var expectedResult = {
        sprints: [{ id: 123, name: 'Some Sprint' }]
      };

      request.response(createSuccessfulResponse(expectedResult));

      promise.then(function(sprints) {
        expect(sprints.length).toBe(1);
        expect(sprints[0] instanceof Sprint).toBe(true);
        expect(sprints[0].id).toBe(123);
        expect(sprints[0].name).toBe('Some Sprint');
        done();
      });
    });
  });
});
