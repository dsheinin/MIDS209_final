var width = 800;
var height = 500;
var padding = 80;
var apiBaseUrl = "https://demo.sheinin.ca/w209/api/"
// For testing with a local Django installation
//var apiBaseUrl = "http://localhost:8000/api/"

var xScale = d3.scale.linear()
        .domain([1980, 2014])
        .range([padding, width - padding]);
var yScale = d3.scale.linear()
        .domain([0, 100])
        .range([height - padding, padding]);

// Create svg element
var svg = d3.select("#graphtest")
        .append("svg")
        .attr({
            width: width,
            height: height,
        });

var lineFunction = d3.svg.line()
        .x(function(d) { return xScale(d["year"]); })
        // This is what we'd do to fetch values for a single vaccine:
        //.y(function(d) { return  yScale(d["coverage"]["DTP1"]); })
        //.defined(function(d) { return "DTP1" in d["coverage"]; })
        // And here's what we do to get the average value for all vaccines:
        .y(function(d) {
            var coverage = d["coverage"];
            var total = 0;
            var count = 0;
            for (vacCode in coverage) {
                total += coverage[vacCode];
                count++;
            }
            return  yScale(total / count);
        })
        .defined(function(d) { return !$.isEmptyObject(d["coverage"]); })
        .interpolate("bundle");

$.getJSON( apiBaseUrl + "fetch/coverage/dpt/", function( data ) {

    var country = svg.selectAll(".country")
            .data(data["countries"])
            .enter().append("g")
            .attr("class", "country");

    country.append("path")
            .attr("d", function(d){return lineFunction(d["years"]);})
            .attr("stroke", "lightgrey")
            .attr("stroke-width", 2)
            .attr("fill", "none");

});