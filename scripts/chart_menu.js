var $ = require('jquery');
var _ = require('lodash');

function ChartMenu() {
  _.bindAll(this);
}

ChartMenu.prototype.layout = function() {
  function clickHandlerFor(item) {
    return function() {
      var selectedClass = 'aui-nav-selected';
      var menuItemSelector = '#ghx-chart-nav li';
      $(menuItemSelector).removeClass(selectedClass);
      $(this).closest(menuItemSelector).addClass(selectedClass);
      item.render();
    }
  }
  
  var chartNav = $('#ghx-chart-nav');
  if (chartNav.size()) {
    _(this._items).each(function(item) {
      var menuLink = $('#' + item.id);
      if (!menuLink.size()) {
        $("<li id='" + item.id + "' original-title=''><a href='#'>" + item.title + "</a></li>")
          .click(clickHandlerFor(item))
          .appendTo('#ghx-chart-nav');        
      } else {
        menuLink
          .appendTo('#ghx-chart-nav');
      }
    });
  }  
}

ChartMenu.prototype.init = function(opts) {
  this._items = opts.items;
  
  $("#ghx-chart-nav").on('DOMNodeInserted', this.layout);
  $('#ghx-view-modes .aui-button').click(this.layout);
  
  this.layout();
}

module.exports = ChartMenu;