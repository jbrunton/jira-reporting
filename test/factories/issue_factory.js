var Factory = require('rosie').Factory;
var Issue = require('../../scripts/jira/issue');

Factory.define('issue', Issue)
  .sequence('id')
  .attr('key', ['id'], function(id) {
    return "DEMO-" + id;
  })
  .attr('summary', ['id'], function(id) {
    return 'Demo Issue ' + id;
  })
  .attr('fields', ['summary'], function(summary) {
    return {
      summary: summary
    };
  })
  .attr('changelog', function() {
    return {
      histories: []
    };
  });
