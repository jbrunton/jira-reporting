var _ = require('lodash');
var moment = require('moment');
var Q = require('q');

function Issue(issue) {
  _.assign(this, issue);
  _.bindAll(this);
}

function isStatusTransition(item) {
  return item.field == "status";  
}

function isStartedTransition(item) {
  // TODO: allow this to be configured
  return isStatusTransition(item)
    && (item.toString == "In Progress" || item.toString == "Started");
}

function isCompletedTransition(item) {
  // TODO: allow this to be configured
  return isStatusTransition(item)
    && (item.toString == "Done" || item.toString == "Closed");  
}

Issue.prototype.getStartedDate = function() {
  var startedTransitions = _(this.changelog.histories)
    .filter(function(entry) {
      return _(entry.items).any(function(item) {
        return isStatusTransition(item);
      });
    });

  if (startedTransitions.any()) {
    return moment(startedTransitions.first().created);
  } else {
    return null;
  }
}

Issue.prototype.getCompletedDate = function() {
  var lastTransition = _(this.changelog.histories)
    .filter(function(entry) {
      return _(entry.items)
        .any(isStatusTransition);
    }).last();

  if (lastTransition && _(lastTransition.items)
    .any(isCompletedTransition)) {
    return moment(lastTransition.created);
  } else {
    return null;
  }
}

Issue.prototype.analyze = function() {
  if (!this.startedDate) {
    this.startedDate = this.getStartedDate();
  }
  if (!this.completedDate) {
    this.completedDate = this.getCompletedDate();    
  }

  return Q(this);
}

module.exports = Issue;