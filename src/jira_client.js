function JiraClient(domain) {
  if (!domain) {
    throw "Expected domain to be specified.";
  }
  
  this._domain = domain;
}

JiraClient.prototype.getDomain = function() {
  return this._domain;
}

JiraClient.prototype.getResource = function(resourceType) {
  var deferred = Q.defer();
  $.ajax({
		type: 'GET',
		url: this._domain + "/rest/api/2/" + resourceType + "/",
		contentType: "application/json",
		error: function() {
			deferred.reject();
		},
		success: function(items) {
			deferred.resolve(items);
		}
	});
	return deferred.promise;  
}

JiraClient.prototype.getResourceByName = function(resourceType, resourceName) {
  var deferred = Q.defer();
  this.getResource(resourceType).then(function(resources) {
    var resource = _.find(resources, function(resource) {
      return resource.name == resourceName;
    });
    if (resource) {
      deferred.resolve(resource);
    } else {
      deferred.reject();
    }
  });
  return deferred.promise;
}

JiraClient.prototype.search = function(jql) {
  var deferred = Q.defer();
  $.ajax({
		type: 'GET',
		url: this._domain + "/rest/api/2/search/?maxResults=9999&jql=" + jql,
		contentType: "application/json",
		error: function() {
			deferred.reject();
		},
		success: function(results) {
			deferred.resolve(results.issues);
		}
	});
	return deferred.promise;
}

JiraClient.prototype.getRapidViews = function() {
  var deferred = Q.defer();
  $.ajax({
		type: 'GET',
		url: this._domain + "/rest/greenhopper/1.0/rapidviews/list",
		contentType: "application/json",
		error: function() {
			deferred.reject();
		},
		success: function(results) {
			deferred.resolve(results.views);
		}
	});
	return deferred.promise;
}