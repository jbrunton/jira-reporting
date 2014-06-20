var $ = require('jquery');
var JiraClient = require('../../scripts/jira/jira_client');
var RapidView = require('../../scripts/jira/rapid_view');
var Validator = require('../../scripts/validator');

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
    }).toThrow(Validator.messages.requires('opts'));
  });

  it('requires a domain', function() {
    expect(function() {
      new JiraClient({});
    }).toThrow(Validator.messages.requires('domain'));
  });
  
  describe ('#getFavouriteFilters', function() {
    var request, promise;
    
    beforeEach(function() {
      promise = jiraClient.getFavouriteFilters();
      request = jasmine.Ajax.requests.mostRecent();      
    });
    
    it ("requests the current user's favourite filters", function() {
      expect(request.url).toEqual('http://www.example.com/rest/api/2/filter/favourite');
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
  
  describe ('#getRapidViews', function() {
    var request, promise;
    
    beforeEach(function() {
      promise = jiraClient.getRapidViews();
      request = jasmine.Ajax.requests.mostRecent();      
    });
    
    it ("requests the greenhopper rapidviews", function() {
      expect(request.url).toEqual('http://www.example.com/rest/greenhopper/1.0/rapidviews/list');
      expect(request.method).toBe('GET');
    });
    
    it ("returns a promise for a list of rapidviews", function(done) {
      var expectedResult = {
        views: [
          { id: 2, name: "Some View" }
        ]
      };
      
      request.response(createSuccessfulResponse(expectedResult));
      
      promise.then(function(views) {
        expect(views.length).toBe(1);
        expect(views[0] instanceof RapidView).toBe(true);
        expect(views[0].id).toBe(2);
        expect(views[0].name).toBe('Some View');
        done();
      });
    });
  });
  
  describe ('#_get', function() {
    it ("makes a GET request to the given Jira endpoint", function() {
      jiraClient._get('search');
      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe('http://www.example.com/rest/api/2/search');
      expect(request.method).toBe('GET');
    });
    
    it ("makes a GET request to the given greenhopper endpoint, if specified", function() {
      jiraClient._get('rapidviews/list', { greenhopper: true });
      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe('http://www.example.com/rest/greenhopper/1.0/rapidviews/list');
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
