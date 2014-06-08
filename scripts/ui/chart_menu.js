var $ = require('jquery');
var _ = require('lodash');

function ChartMenu() {
  _.bindAll(this);
}

ChartMenu.prototype.layout = function() {
  function clickHandlerFor(chart) {
    return function() {
      var selectedClass = 'aui-nav-selected';
      var menuItemSelector = '#ghx-chart-nav li';
      $(menuItemSelector).removeClass(selectedClass);
      $(this).closest(menuItemSelector).addClass(selectedClass);
      chart.draw();
    }
  }
  
  var chartNav = $('#ghx-chart-nav');
  if (chartNav.size()) {
    _(this._charts).each(function(chart) {
      var menuLink = $('#' + chart.menuItemId);
      if (!menuLink.size()) {
        $("<li id='" + chart.menuItemId + "' original-title=''><a href='#'>" + chart.title + "</a></li>")
          .click(clickHandlerFor(chart))
          .appendTo('#ghx-chart-nav');        
      } else {
        var lastItem = chartNav.find('li').last();
        if (lastItem.attr('id') != chart.menuItemId) {
          menuLink
            .appendTo('#ghx-chart-nav');
        }
      }
    });
  }  
}

ChartMenu.prototype.configureCharts = function(charts) {
  this._charts = charts;
  
  var configureChartNav = _.bind(function() {
    $("#ghx-chart-nav").on('DOMNodeInserted', this.layout);
    $('#ghx-view-modes .aui-button').click(this.layout);    
  }, this);
  
  var listenForChartNav = function() {
    var chartNav = $('#ghx-chart-nav');
    if (chartNav.size()) {
      $("body").off('DOMNodeInserted', listenForChartNav);
      configureChartNav();
    }
  };
  
  var chartNav = $('#ghx-chart-nav');
  if (chartNav.size()) {  
    configureChartNav();
  } else {
    $("body").on('DOMNodeInserted', listenForChartNav);
  }
  
  this.layout();
}

module.exports = ChartMenu;