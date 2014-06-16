var $ = require('jquery');
var _ = require('lodash');
var Factory = require('rosie').Factory;

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

global.createFakeDom = function() {
  return $(
    "<div>" +
      "<div id='ghx-chart-message'>Message</div>" +
      "<div id='ghx-chart-intro'>Intro</div>" +
      "<div id='ghx-chart-header'>Header</div>" +
      "<div id='ghx-chart-content'>Content</div>" +
    "</div>"
  ).get(0);
}

global.build = _.bind(Factory.build, Factory);
