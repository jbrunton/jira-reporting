var Factory = require('rosie').Factory;
var RapidView = require('../../scripts/jira/rapid_view');
var _ = require('lodash');

function createRapidView(attrs) {
  return new RapidView(attrs.jiraClient, _(attrs).omit('jiraClient').value());
}

Factory.define('rapid_view', createRapidView)
  .sequence('id')
  .attr('jiraClient', function() {
    return Factory.build('jira_client');
  })
  .attr('name', ['id'], function(id) {
    return "Demo RapidView " + id;
  });