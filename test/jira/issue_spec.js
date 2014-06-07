var Factory = require('rosie').Factory;
var moment = require('moment');

describe ("Issue", function() {
  describe ("#getStartedDate", function() {    
    it ("returns null if the issue is not started", function() {
      var issue = Factory.build('issue');
      expect(issue.getStartedDate()).toBe(null);
    });
    
    it ("returns the first started date if the issue is started", function() {
      var issue = Factory.build('issue', {
        changelog: {
          histories: [
            {
              created: "2014-06-05T12:00:00.000+0100",
              items: [
                {
                  field: "status",
                  toString: "In Progress"
                }
              ]
            },
            {
              created: "2014-06-05T18:00:00.000+0100",
              items: [
                {
                  field: "status",
                  toString: "In Progress"
                }
              ]
            }
          ]
        }
      });
      
      var expectedDate = moment("2014-06-05T12:00:00.000+0100");
      expect(issue.getStartedDate()).toBeSameTimeAs(expectedDate);
    });
  });

  describe ("#getCompletedDate", function() {    
    it ("returns null if the issue is not completed", function() {
      var issue = Factory.build('issue');      
      expect(issue.getCompletedDate()).toBe(null);
    });
    
    it ("returns the last completed date if the issue is completed", function() {
      var issue = Factory.build('issue', {
        changelog: {
          histories: [
            {
              created: "2014-06-05T12:00:00.000+0100",
              items: [
                {
                  field: "status",
                  toString: "Done"
                }
              ]
            },
            {
              created: "2014-06-05T18:00:00.000+0100",
              items: [
                {
                  field: "status",
                  toString: "Done"
                }
              ]
            }
          ]
        }
      });

      var expectedDate = moment("2014-06-05T18:00:00.000+0100");
      expect(issue.getCompletedDate()).toBeSameTimeAs(expectedDate);
    });
    
    it ("returns null if the issue was completed but then started again", function() {
      var issue = Factory.build('issue', {
        changelog: {
          histories: [
            {
              created: "2014-06-05T12:00:00.000+0100",
              items: [
                {
                  field: "status",
                  toString: "Done"
                }
              ]
            },
            {
              created: "2014-06-05T18:00:00.000+0100",
              items: [
                {
                  field: "status",
                  toString: "Started"
                }
              ]
            }
          ]
        }
      });

      expect(issue.getCompletedDate()).toBe(null);      
    });
  });
});
