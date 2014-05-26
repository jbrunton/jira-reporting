$(function() {
  var jiraClient = new JiraClient('https://jbrunton.atlassian.net');
  //   $.ajax({
  //  type: 'GET',
  //  async: false,
  //  url: 'https://jbrunton.atlassian.net/rest/api/2/field/',
  //  contentType: "application/json",
  //  error: function() {
  //    alert('failure');
  //  },
  //  success: function(items) {
  //    console.log(items);
  //  }
  // });
  


  // $(".window-wrapper").on('DOMNodeInserted', function() {
  //   // $('#ghx-chart-nav')
  //   //   .append("<li data-tooltip="Foo" original-title=""><a href="#">Jira Reporting</a></li>");
  //   if ($('#ghx-chart-nav').length > 0) {
  //     alert('');
  //   }
  // });
  
  function getSprintFieldId() {
    return jiraClient.getResourceByName('field', 'Sprint')
      .then(function(field) {
        return field.id;
      });
  }
  
  function getCurrentRapidView() {
    var rapidViewId = /rapidView=(\d*)/.exec(window.location.href)[1];
    return jiraClient.getRapidViews().then(function(views) {
      return _(views).find(function(view) {
        return view.id == rapidViewId;
      });
    });
  }
  
  function getCurrentRapidViewIssues() {
    return getCurrentRapidView().then(function(view) {
      return jiraClient.search(view.filter.query);
    });
  }
  
  function renderReport() {
    $('#ghx-chart-panel-content')
      .empty()
      .append("<table></table>");
      
    var table = $('#ghx-chart-panel-content table');
      
    getCurrentRapidViewIssues()
      .then(function(issues) {
        _(issues).each(function(issue) {
          table.append("<tr><td>" + issue.key + "</td><td>" + issue.fields.summary + "</td></tr>");
        });
      });
  }

  $('#ghx-chart-nav')
    .append("<li id='jira-reporting-link' data-tooltip='Foo' original-title=''><a href='#'>Jira Reporting</a></li>")
    .click(renderReport);
  
  Q.all([
    getSprintFieldId(),
    getCurrentRapidViewIssues()
  ]).spread(function(sprintFieldId, issues) {
    console.log('sprintField: ' + sprintField);
    console.log('issues: ' + issues);
  });
});

  