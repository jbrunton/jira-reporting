var $ = require('jquery');
var _ = require('lodash');
var Chart = require('../../scripts/ui/chart');

describe ('Chart', function() {
  var validOpts, target;
  
  beforeEach(function() {
    validOpts = {
      menuItemId: 'some-chart',
      title: 'Some Chart',
      onDraw: function() {}
    };

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
    
    it ('requires an opts param', function() {
      expect(function() {
        new Chart();
      }).toThrow("Expected at least one argument.");
    });

    it ('requires an id for the menu item', function() {
      delete validOpts.menuItemId;
      expect(function() {
        new Chart(validOpts);
      }).toThrow("Expected menuItemId to be defined.");
    });
    
    it ('requires a title', function() {
      delete validOpts.title;
      expect(function() {
        new Chart(validOpts);
      }).toThrow("Expected title to be defined.");
    });
    
    it ('requires an onDraw callback', function() {
      delete validOpts.onDraw;
      expect(function() {
        new Chart(validOpts);
      }).toThrow("Expected onDraw to be defined.");
    });
  });
  
  describe ('#draw', function() {    
    it ("clears the ghx message, intro and header elements", function() {
      new Chart(validOpts).draw(target);
      expect($(target).find('#ghx-chart-message')).toBeEmpty();
    });
    
    it ("invokes the given onDraw method on the ghx chart", function() {
      new Chart(_.assign(validOpts, {
        onDraw: function(target) {
          $("<p>Hello, World!</p>").appendTo(target);
        }
      })).draw(target);
      expect($(target).find('#ghx-chart-content p')).toHaveText("Hello, World!");
    });
  });
  
  describe ('#onUpdate', function() {
    var someInput, someOptions, chart, chartContent;
    
    beforeEach(function() {
      chart = new Chart(_.assign(validOpts, {
        onDraw: function(target) {
          someInput = $("<input id='some-input'>").appendTo(target);
          someOptions = $("<select id='some-options'><option value='some-value'>Some Value</option></select>").appendTo(target);
        },
        onUpdate: function() {}
      }));
      chart.draw(target);
      chartContent = $(target).find('#ghx-chart-content').get(0);
      spyOn(chart, 'onUpdate');      
    });
    
    it ("invokes the onUpdate handler if an input blur event is fired", function() {   
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith(chartContent, jasmine.any(Object));
    });
    
    it ("invokes the onUpdate handler if a select change event is fired", function() {
      someOptions.change();
      expect(chart.onUpdate).toHaveBeenCalledWith(chartContent, jasmine.any(Object));
    });

    it ("passes a dictionary of all input values to the onUpdate handler when invoked", function() {   
      someInput.val('some value');
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith(chartContent, { 'some-input': 'some value', 'some-options': 'some-value' });
    });
    
    it ("converts valid input values to numbers", function() {
      someInput.val('123');
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith(chartContent, { 'some-input': 123, 'some-options': 'some-value' });
    });

    it ("doesn't coerce the empty string to 0", function() {
      someInput.val('');
      someInput.blur();
      expect(chart.onUpdate).toHaveBeenCalledWith(chartContent, { 'some-input': '', 'some-options': 'some-value' });
    });
  });
});
