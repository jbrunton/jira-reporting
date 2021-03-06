var _ = require('lodash');
var $ = require('jquery');
var Q = require('q');
var Epic = require('./epic');
var Sprint = require('./sprint');

function RapidView(jiraClient, view) {
  this._jiraClient = jiraClient;
  _.assign(this, view);
  _.bindAll(this);
}

RapidView.prototype.getEpics = function(opts) {
  var self = this;
  
  var findFilter = _.bind(function() {
    if (opts.filter) {
      return this._jiraClient.getFilterById(opts.filter);
    } else {
      return Q(null);
    }
  }, this);
  
  var performSearch = _.bind(function(filter) {
    var query = "issuetype=Epic";
    if (filter) {
      query += " AND (" + filter.jql + ")";
    }
    if (/ORDER BY/.exec(this.filter.query)) {
      var viewFilter = /(.*)(ORDER BY.*)/.exec(this.filter.query)[1];
    } else {
      var viewFilter = this.filter.query;
    }
    query += " AND (" + viewFilter + ")";
    
    return this._jiraClient.search(query);
  }, this);

  return findFilter()
    .then(performSearch)
    .then(function(issues) {
      return _(issues)
        .map(function(issue) {
          return new Epic(self._jiraClient, issue);
        }).value();
      });
}

RapidView.prototype.getSprints = function() {
  var deferred = Q.defer();
  var self = this;
  $.ajax({
    type: 'GET',
    url: this._jiraClient.getDomain() + "/rest/greenhopper/1.0/sprintquery/" + this.id,
    contentType: "application/json",
    error: function() {
      deferred.reject();
    },
    success: function(result) {
      deferred.resolve(
        _(result.sprints)
          .map(function(sprintAttrs) {
            return new Sprint(self._jiraClient, self.id, sprintAttrs);
          }).value()
      );
    }
  });
  return deferred.promise;
}

module.exports = RapidView;