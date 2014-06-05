var _ = require('lodash');
var Issue = require('./issue');

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

  var createIssue = _.bind(function(issue) {
    return new Issue(this._jiraClient, issue);
  }, this);

  var assignIssues = _.bind(function(issues) {
    this.issues = _(issues)
      .map(createIssue)
      .value();
  }, this);

  return this._jiraClient
    .getEpicLinkFieldId()
    .then(getIssuesForSelf)
    .then(assignIssues)
    .then(returnSelf);
}

module.exports = Epic;