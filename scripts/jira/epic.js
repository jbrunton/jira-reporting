var _ = require('lodash');
var Q = require('q');
var Issue = require('./issue');

function Epic(jiraClient, issue) {
  this._jiraClient = jiraClient;
  _.assign(this, issue);
  _.bindAll(this);
}

Epic.prototype.getCycleTime = function(unit) {
  if (this.startedDate && this.completedDate) {
    return this.completedDate.diff(this.startedDate, unit, true);
  }
}

Epic.prototype.getCompletedDate = function() {
  var issueCompletedDates = _(this.issues)
    .map(function(issue) {
      return issue.completedDate;
    });

  if (issueCompletedDates.any()
    && issueCompletedDates.all())
  {
    var completedDate = issueCompletedDates
      .max(function(date) {
        return date.unix();
      })
      .value();

    return completedDate;
  } else {
    return null;
  }
}

Epic.prototype.analyze = function() {

  var returnSelf = _.bind(function() {
    return Q(this);
  }, this);

  var getIssuesForSelf = _.bind(function(epicLinkFieldId) {
    return this._jiraClient.search({
      query: "cf[" + epicLinkFieldId + "]=" + this.key,
      expand: ['changelog']
    });
  }, this);

  var createIssue = _.bind(function(issue) {
    return new Issue(issue);
  }, this);

  var assignIssues = _.bind(function(issues) {
    this.issues = _(issues)
      .map(createIssue)
      .value();
    return Q(this);
  }, this);

  var analyzeIssues = _.bind(function() {
    return Q.all(
      _(this.issues).map(function(issue) {
        return issue.analyze();
      })
    );
  }, this);

  function getEpicStartedDate(epic) {
    var issueStartedDates = _(epic.issues)
      .map(function(issue) {
        return issue.startedDate;
      })
      .compact();

    if (issueStartedDates.any()) {
      var startedDate = issueStartedDates
        .min(function(date) {
          return date.unix();
        })
        .value();

      return startedDate;
    } else {
      return null
    }
  }

  var assignDates = _.bind(function(issues) {
    this.startedDate = getEpicStartedDate(this);
    this.completedDate = this.getCompletedDate();
    return Q(this);
  }, this);

  return this._jiraClient
    .getEpicLinkFieldId()
    .then(getIssuesForSelf)
    .then(assignIssues)
    .then(analyzeIssues)
    .then(assignDates)
}

module.exports = Epic;