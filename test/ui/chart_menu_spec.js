var ChartMenu = require('../../scripts/ui/chart_menu');
var Chart = require('../../scripts/ui/chart');
var $ = require('jquery');
var _ = require('lodash');

function navIds(chartNav) {
  return _(chartNav.find('#ghx-chart-nav li').toArray()).map(function(el) {
    return el.id;
  }).value();
}

describe ('ChartMenu', function() {
  var chartMenu;

  beforeEach(function() {
    chartMenu = new ChartMenu();
    chartMenu.configureCharts([
      new Chart({
        menuItemId: 'custom-chart',
        title: 'Custom Chart',
        onDraw: function() {}
      })
    ]);
  });

  describe ('#layout', function() {
    it ('appends a menu item to the target element', function() {
      var chartNav = $("<div><ul id='ghx-chart-nav'><li id='jira-chart'></li></ul></div>");
      chartMenu.layout(chartNav.get(0));
      expect(navIds(chartNav)).toEqual(['jira-chart', 'custom-chart']);
    });

    it ('repositions menu items if Jira amends the order', function() {
      var chartNav = $("<div><ul id='ghx-chart-nav'><li id='custom-chart'></li><li id='jira-chart'></li></ul></div>");
      chartMenu.layout(chartNav.get(0));
      expect(navIds(chartNav)).toEqual(['jira-chart', 'custom-chart']);
    });
  });
});
