var $ = require('jquery');
var _ = require('lodash');

function ChartMenu() {
  _.bindAll(this);
}

ChartMenu.prototype.layout = function(target) {
  target = $(target || 'body');
  
  function clickHandlerFor(chart) {
    return function() {
      var selectedClass = 'aui-nav-selected';
      var menuItemSelector = '#ghx-chart-nav li';
      target.find(menuItemSelector).removeClass(selectedClass);
      $(this).closest(menuItemSelector).addClass(selectedClass);
      chart.draw(target);
    }
  }
  
  function findMenuLink(chart) {
    return target.find('#' + chart.menuItemId);
  }
  
  function createMenuLink(chart) {
    return $("<li id='" + chart.menuItemId + "' original-title=''><a href='#'>" + chart.title + "</a></li>")
      .click(clickHandlerFor(chart))
  }
  
  var chartNav = target.find('#ghx-chart-nav');
  var chartCount = this._charts.length;
  if (chartNav.size()) {
    _(this._charts).each(function(chart) {
      var menuLink = findMenuLink(chart)
      if (!menuLink.size()) {
        createMenuLink(chart).appendTo(chartNav);
      }
    });
    var linkCount = chartNav.find('li').size();
    _(this._charts).each(function(chart) {
      var menuLink = findMenuLink(chart)
      var menuLinkIndex = chartNav.find('li').index(menuLink);
      if (menuLinkIndex < linkCount - chartCount) {
        menuLink.appendTo(chartNav);
      }
    });
  }  
}

ChartMenu.prototype.configureCharts = function(charts) {
  this._charts = charts;
  
  var updateLayout = _.bind(function() {
    this.layout();
  }, this);

  var configureChartNav = _.bind(function() {
    $("#ghx-chart-nav").on('DOMNodeInserted', updateLayout);
    $('#ghx-view-modes .aui-button').click(updateLayout);    
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