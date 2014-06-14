beforeEach(function() {
  jasmine.Ajax.install();
  jasmine.Ajax.requests.reset();
});

global.createSuccessfulResponse = function(responseData) {
  var response = {
    status: 200,
    responseText: JSON.stringify(responseData)
  };

  return response;
}
