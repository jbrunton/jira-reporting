var _ = require('lodash');
var moment = require('moment');
var DateRange = require('./date_range');

function EpicDataset(epics) {
  this._epics = epics;
  _.bindAll(this);
}

EpicDataset.prototype._dateRangeFilterFor = function(opts) {
  if (opts && opts.filter && opts.filter.dateRange) {
    var dateRangeEnd = moment();
    var dateRangeStart = dateRangeEnd.clone().subtract(moment.duration(opts.filter.dateRange.duration, opts.filter.dateRange.units));
    var dateRange = new DateRange(dateRangeStart, dateRangeEnd);
    var dateRangeFilter = function(d) {
      return dateRange.contains(d.date);
    };
    return dateRangeFilter;
  }

  return _.partial(_.identity, true);
}

EpicDataset.prototype.getCycleTimeData = function(opts) {
  var dateRangeFilter = this._dateRangeFilterFor(opts);
  return _(this._epics)
    .map(function(epic) {
      return {
        date: epic.getCompletedDate(),
        value: epic.getCycleTime('day')
      };
    })
    .filter(function(d) {
      // TODO: why were some dates null?  we shouldn't need to filter here.
      return d.date != null;
    })
    .filter(dateRangeFilter)
    .sortBy(function(d) {
      return d.date.valueOf();
    })
    .value();
}

EpicDataset.prototype.getWorkInProgressData = function(opts) {
  var dateRangeFilter = this._dateRangeFilterFor(opts);
  var events = this.getEvents(),
    firstDate = _(events).first().date,
    lastDate = _(events).last().date;
    
  var data = [];
  var eventIndex = 0,
    wip = 0;
  for (var date = firstDate.clone(); date.isBefore(lastDate); date.add('days', 1)) {
    for (var event = events[eventIndex];
      eventIndex < events.length && event.date.isBefore(date);
      event = events[++eventIndex])
    {
       if (event.key == 'started') {
         wip += 1;
       } else {
         wip -= 1;
       }
    }
    if (date) {
      // TODO: are some dates null?  we shouldn't need to filter here.
      data.push({
        date: date.clone(),
        value: wip
      });
    }
  }
  return _(data)
    .filter(dateRangeFilter)
    .value();
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
