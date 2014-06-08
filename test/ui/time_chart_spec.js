var TimeChart = require('../../scripts/ui/time_chart');
var moment = require('moment');

describe ("TimeChart", function() {
  var timeChart, series1, series2;
  
  beforeEach(function() {
    timeChart = new TimeChart();

    series1 = {
      key: 'series1',
      data: [
        { date: moment('2 May 2014'), value: 2 },
        { date: moment('8 May 2014'), value: 4 },
        { date: moment('14 May 2014'), value: 6 }        
      ]
    };

    series2 = {
      key: 'series2',
      data: [
        { date: moment('4 May 2014'), value: 3 },
        { date: moment('7 May 2014'), value: 6 },
        { date: moment('10 May 2014'), value: 9 },        
        { date: moment('15 May 2014'), value: 12 }
      ]
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
      timeChart.addSeries(series1);
      timeChart.addSeries(series2);
      var domain = timeChart.getXDomain();
      expect(moment(domain[0])).toBeSameTimeAs(moment('1 May 2014'));
      expect(moment(domain[1])).toBeSameTimeAs(moment('16 May 2014'));
    });
  });
});
