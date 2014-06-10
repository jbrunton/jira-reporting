var Factory = require('rosie').Factory;
var JiraClient = require('../../scripts/jira/jira_client');

Factory.define('jira_client', JiraClient)
  .attr('domain', 'http://www.example.com');

