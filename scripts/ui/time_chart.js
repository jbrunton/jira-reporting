var _ = require('lodash');
var d3 = require('d3');
var moment = require('moment');

function TimeChart(data) {
  this._data = data;
  this._series = [];
  _.bindAll(this);
}

TimeChart.prototype.addSeries = function(series) {
  this._series.push(series);
}

TimeChart.prototype.getSeries = function(key) {
  return _(this._series).find(function(series) {
    return series.key == key;
  });
}

TimeChart.prototype.getXDomain = function() {
  if (!this._xDomain) {
    var dates = _(this._data)
      .pluck('date');
    var startDate = dates
      .min(function(moment) {
        return moment.valueOf();
      }).value().toDate();
    var endDate = dates
      .max(function(moment) {
        return moment.valueOf();
      }).value().toDate();
    this._xDomain = [startDate, endDate];
  }

  return this._xDomain;
}

TimeChart.prototype.drawSeries = function(series) {
  
}

TimeChart.prototype.draw = function(target) {
  var w = 1000;
	var h = 300;
	var padding = 30;
	
	
	var xScale = d3.time.scale()
	  .domain(this.getXDomain())
		.range([padding, w - padding * 2]);

	var xAxis = d3.svg.axis()
	  .scale(xScale)
	  .orient("bottom")
    .ticks(5)
    .tickFormat(function(d) {
		  return moment(d).format("DD MMM YYYY");
	  });

	var svg = d3.select(target)
		.append("svg")
		.attr("width", w)
		.attr("height", h);
		
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis);
		
	var drawSeries = _.bind(function(series) {
	  var yDomain = [0, d3.max(this._data, function(d) { return series.getY(d); })];

    var yScale = d3.scale.linear()
      .domain(yDomain)
      .range([h - padding, padding]);

    var rScale = d3.scale.linear()
      .domain(yDomain)
      .range([2, 5]);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .ticks(5);
      
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + padding + ",0)")
      .call(yAxis);
      
    svg.selectAll("circle")
      .data(this._data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
         return xScale(d.date);
      })
      .attr("cy", function(d) {
         return yScale(series.getY(d));
      })
      .attr("r", function(d) {
         return rScale(series.getY(d));
      });
	}, this);
		
	_(this._series)
	  .each(drawSeries);


  		//Create circles
      // svg.selectAll("circle")
      //    .data(dataset)
      //    .enter()
      //    .append("circle")
      //    .attr("cx", function(d) {
      //        return xScale(d.date);
      //    })
      //    .attr("cy", function(d) {
      //        return yScale(d.cycleTime);
      //    })
      //    .attr("r", function(d) {
      //        return rScale(d.cycleTime);
      //    });



  

		
		//Create labels
    // svg.selectAll("text")
    //    .data(dataset)
    //    .enter()
    //    .append("text")
    //    .text(function(d) {
    //        // return d[0] + "," + d[1];
    //        return moment(d).format("DD MMM YYYY") + "," + d.cycleTime;
    //    })
    //    .attr("x", function(d) {
    //        return xScale(d.date);
    //    })
    //    .attr("y", function(d) {
    //        return yScale(d.cycleTime);
    //    })
    //    .attr("font-family", "sans-serif")
    //    .attr("font-size", "11px")
    //    .attr("fill", "red");
	  	
		
		
		//Create Y axis
    // svg.append("g")
    //  .attr("class", "axis")
    //  .attr("transform", "translate(" + padding + ",0)")
    //  .call(yAxis);
		
		// TODO: figure out why CSS isn't being loaded for the extension
		svg.selectAll('.axis path, .axis path')
		  .style({fill: 'none', stroke: 'black', 'shape-rendering': 'crispEdges'});
}

module.exports = TimeChart;