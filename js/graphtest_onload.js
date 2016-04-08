function onload_immunization_chart() {

    var width = 800;
    var height = 500;
    
    //var width = 1100;
    //var height = 1100;
    var padding = {top: 10, right: 150, bottom: 20, left: 150};
    var navGraphHeight = 70;
    var mainGraphHeight = height - padding.top - padding.bottom - navGraphHeight - 30;
    
    var defaultTransitionTime = 0;
    var defaultLineColor = "lightgrey";
    var defaultTextColor = "lightgrey";
    var highlightColor = "steelblue";
    var defaultLabelOpacity = "0.5"
    var defaultLineStrokeWidth = 1;
    var highlightLineStrokeWidth = 2;
    
    var apiBaseUrl = "https://demo.sheinin.ca/w209/api/"
    // For testing with a local Django installation
    //var apiBaseUrl = "http://localhost:8000/api/"
    
    var xScaleMain = d3.scale.linear()
            .domain([1980, 2014])
            .range([padding.left, width - padding.right]);
    var yScaleMain = d3.scale.linear()
            .domain([0, 100])
            .range([padding.top + mainGraphHeight, padding.top]);
    
    var xScaleNav = d3.scale.linear()
            .domain([1980, 2014])
            .range([padding.left, width - padding.right]);
    var yScaleNav = d3.scale.linear()
            .domain([0, 100])
            .range([height - padding.bottom, height - padding.bottom - navGraphHeight]);
    
    // Create svg element
    var svg = d3.select("#graphtest")
            .append("svg")
            .attr({
                width: width,
                height: height,
            });
    
    // Separate container elements for countries and average allow us to keep average on top (at end)
    var countryContainer = svg.append("g");
    var averageContainer = svg.append("g");
    var averageContainerNav = svg.append("g");
    
    // create single element for average
    var average = averageContainer.append("g");
    var averageNav = averageContainerNav.append("g");
    
    // Create axes
    var xAxis = d3.svg.axis()
    
            .scale(xScaleMain)
            .orient("bottom")
            .tickFormat(d3.format("d"));
    
    var xAxisNav = d3.svg.axis()
            .scale(xScaleNav)
            .orient("bottom")
            .tickFormat(d3.format("d"));
    
    // brush
    var brush = d3.svg.brush()
            .x(xScaleNav)
            .on("brush", brushed);
    
    svg.append("g")
            .attr("class", "brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", height - padding.bottom - navGraphHeight - 6)
            .attr("height", navGraphHeight + 7);
    
    function calcAverage(coverage) {
        var total = 0;
        var count = 0;
        for (vacCode in coverage) {
            total += coverage[vacCode];
            count++;
        }
        return  total / count;
    }
    
    // Function to create spacing between labels
    // See https://www.safaribooksonline.com/blog/2014/03/11/solving-d3-label-placement-constraint-relaxing/
    var labelSpacing = 8;
    function relax(selector) {
        again = false;
        textLabels = countryContainer.selectAll(selector);
        textLabels.each(function (d, i) {
            a = this;
            da = d3.select(a);
            y1 = da.attr("y");
            textLabels.each(function (d, j) {
                b = this;
                if (a == b) return;
    
                db = d3.select(b);
                y2 = db.attr("y");
                deltaY = y1 - y2;
    
                if (Math.abs(deltaY) > labelSpacing) return;
    
                again = true;
                sign = deltaY > 0 ? 1 : -1;
                adjust = sign * 2.0;
                da.attr("y", +y1 + adjust);
                db.attr("y", +y2 - adjust);
            });
        });
    
        if(again) {
            relax(selector);
            // to animate
            //setTimeout(relax,1);
        }
        else {
            // add lines from labels to graph lines
            /*
            countryContainer.selectAll(".country")
                    .append("line")
                    .attr({
                        "x1": padding - 17,
                        "x2": function(d) {
                            return d3.select(this.parentNode).select("path").node().getPointAtLength(0).x - 3;
                        },
                        "y1": function(d) {
                            return d3.select(this.parentNode).select("text").attr("y");
                        },
                        "y2": function(d) {
                            return d3.select(this.parentNode).select("path").node().getPointAtLength(0).y;
                        },
                        "stroke": "orange"
                    })
            */
        }
    }
    
    var lineFunction = d3.svg.line()
            .x(function(d) { return xScaleMain(d["year"]); })
            // This is what we'd do to fetch values for a single vaccine:
            //.y(function(d) { return  yScaleMain(d["coverage"]["DTP1"]); })
            //.defined(function(d) { return "DTP1" in d["coverage"]; })
            // And here's what we do to get the average value for all vaccines:
            .y(function(d) {
                var coverage = d["coverage"];
                return  yScaleMain(calcAverage(coverage));
            })
            .defined(function(d) { return !$.isEmptyObject(d["coverage"]); })
            .interpolate("bundle");
    
    var lineFunctionNav = d3.svg.line()
            .x(function(d) { return xScaleMain(d["year"]); })
            .y(function(d) {
                var coverage = d["coverage"];
                return  yScaleNav(calcAverage(coverage));
            })
            .defined(function(d) { return !$.isEmptyObject(d["coverage"]); })
            .interpolate("bundle");
    
    // clip path
    svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr({
                width: width - padding.left - padding.right,
                height: mainGraphHeight,
                x: padding.left,
                y: padding.top,
            });
    
    // binary search function to get the y position of a path with a given x position
    // (adapted from http://stackoverflow.com/a/12541696)
    function getPathYCoord(path, x){
        var pathLength = path.getTotalLength();
        var beginning = x, end = pathLength, target, pos;
        while (true) {
            target = Math.floor((beginning + end) / 2);
            pos = path.getPointAtLength(target);
            if ((target === end || target === beginning) && pos.x !== x) {
                break;
            }
            if (pos.x > x)      end = target;
            else if (pos.x < x) beginning = target;
            else                break; //position found
        }
        return pos.y;
    }
    
    $.getJSON( apiBaseUrl + "fetch/coverage/dpt/", function( data ) {
    
        // create country groups
        var countries = countryContainer.selectAll(".country")
                .data(data["countries"])
                .enter()
                .append("g")
                .attr("class", "country");
    
        // add country lines
        countries
                .append("path")
                .attr({
                    d: function(d){return lineFunction(d["years"]);},
                    stroke: defaultLineColor,
                    "stroke-width": defaultLineStrokeWidth,
                    fill: "none",
                    class: "country-line main-line",
                    "clip-path": "url(#clip)"
                });
    
            // add left country labels
        countries
                .append("text")
                .attr({
                    y: function(d){
                        return d3.select(this.parentNode).select("path").node().getPointAtLength(0).y;
                    },
                    x: padding.left - 20,
                    "text-anchor": "end",
                    class: "country-label country-label-start",
                    fill: defaultTextColor,
                    opacity: defaultLabelOpacity
                })
                .text(function(d) { return d["name"]; });
    
        // add right country labels
        countries
                .append("text")
                .attr({
                    y: function(d){
                        var path = d3.select(this.parentNode).select("path").node();
                        return path.getPointAtLength(path.getTotalLength()).y;
                    },
                    x: width - padding.right + 20,
                    class: "country-label country-label-end",
                    fill: defaultTextColor,
                    opacity: defaultLabelOpacity
                })
                .text(function(d) { return d["name"]; });
    
    
        //relax(".country-label-start");
        //relax(".country-label-end");
    
        // hover behaviour
        countries.selectAll("*")
                .on("mouseover", function(d){
                    countries.selectAll("path")
                            .transition()
                            .duration(0)
                            .attr({
                                "stroke": defaultLineColor,
                                "stroke-width": defaultLineStrokeWidth,
                            });
                    countries.selectAll("text")
                            .classed("selected", false)
                            .transition()
                            .duration(0)
                            .attr({
                                "fill": defaultTextColor,
                                "opacity": defaultLabelOpacity
                            });
                    d3.select(this.parentNode).select("path")
                            .transition()
                            .duration(defaultTransitionTime)
                            .attr({
                                "stroke": highlightColor,
                                "stroke-width": highlightLineStrokeWidth,
                            });
                    d3.select(this.parentNode).selectAll("text")
                            .classed("selected", true)
                            .transition()
                            .duration(defaultTransitionTime)
                            .attr({
                                "fill": highlightColor,
                                "opacity": 1.0
                            });
                    countries.sort(function (a, b) { // select the parent and sort the path's
                        if (a != d) return -1;               // a is not the hovered element, send "a" to the back
                        else return 1;                             // a is the hovered element, bring "a" to the front
                    });
                });
    
    
        // average line
        average
                .datum(data["average_years"])
                .append("path")
                .attr("d", function(d){return lineFunction(d);})
                .attr("stroke", "black")
                .attr("stroke-width", highlightLineStrokeWidth)
                .attr("fill", "none")
                .attr("class", "average-line main-line")
                .attr("clip-path", "url(#clip)");
    
        averageNav
                .datum(data["average_years"])
                .append("path")
                .attr("d", function(d){return lineFunctionNav(d);})
                .attr("stroke", "black")
                .attr("stroke-width", highlightLineStrokeWidth)
                .attr("fill", "none");
    
        // Add axes
        svg.append("g")
                .attr({
                    id: "x-axis-main",
                    class: "axis",
                    transform: "translate(0," + (padding.top + mainGraphHeight) + ")",
                })
                .call(xAxis);
    
        svg.append("g")
                .attr({
                    id: "x-axis-nav",
                    class: "axis",
                    transform: "translate(0," + (height - padding.bottom) + ")",
                })
                .call(xAxis);
    
    });


function brushed() {
    xScaleMain.domain(brush.empty() ? xScaleNav.domain() : brush.extent());
    
    var user_year1 = Math.round(brush.extent()[0]);   //******************************** Change color of map with brushing
    var user_year2 = Math.round(brush.extent()[1]);   
    //var user_disease_group = 'dpt'; 
    color_africa(user_year1, user_year2, user_disease_group);   //******************************** Change color of map with brushing
    
    svg.selectAll("path.country-line").attr("d", function(d){return lineFunction(d["years"]);});
    svg.selectAll("path.average-line").attr("d", function(d){return lineFunction(d);});
    svg.selectAll("text.country-label-start").attr("y", function(d){
        return getPathYCoord(d3.select(this.parentNode).select("path").node(), padding.left);
    });
    svg.selectAll("text.country-label-end").attr("y", function(d){
        return getPathYCoord(d3.select(this.parentNode).select("path").node(), width - padding.right);
    });
    svg.select("#x-axis-main").call(xAxis);
}

}