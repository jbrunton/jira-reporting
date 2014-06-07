function DateRange(start, end) {
  this._start = start;
  this._end = end;
}

DateRange.prototype.contains = function(date) {
  return (
    this._start.isBefore(date) || this._start.isSame(date)
  ) && this._end.isAfter(date);
}

module.exports = DateRange;
