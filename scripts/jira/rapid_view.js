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

RapidView.prototype.getEpics = function() {
  var self = this;
  return this._jiraClient
    .search("issuetype=Epic AND " + this.filter.query)
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