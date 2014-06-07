var TimeChart = require('../../scripts/ui/time_chart');
var moment = require('moment');

describe ("TimeChart", function() {
  var timeChart, series1;
  
  beforeEach(function() {
    var data = [
      { date: moment('1 May 2014'), value1: 2 },
      { date: moment('8 May 2014'), value1: 4 },
      { date: moment('15 May 2014'), value1: 6 }
    ];
    timeChart = new TimeChart(data);

    series1 = {
      key: 'series1',
      getY: function(d) {
        return d.value1;
      }
    };
  });
  
  describe ("#addSeries", function() {
    it ("adds the given series", function() {
      timeChart.addSeries(series1);
      expect(timeChart.getSeries(series1.key)).toBe(series1);
    });
  });
  
  describe ("#getXDomain", function() {
    it ("returns the domain of x-axis values", function() {
      var domain = timeChart.getXDomain();
      expect(domain).toEqual([
        moment('1 May 2014').toDate(),
        moment('15 May 2014').toDate()
      ]);
    });
  });
  
  describe ("#draw", function() {
    
  });
});
