var _ = require('lodash');

function EpicDataset(epics) {
  this._epics = epics;
}

EpicDataset.prototype.getCycleTimeData = function() {
  return _(this._epics)
    .map(function(epic) {
      return {
        date: epic.getCompletedDate(),
        value: epic.getCycleTime('day')
      };
    }).value();
}

EpicDataset.prototype.getEvents = function(filterKey) {
  function concatEvents(events, epic) {
    function eventsFor(key) {
      var fieldName = key + 'Date';
      var date = epic[fieldName];
      if (date) {
        return [{ key: key, date: date, dateEpoch: date.valueOf(), epic: epic }]
      } else {
        return [];
      }
    }
    
    return events
      .concat(eventsFor('started'))
      .concat(eventsFor('completed'));
  }

  if (!this._events) {
    this._events = _(
      _(this._epics)
        .reduce(concatEvents, [])
    ).sortBy('dateEpoch').value();
  }
  
  if (filterKey) {
    return _(this._events)
      .where({ key: filterKey});
  } else {
    return this._events;
  }
}

EpicDataset.prototype.getEventsInRange = function(dateRange, filterKey) {
  function filterByRange(event) {
    return dateRange.contains(event.date);
  }
  
  var all = this.getEvents(filterKey);
  return _(all)
    .filter(filterByRange)
    .value();
}

EpicDataset.prototype.getCycleTimeForRange = function(dateRange) {
  function averageCycleTime(events) {
    function addCycleTime(sum, epic) {
      return epic.getCycleTime('week');
    }
    
    var totalCycleTime = _(events)
      .pluck('epic')
      .reduce(addCycleTime, 0);
    
    return totalCycleTime / events.length;
  }
  
  var eventsInRange = this.getEventsInRange(dateRange, 'completed');
  return averageCycleTime(eventsInRange);
}

EpicDataset.prototype.getThroughputForRange = function(dateRange) {
  var eventsInRange = this.getEventsInRange(dateRange, 'completed');
  return eventsInRange.length;
}

module.exports = EpicDataset;
