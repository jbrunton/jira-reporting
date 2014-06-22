var $ = require('jquery');
var Validator = require('../validator');

function UiHelper(jiraClient) {
  new Validator()
    .requires(jiraClient, 'jiraClient');
    
  this._jiraClient = jiraClient;
}

UiHelper.prototype.loadFilters = function(target) {
  var filterOptionsTemplate = require('./templates/filter_options.hbs');
  return this._jiraClient.getFavouriteFilters()
    .then(function(filters) {
      $(target).html(filterOptionsTemplate(filters));
    });
}

module.exports = UiHelper;
