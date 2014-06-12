var Factory = require('rosie').Factory;
var Sprint = require('../../scripts/jira/sprint');
var _ = require('lodash');

function createSprint(attrs) {
  return new Sprint(attrs.jiraClient, attrs.rapidViewId, _(attrs).omit('jiraClient', 'rapidViewId').value());
}

Factory.define('sprint', createSprint)
  .sequence('id')
  .sequence('rapidViewId')
  .attr('jiraClient', function() {
    return Factory.build('jira_client');
  })
  .attr('name', ['id'], function(id) {
    return "Demo Sprint " + id;
  });
