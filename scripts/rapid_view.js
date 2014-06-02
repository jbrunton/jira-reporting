var _ = require('lodash');
var Epic = require('./epic');

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

module.exports = RapidView;