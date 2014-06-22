var $ = require('jquery');
var Q = require('q');
var UiHelper = require('../../scripts/ui/ui_helper');
var Validator = require('../../scripts/validator');

describe ('UiHelper', function() {
  var uiHelper, jiraClient;
  
  beforeEach(function() {
    jiraClient = build('jira_client');
    uiHelper = new UiHelper(jiraClient);    
  });
  
  describe ('constructor', function() {
    it ("initializes the instance", function() {
      expect(uiHelper._jiraClient).toBe(jiraClient);
    });
    
    it ("requires a JiraClient", function() {
      expect(function() {
        new UiHelper(null);
      }).toThrow(Validator.messages.requires('jiraClient'));
    });
  });
  
  describe ('#loadFilters', function() {
    var expectedFilter, target;
    
    beforeEach(function() {
      target = $("<select id='filter'></select>").get(0);
      expectedFilter = { id: 123, name: 'Some Filter' };
      spyOn(jiraClient, 'getFavouriteFilters')
        .and.returnValue(Q([expectedFilter]));
    });
    
    it ("adds a None option", function(done) {
      uiHelper.loadFilters(target)
        .then(function() {
          var option = $(target).find('option').get(0);
          expect(option).toHaveAttr('value', '-1');
          expect(option).toHaveText('None');
          done();
        });      
    });
    
    it ("adds the user's favourite filters to the given select", function(done) {
      uiHelper.loadFilters(target)
        .then(function() {
          var option = $(target).find('option').get(1);
          expect(option).toHaveAttr('value', String(expectedFilter.id));
          expect(option).toHaveText(expectedFilter.name);
          done();
        });
    });
  });
});
