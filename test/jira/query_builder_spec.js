var QueryBuilder = require('../../scripts/jira/query_builder');

describe ('QueryBuilder', function() {
  var builder;
  
  beforeEach(function() {
    builder = new QueryBuilder();
  });
  
  describe ('constructor', function() {
    it ("sets the current query to null by default", function() {
      expect(new QueryBuilder().getQuery()).toBe(null);
    });
    
    it ("initializes the current query, if given as an argument", function() {
      expect(new QueryBuilder("some query").getQuery()).toEqual("some query");
    });
  });
  
  describe ('#and', function() {
    it ("returns the builder", function() {
      expect(builder.and("some query")).toBe(builder);
    });
    
    it ("sets the query to the given argument, if the current query is null", function() {
      builder.and("some query");
      expect(builder.getQuery()).toEqual("some query");
    });
    
    it ("ANDs the current query with the given argument, if the current query is not null", function() {
      builder.and("some query");
      builder.and("another query");
      expect(builder.getQuery()).toEqual("(some query) AND (another query)");
    });
    
    it ("strips the query of any ORDER BY clauses", function() {
      builder.and("some query ORDER BY Rank ASC");
      expect(builder.getQuery()).toEqual("some query");
    });
  });
});