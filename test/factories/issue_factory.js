var Factory = require('rosie').Factory;
var Issue = require('../../scripts/jira/issue');

Factory.define('issue', Issue)
  .sequence('id')
  .attr('key', ['id'], function(id) {
    return "DEMO-" + id;
  })
  .attr('fields', ['id'], function(id) {
    return {
      summary: 'Demo Issue ' + id
    };
  })
  .attr('changelog', function() {
    return {
      histories: []
    };
  });
