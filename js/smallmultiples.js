function initializeSmallMultiples() {
		function add_small_multiples(d1, d2, w, h, title, div) {
			var margin = {top: 30, right: 10, bottom: 25, left: 30},
					width = w - margin.left - margin.right,
					height = h - margin.top - margin.bottom;

			var xScale = d3.scale.ordinal()
				.domain(d3.range(0, d1.length))
				.rangeBands([0, width], 0.10);

			var yScale = d3.scale.linear()
				.domain([0, d3.max(d1)])
				.range([height, 0]);

			var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.innerTickSize(0)
					.outerTickSize(0)
					.tickFormat("");

			var yAxis = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.innerTickSize(-width)
					.outerTickSize(0)
					.tickPadding(5); //5

			var line = d3.svg.line()
				.interpolate("monotone")
				.x(function(d, i) { return xScale(i); })
				.y(function(d) { return yScale(d); });

			var svg = d3.select(div)
				.append("svg")
					.attr("width", width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

			svg.append("path")
				//.data([dataset])
				.attr('d', line(d1))
				.attr('stroke', 'orange')
				.attr('stroke-width', 4)
				.attr('fill', 'none');

			/*svg.append("path")
				.attr('d', line(d2 ))
				.attr('stroke', 'green')
				.attr('stroke-width', 4)
				.attr('fill', 'none');*/

			svg.append("text")
				.attr("x", (width / 2))
				.attr("y", 0 - (margin.top / 2))
				.attr("text-anchor", "middle")
				.style("font-size", "16px")
				.style("text-decoration", "underline")
				.text(title);

			return svg;
		}

		function update(data) {
			// Use this to get a list of the currently selected diseases
			var obj = data.average_years[0].disease;
			var diseases = [];
			var disease_data = [];
			for(var key in obj) {
					diseases.push(key);
					disease_data.push([]);
			}

			// Get the average data per disease per year
			for (var index in data.average_years)
			{
				for (i = 0; i < diseases.length; i++) {
						var t = data.average_years[index].disease[diseases[i]];
						disease_data[i].push(t);
				}
			}

			// Remove the previous small multiple graphs
			document.getElementById("small_multiple1").innerHTML = "";
			document.getElementById("small_multiple2").innerHTML = "";
			document.getElementById("small_multiple3").innerHTML = "";

			// Display the small multiples graph for each disease
			for (i = 0; i < diseases.length; i++) {
					add_small_multiples(disease_data[i], disease_data[i], 450, 250, diseases[i], "#small_multiple" + (i+1));
			}
		}

    return update;
}
