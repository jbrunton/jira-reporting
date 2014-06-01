var _ = require('lodash');
var Q = require('q');
var moment = require('moment');

function isStatusTransition(item) {
  return item.field == "status";
}

function getIssueStartedDate(issue) {
  var startedTransitions = _(issue.changelog.histories)
    .filter(function(entry) {
      return _(entry.items).any(function(item) {
        return isStatusTransition(item) && item.toString == "In Progress";
      });      
    });
  
  if (startedTransitions.any()) {
    return moment(startedTransitions.first().created);
  } else {
    return null;
  }
}

function getIssueCompletedDate(issue) {
  var lastTransition = _(issue.changelog.histories)
    .filter(function(entry) {
      return _(entry.items)
        .any(isStatusTransition);      
    }).last();
  
  if (lastTransition && _(lastTransition.items)
    .find(isStatusTransition).toString == "Done") {
    return moment(lastTransition.created);
  } else {
    return null;
  }
}

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

function getEpicCompletedDate(epic) {
  var issueCompletedDates = _(epic.issues)
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

function EpicDataset(jiraClient, epicLinkFieldId) {
  this._jiraClient = jiraClient;
  this._epicLinkFieldId = epicLinkFieldId;
  
  _.bindAll(this);
}

EpicDataset.prototype.getEpicsForRapidView = function(rapidViewId) {
  var jiraClient = this._jiraClient;
  var self = this;
  return jiraClient.getRapidViewById(rapidViewId)
    .then(function(view) {
      return jiraClient.search("issuetype=Epic AND " + view.filter.query)
        .then(function(epics) {
          self._epics = epics;
          return epics;
        });
    });  
}

EpicDataset.prototype.getIssuesForEpic = function(epic) {
  return this._jiraClient.search({
    query: "cf[" + this._epicLinkFieldId + "]=" + epic.key,
    expand: ['changelog']
  }).then(function(issues) {
    _(issues).each(function(issue) {
      issue.startedDate = getIssueStartedDate(issue);
      issue.completedDate = getIssueCompletedDate(issue);
    });
    return issues;
  });
}

EpicDataset.prototype.expandEpic = function(epic) {
  var epics = this._epics;
  var expandedCallback = this._expandedCallback;

  return this.getIssuesForEpic(epic)
    .then(function(issues) {
      epic.issues = issues;
      epic.startedDate = getEpicStartedDate(epic);
      epic.completedDate = getEpicCompletedDate(epic);
      
      if (expandedCallback) {
        expandedCallback(epic, epics);
      }
      
      return epic;
    });
}

EpicDataset.prototype.expandEpics = function(epics) {
  return Q.all(
    _(epics)
      .map(this.expandEpic)
      .value()
  );
}

EpicDataset.prototype.load = function(rapidViewId, expandedCallback) {
  this._expandedCallback = expandedCallback;
  return this.getEpicsForRapidView(rapidViewId)
    .then(this.expandEpics);
}

module.exports = EpicDataset;


