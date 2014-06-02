var _ = require('lodash');

function Epic(jiraClient, issue) {
  this._jiraClient = jiraClient;
  _.assign(this, issue);
  _.bindAll(this);
}

Epic.prototype.getIssues = function(epicLinkFieldId) {
  var self = this;
  return this._jiraClient.search({
    query: "cf[" + epicLinkFieldId + "]=" + this.key,
    expand: ['changelog']
  }).then(function(issues) {
    // _(issues).each(function(issue) {
    //   // issue.startedDate = getIssueStartedDate(issue);
    //   // issue.completedDate = getIssueCompletedDate(issue);
    // });
    return self;
  });
}

module.exports = Epic;