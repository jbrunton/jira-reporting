function QueryBuilder(query) {
  this._query = query == undefined ? null : query;
}

QueryBuilder.prototype.getQuery = function() {
  return this._query;
}

QueryBuilder.prototype.and = function(query) {
  var cleanQuery = this._cleanQuery(query);
  if (this._query == null) {
    this._query = cleanQuery;
  } else {
    this._query = "(" + this._query + ") AND (" + cleanQuery + ")";
  }
  return this;
}

QueryBuilder.prototype._cleanQuery = function(query) {
  if (/ORDER BY/.exec(query)) {
    return /(.*)(\sORDER BY.*)/.exec(query)[1];
  } else {
    return query;
  }    
}

module.exports = QueryBuilder;
