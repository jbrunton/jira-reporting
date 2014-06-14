var $ = require('jquery');
var _ = require('lodash');
var Chart = require('../../scripts/ui/chart');

describe ('Chart', function() {
  var validOpts;

  beforeEach(function() {
    validOpts = {
      menuItemId: 'some-chart',
      title: 'Some Chart',
      onDraw: function() {}
    };
  });
  
  describe ('constructor', function() {
    
    it('requires an opts param', function() {
      expect(function() {
        new Chart();
      }).toThrow("Expected at least one argument.");
    });

    it('requires an id for the menu item', function() {
      delete validOpts.menuItemId;
      expect(function() {
        new Chart(validOpts);
      }).toThrow("Expected menuItemId to be defined.");
    });
    
    it('requires a title', function() {
      delete validOpts.title;
      expect(function() {
        new Chart(validOpts);
      }).toThrow("Expected title to be defined.");
    });
    
    it('requires an onDraw callback', function() {
      delete validOpts.onDraw;
      expect(function() {
        new Chart(validOpts);
      }).toThrow("Expected onDraw to be defined.");
    });
  });
  
  describe ('#draw', function() {
    var target;
    
    beforeEach(function() {
      target = $(
        "<div>" +
          "<div id='ghx-chart-message'>Message</div>" +
          "<div id='ghx-chart-intro'>Intro</div>" +
          "<div id='ghx-chart-header'>Header</div>" +
          "<div id='ghx-chart-content'>Content</div>" +
        "</div>"
      ).get(0);
    });
    
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
});
