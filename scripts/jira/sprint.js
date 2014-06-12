var _ = require('lodash');
var Q = require('q');
var $ = require('jquery');

function Sprint(jiraClient, rapidViewId, sprintAttrs) {
  this._jiraClient = jiraClient;
  this.rapidViewId = rapidViewId;
  _.assign(this, sprintAttrs);
  _.bindAll(this);
}

Sprint.prototype.getReport = function() {
  var deferred = Q.defer();
  var self = this;
  $.ajax({
    type: 'GET',
    url: this._jiraClient.getDomain() + "/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=" + this.rapidViewId + "&sprintId=" + this.id,
    contentType: "application/json",
    error: function() {
      deferred.reject();
    },
    success: function(report) {
      deferred.resolve(report);
    }
  });
  return deferred.promise;
}

module.exports = Sprint;
