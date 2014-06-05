var _ = require('lodash');

function Epic(jiraClient, issue) {
  this._jiraClient = jiraClient;
  _.assign(this, issue);
  _.bindAll(this);
}

Epic.prototype.analyze = function() {

  var returnSelf = _.bind(function() {
    return this;
  }, this);

  var getIssuesForSelf = _.bind(function(epicLinkFieldId) {
    return this._jiraClient.search({
      query: "cf[" + epicLinkFieldId + "]=" + this.key,
      expand: ['changelog']
    });
  }, this);

  var assignIssues = _.bind(function(issues) {
    this.issues = issues;
  }, this);

  return this._jiraClient
    .getEpicLinkFieldId()
    .then(getIssuesForSelf)
    .then(assignIssues)
    .then(returnSelf);
}

module.exports = Epic;