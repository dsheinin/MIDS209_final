function initializeLineChart() {

    var width = 1140;
    var height = 400;
    
    //var width = 1100;
    //var height = 1100;
    var padding = {top: 10, right: 12, bottom: 20, left: 470};
    var navGraphHeight = 40;
    var mainGraphHeight = height - padding.top - padding.bottom - navGraphHeight - 30;
    
    var defaultTransitionTime = 0;
    var defaultLineColor = "lightgrey";
    var defaultTextColor = "lightgrey";
    var highlightColor = "steelblue";
    var defaultLabelOpacity = "0";
    var defaultLineStrokeWidth = 1;
    var highlightLineStrokeWidth = 2;
    
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

    var svg = d3.select("#mainviz");

    // Separate container elements for countries and average allow us to keep average on top (at end)
    var countryContainer = svg.append("g");
    var averageContainer = svg.append("g");
    var averageContainerNav = svg.append("g");
    
    // create single element for average
    var average = averageContainer
        .append("path")
        .attr("stroke", "black")
        .attr("stroke-width", highlightLineStrokeWidth)
        .attr("fill", "none")
        .attr("class", "average-line main-line")
        .attr("clip-path", "url(#clip)");
    var averageNav = averageContainerNav.append("g")
        .append("path")
        .attr("stroke", "black")
        .attr("stroke-width", highlightLineStrokeWidth)
        .attr("fill", "none");

    var averageLabel = averageContainer
        .append("text")
        .attr({
            x: padding.left + 10,
            //"text-anchor": "end",
            class: "average-label average-label-start",
            fill: "black",
            opacity: 0.5
        })
        .text("Africa");

    // Create axes
    var xAxis = d3.svg.axis()
            .scale(xScaleMain)
            .orient("bottom")
            .tickFormat(d3.format("d"));

    var yAxis = d3.svg.axis()
        .scale(yScaleMain)
        .orient("left")
        .tickFormat(function(d) { return d + "%"; })
        .ticks(0);

    var xAxisNav = d3.svg.axis()
            .scale(xScaleNav)
            .orient("bottom")
            .tickFormat(d3.format("d"));
    
    // brush
    var brush = d3.svg.brush()
            .x(xScaleNav)
            .on("brush", brushed)
            .on("brushend", brushend);

    var brushg = svg.append("g")
            .attr("class", "brush")
            .call(brush)

    brushg.selectAll("rect")
            .attr("y", height - padding.bottom - navGraphHeight - 6)
            .attr("height", navGraphHeight + 7);

    brushg.selectAll(".resize").select("rect")
        .style("visibility", "visible");

    /* To add circles inside brush handles...
    brushg.selectAll(".resize")
        .append("circle")
        .attr({
            cx: 0,
            cy: height - padding.bottom - navGraphHeight / 2 ,
            r: 2
        });
        */

    brushg.selectAll(".resize").append("path")
        .attr("transform", function(d, i){ return "translate(" + (i ? "-3," : "3,") +  (height - padding.bottom - navGraphHeight / 2 - 2) + ")"; })
        .attr('d', function(d, i) {
            var pointX = i ? -6 : 6;
            return 'M0 -6 L' + pointX + ' 0 L0 6';
        });

    brushg.selectAll(".resize").append("path")
        .attr("transform", function(d, i){ return "translate(" + (i ? "3," : "-3,") +  (height - padding.bottom - navGraphHeight / 2 - 2) + ")"; })
        .attr('d', function(d, i) {
            var pointX = i ? 6 : -6;
            return 'M0 -6 L' + pointX + ' 0 L0 6';
        });

    function calcAverage(coverage) {
        var total = 0;
        var count = 0;
        for (vacCode in coverage) {
            total += coverage[vacCode];
            count++;
        }
        return  total / count;
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
            .x(function(d) { return xScaleNav(d["year"]); })
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
        var pathStart = path.getPointAtLength(0);
        var pathStartX = pathStart.x;

        if (pathStartX > x) return pathStart.y;

        var pathLength = path.getTotalLength();
        var beginning = x - pathStartX, end = pathLength - pathStartX, target, pos;
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



    // Add axes
    var xAxisG = svg.append("g")
        .attr({
            id: "x-axis-main",
            class: "axis",
            transform: "translate(0," + (padding.top + mainGraphHeight) + ")",
        });

    var yAxisG = svg.append("g")
        .attr({
            id: "y-axis-main",
            class: "axis",
            transform: "translate(" + padding.left + ", 0)",
        });

    var xAxisGNav = svg.append("g")
        .attr({
            id: "x-axis-nav",
            class: "axis",
            transform: "translate(0," + (height - padding.bottom) + ")",
        });

    var immunization_data;
    var selectedCountryCode = null;

    function highlightCountry(isoCode) {
        var countries = countryContainer.selectAll(".country");
        var country = countryContainer.select("#country-line-" + isoCode);

        if (!country.empty()) {
            selectedCountryCode = isoCode;

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
            country.select("path")
                .transition()
                .duration(defaultTransitionTime)
                .attr({
                    "stroke": highlightColor,
                    "stroke-width": highlightLineStrokeWidth,
                });
            country.selectAll("text")
                .classed("selected", true)
                .transition()
                .duration(defaultTransitionTime)
                .attr({
                    "fill": highlightColor,
                    "opacity": 0.5
                });
            countries.sort(function (a, b) { // select the parent and sort the path's
                if ("country-line-" + a.iso_code     != country.attr("id")) return -1;       // a is not the hovered element, send "a" to the back
                else return 1;               // a is the hovered element, bring "a" to the front
            });
        }
    };

    function update(data) {

        immunization_data = data;

        // updating existing country groups is tricky. Start again as a fallback
        countryContainer.selectAll(".country").remove();

        // create country groups
        var countries = countryContainer.selectAll(".country")
            .data(data["countries"]);

        var enteredCountries = countries
            .enter()
            .append("g")
            .attr("class", "country")
            .attr("id", function(d){ return "country-line-" + d.iso_code; });

        // add country lines
        enteredCountries
            .append("path")
            .attr({
                stroke: defaultLineColor,
                "stroke-width": defaultLineStrokeWidth,
                fill: "none",
                class: "country-line main-line",
                "clip-path": "url(#clip)"
            });

        countries.selectAll("path")
            .attr({
                d: function (d) {
                    return lineFunction(d["years"]);
                }
            });

        // add left country labels
        enteredCountries
            .append("text")
            .attr({
                x: padding.left + 10,
                //"text-anchor": "end",
                class: "country-label country-label-start",
                fill: defaultTextColor,
                opacity: defaultLabelOpacity
            });

        countries.selectAll("text.country-label-start")
            .attr({
                y: function (d) {
                    return d3.select(this.parentNode).select("path").node().getPointAtLength(0).y;
                }
            })
            .text(function (d) {
                return d["name"];
            });

        // add right country labels
        /*
        enteredCountries
            .append("text")
            .attr({
                x: width - padding.right + 20,
                class: "country-label country-label-end",
                fill: defaultTextColor,
                opacity: defaultLabelOpacity
            });

        countries.selectAll("text.country-label-end")
            .attr({
                y: function (d) {
                    var path = d3.select(this.parentNode).select("path").node();
                    return path.getPointAtLength(path.getTotalLength()).y;
                }
            })
            .text(function (d) {
                return d["name"];
            });
            */

        // hover behaviour
        countries.selectAll("path")
            .on("mouseover", function (d) {
                selectCountry(d.iso_code);
                
            highlight_map_border(this.parentNode.querySelector('.country-label').textContent);
            //console.log(this.parentNode.querySelector('.country-label').textContent)
            
            d3.select("#country-list").select("select")[0][0].value = this.parentNode.querySelector('.country-label').textContent;
            });

        // average line

        average
            .datum(data["average_years"])
            .attr("d", function (d) {
                return lineFunction(d);
            });

        averageLabel
            .attr({
                y: function (d) {
                    return d3.select(this.parentNode).select("path").node().getPointAtLength(0).y;
                }
            });

        averageNav
            .datum(data["average_years"])
            .attr("d", function (d) {
                return lineFunctionNav(d);
            });

        // Add axes
        xAxisG.call(xAxis);
        yAxisG.call(yAxis);
        xAxisGNav.call(xAxisNav);

        // select everything with the brush and reset
        brush.extent([1980, 2014]);
        brush(d3.select(".brush"));
        brush.event(d3.select(".brush"));

        if (selectedCountryCode != null) {
            highlightCountry(selectedCountryCode);
        }

    };

    function brushed() {
        xScaleMain.domain(brush.empty() ? xScaleNav.domain() : brush.extent());

        var user_year1 = Math.round(brush.extent()[0]);
        var user_year2 = Math.round(brush.extent()[1]);
        selectRange(user_year1, user_year2);

        svg.selectAll("path.country-line").attr("d", function(d){return lineFunction(d["years"]);});
        svg.selectAll("path.average-line").attr("d", function(d){return lineFunction(d);});
        averageLabel.attr("y", function(d){
            var yCoord = getPathYCoord(d3.select(this.parentNode).select("path").node(), padding.left);
            return Math.min(padding.top + mainGraphHeight - 15, Math.max(padding.top + 20, yCoord));
        });
        svg.selectAll("text.country-label-start").attr("y", function(d){
            var yCoord = getPathYCoord(d3.select(this.parentNode).select("path").node(), padding.left);
            var yBottom = padding.top + mainGraphHeight - 15;
            var yTop = padding.top + 20;
            yCoord = Math.min(yBottom, Math.max(yTop, yCoord));
            var avgYCoord = averageLabel.attr("y");
            var diff = Math.abs(yCoord - avgYCoord);
            var labelSep = 20;
            if (diff < labelSep) {
                if (yCoord < avgYCoord){
                    if (yCoord - (labelSep - diff) > yTop)
                        yCoord -= labelSep - diff;
                    else
                        yCoord += labelSep + diff;
                }
                else {
                    if (yCoord + (labelSep - diff) < yBottom)
                        yCoord += labelSep - diff;
                    else
                        yCoord -= labelSep + diff;
                }
            }
            return yCoord;
        });
        /*
        svg.selectAll("text.country-label-end").attr("y", function(d){
            return getPathYCoord(d3.select(this.parentNode).select("path").node(), width - padding.right);
        });
        */
        svg.select("#x-axis-main").call(xAxis);
    }

    function brushend() {
        var user_year1 = Math.round(brush.extent()[0]);
        var user_year2 = Math.round(brush.extent()[1]);
        color_africa(user_year1, user_year2, immunization_data);   //******************************** Change color of map with brushing
    }

    function lineChart(){}
    lineChart.update = update;
    lineChart.highlightCountry = highlightCountry;
    return lineChart;

}