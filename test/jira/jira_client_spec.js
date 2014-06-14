var JiraClient = require('../../scripts/jira/jira_client');
var $ = require('jquery');

describe ('JiraClient', function() {
  
  var jiraClient;
  
  beforeEach(function() {
    jiraClient = new JiraClient({
      domain: "http://www.example.com"
    });
  });

  it('requires an opts param', function() {
    expect(function() {
      new JiraClient();
    }).toThrow("Expected at least one argument.");
  });

  it('requires a domain', function() {
    expect(function() {
      new JiraClient({});
    }).toThrow("Expected domain to be defined.");
  });
  
  describe ('#getFavouriteFilters', function() {
    var request, promise;
    
    beforeEach(function() {
      promise = jiraClient.getFavouriteFilters();
      request = jasmine.Ajax.requests.mostRecent();      
    });
    
    it ("should request the current user's favourite filters", function() {
      expect(request.url).toEqual('http://www.example.com/rest/2/filter/favourite');
      expect(request.method).toBe('GET');
    });
    
    it ("should resolve to the retrieved list of filters, if successful", function(done) {
      var expectedResult = [
        { id: 123, name: 'My Filter' }
      ];
      
      request.response(createSuccessfulResponse(expectedResult));
      
      promise.then(function(filters) {
        expect(filters).toEqual(expectedResult);
        done();
      });
    });
  });
  
  describe ('#_get', function() {
    it ("makes a GET request to the given endpoint", function() {
      var promise = jiraClient._get('search');
      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe('http://www.example.com/rest/2/search');
      expect(request.method).toBe('GET');
    });
    
    it ("caches the response if opts.cache = true", function() {
      jiraClient._get('search', { cache: true });
      jiraClient._get('search', { cache: true });
      
      expect(jasmine.Ajax.requests.count()).toBe(1);
    });
    
    it ("doesn't cache the result if opts.cache = false", function() {
      jiraClient._get('search', { cache: false });
      jiraClient._get('search', { cache: false });
      
      expect(jasmine.Ajax.requests.count()).toBe(2);
    });
  });
});
