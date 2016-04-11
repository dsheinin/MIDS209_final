function initializeSmallMultiples() {
		var countryDiseaseContainers = [];
		var rangeContainers = [];
		var diseases = [];

		var xScale = null;
		var w = null;

		function add_small_multiples(data, max_y, w, h, disease, disease_index) {
			if (disease_index == 0) {
				countryDiseaseContainers = [];
				rangeContainers = [];
			}
			var div = "#small_multiple" + (disease_index+1);

			var margin = {top: 30, right: 10, bottom: 25, left: 30},
					width = w - margin.left - margin.right,
					height = h - margin.top - margin.bottom;

			if (xScale == null) {
				xScale = d3.scale.linear()
					.domain([1980, 2014])
					.range([0, width]);

				w = width;
			}

			var yScale = d3.scale.linear()
				.domain([0, max_y])
				.range([height, 0]);

			var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.innerTickSize(5)
					.outerTickSize(0)
					.tickFormat(d3.format("d"))
					.ticks(10);

			var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.innerTickSize(-width)
					.outerTickSize(0)
					.tickPadding(5); //5

			var svg = d3.select(div)
				.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			var line = d3.svg.line()
				.interpolate("monotone")
				.x(function(d) { return xScale(d["year"]); })
				.y(function(d) { return yScale(d["disease"][disease]); })
				.defined(function(d) { return !$.isEmptyObject(d["disease"]); });

			// Use this when testing the layout
			/*var borderPath = svg.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("height", h)
					.attr("width", w)
					.style("stroke", "black")
					.style("fill", "none")
					.style("stroke-width", 1);*/

			svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis)

			svg.append("g")
					.attr("class", "y axis")
					.call(yAxis)

			svg.append("text")
				.attr("x", (width / 2))
				.attr("y", 0 - (margin.top / 2))
				.attr("text-anchor", "middle")
				.style("font-size", "16px")
				.style("text-decoration", "underline")
				.text(disease);

			//////////////////////
			// Start using data //
      //////////////////////
			// Graph the average disease incidence
			var averageDiseaseContainer = svg.append("g");

			var average = averageDiseaseContainer.append("g")
	        .append("path")
	        .attr("stroke", "black")
	        .attr("stroke-width", 2)
	        .attr("fill", "none")
	        .attr("class", "average-line main-line");
	        //.attr("clip-path", "url(#clip)");

			average
					.datum(data["average_years"])
					.attr("d", function (d) { return line(d);});

			// Then graph each countries disease incidence, but make the lines invisible for now until a country is selected.
	    var countryDiseaseContainer = svg.append("g");
			countryDiseaseContainers.push(countryDiseaseContainer);

			var countries = countryDiseaseContainer.selectAll(".country-" + disease)
					.data(data["countries"]);

			var enteredCountries = countries
					.enter()
					.append("g")
					.attr("class", "country-" + disease)
					.attr("id", function(d) { return "country-line-" + d.iso_code + "-" + disease; });

			// add country lines
			enteredCountries
					.append("path")
					.attr({
							stroke: 'blue',
							"stroke-width": 2,
							fill: "none",
							opacity: 0,
							class: "country-line main-line" //,
							//"clip-path": "url(#clip)"
					});

			countries.selectAll("path")
					.attr("d", function (d) { return line(d["years"]); });

			/////////////////////////////
			// Create range rectangles //
			/////////////////////////////
			rangeRectangles1 = svg.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", xScale(1990))
				.attr("height", height)
				.attr("opacity", .5);

			var x = xScale(2005);
			rangeRectangles2 = svg.append("rect")
				.attr("x", x)
				.attr("y", 0)
				.attr("width", width - x)
				.attr("height", height)
				.attr("opacity", .5);

			rangeContainers.push([rangeRectangles1, rangeRectangles2]);

			return svg;
		}

		function update(data) {
			diseases = [];

			// Use this to get a list of the currently selected diseases
			var obj = data.average_years[0].disease;
			var max_value_per_diasease = [];
			for(var key in obj) {
					diseases.push(key);
					max_value_per_diasease.push(0);
			}

			// Get max value per disease across all countries
			for (var country_index in data.countries) {
				for (var year_index in data.countries[country_index].years) {
					for (i = 0; i < diseases.length; i++) {
							var value = data.countries[country_index].years[year_index].disease[diseases[i]];
							if (value > max_value_per_diasease[i]) {
								max_value_per_diasease[i] = value;
							}
					}
				}
			}

			// Remove the previous small multiple graphs
			document.getElementById("small_multiple1").innerHTML = "";
			document.getElementById("small_multiple2").innerHTML = "";
			document.getElementById("small_multiple3").innerHTML = "";

			// Display the small multiples graph for each disease
			for (i = 0; i < diseases.length; i++) {
					add_small_multiples(data, max_value_per_diasease[i], 450, 250, diseases[i], i);
			}
		}

		function showCountry(isoCode) {
			for (i = 0; i < diseases.length; i++) {
					var countries = countryDiseaseContainers[i].selectAll(".country-" + diseases[i]);
					var country = countryDiseaseContainers[i].select("#country-line-" + isoCode + "-" + diseases[i]);

					countries.selectAll("path")
	            .transition()
	            .duration(0)
							.attr("opacity", 0);

					country.select("path")
	            .transition()
	            .duration(0)
							.attr("opacity", 1);
			}
		}

		function updateRange(startYear, endYear) {
			for (i = 0; i < diseases.length; i++) {
					var rangeRectangles = rangeContainers[i];

					rangeRectangles[0].selectAll("rect")
							.transition()
							.duration(0)
							.attr("width", xScale(startYear));

					var x = xScale(endYear);
					rangeRectangles[1].select("rect")
							.transition()
							.duration(0)
							.attr("x", x)
							.attr("width", w - x);
			}

				return 3;
		}

		function smallMultiples(){}
    smallMultiples.update = update;
    smallMultiples.showCountry = showCountry;
		smallMultiples.updateRange = updateRange;
    return smallMultiples;
}
