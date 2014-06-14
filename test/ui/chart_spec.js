var Chart = require('../../scripts/ui/chart');

describe ('Chart', function() {
  describe ('constructor', function() {
    var opts;
    
    beforeEach(function() {
      opts = {
        menuItemId: 'some-chart',
        title: 'Some Chart',
        onDraw: function() {}
      };
    });
    
    it('requires an opts param', function() {
      expect(function() {
        new Chart();
      }).toThrow("Expected at least one argument.");
    });

    it('requires an id for the menu item', function() {
      delete opts.menuItemId;
      expect(function() {
        new Chart(opts);
      }).toThrow("Expected menuItemId to be defined.");
    });
    
    it('requires a title', function() {
      delete opts.title;
      expect(function() {
        new Chart(opts);
      }).toThrow("Expected title to be defined.");
    });
    
    it('requires an onDraw callback', function() {
      delete opts.onDraw;
      expect(function() {
        new Chart(opts);
      }).toThrow("Expected onDraw to be defined.");
    });
  });
});
