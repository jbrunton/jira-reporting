var $ = require('jquery');
var _ = require('lodash');
var Chart = require('../../scripts/ui/chart');
var Validator = require('../../scripts/validator');

describe ('Chart', function() {
  var validOpts, target, jiraClient;
  
  beforeEach(function() {
    validOpts = {
      menuItemId: 'some-chart',
      title: 'Some Chart',
      onDraw: function() {}
    };
    
    jiraClient = build('jira_client');

    target = $(
      "<div>" +
        "<div id='ghx-chart-message'>Message</div>" +
        "<div id='ghx-chart-intro'>Intro</div>" +
        "<div id='ghx-chart-header'>Header</div>" +
        "<div id='ghx-chart-content'>Content</div>" +
      "</div>"
    ).get(0);
  });
  
  describe ('constructor', function() {
    it ("requires a jira client", function() {
      expect(function() {
        new Chart(null, validOpts);
      }).toThrow(Validator.messages.requires('jiraClient'));
    });
    
    it ('requires an opts param', function() {
      expect(function() {
        new Chart(jiraClient, null);
      }).toThrow(Validator.messages.requires('opts'));
    });

    it ('requires an id for the menu item', function() {
      delete validOpts.menuItemId;
      expect(function() {
        new Chart(jiraClient, validOpts);
      }).toThrow(Validator.messages.requires('menuItemId'));
    });
    
    it ('requires a title', function() {
      delete validOpts.title;
      expect(function() {
        new Chart(jiraClient, validOpts);
      }).toThrow(Validator.messages.requires('title'));
    });
  });
  
  describe ('#draw', function() {    
    it ("sets the value of getTarget()", function() {
      var chart = new Chart(jiraClient, validOpts);
      chart.draw(target);
      expect(chart.getTarget()).toBe($(target).find('#ghx-chart-content').get(0));
    });

    it ("clears the ghx message, intro and header elements", function() {
      new Chart(jiraClient, validOpts).draw(target);
      expect($(target).find('#ghx-chart-message')).toBeEmpty();
    });
    
    it ("invokes the given onDraw method on the ghx chart", function() {
      new Chart(jiraClient, _.assign(validOpts, {
        onDraw: function() {
          $("<p>Hello, World!</p>").appendTo(this.getTarget());
        }
      })).draw(target);
      expect($(target).find('#ghx-chart-content p')).toHaveText("Hello, World!");
    });
  });
  
  describe ('#onUpdate', function() {
    var someInput, someOptions, chart, chartContent;
    
    beforeEach(function() {
      chart = new Chart(jiraClient, _.assign(validOpts, {
        onDraw: function() {
          someInput = $("<input id='some-input'>").appendTo(this.getTarget());
          someOptions = $("<select id='some-options'><option value='some-value'>Some Value</option></select>").appendTo(this.getTarget());
        },
        onUpdate: function() {}
      }));
      chart.draw(target);
      chartContent = $(target).find('#ghx-chart-content').get(0);
      spyOn(chart, 'onUpdate');      
    });
    
    it ("invokes the onUpdate handler if an input blur event is fired", function() {   
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith(jasmine.any(Object));
    });
    
    it ("invokes the onUpdate handler if a select change event is fired", function() {
      someOptions.change();
      expect(chart.onUpdate).toHaveBeenCalledWith(jasmine.any(Object));
    });

    it ("passes a dictionary of all input values to the onUpdate handler when invoked", function() {   
      someInput.val('some value');
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith({ 'some-input': 'some value', 'some-options': 'some-value' });
    });
    
    it ("converts valid input values to numbers", function() {
      someInput.val('123');
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith({ 'some-input': 123, 'some-options': 'some-value' });
    });

    it ("doesn't coerce the empty string to 0", function() {
      someInput.val('');
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith({ 'some-input': '', 'some-options': 'some-value' });
    });
  });
});
