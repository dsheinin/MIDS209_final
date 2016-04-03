function draw_africa() {      

// modified from https://gist.github.com/chule

    var width = 350,                //************************************************** change container size here
        height = 400;
    
    var svg = d3.select("div.africamap").append("svg")
    .attr("width", width)
    .attr("height", height);  

    var tooltip = {
        element: null,
        init: function() {
            this.element = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
        },
        show: function(t) {
            this.element.html(t).transition().duration(200).style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", .9);
        },
        move: function() {
            this.element.transition().duration(30).ease("linear").style("left", d3.event.pageX + 20 + "px").style("top", d3.event.pageY - 20 + "px").style("opacity", .9);
        },
        hide: function() {
            this.element.transition().duration(500).style("opacity", 0)
        }};
    
    tooltip.init();
    
    var numFormat = d3.format(",d");
    
    var toGreyExcept = function(t) {
    
      var color = d3.select(t).style("fill");
      console.log(color)
      d3.selectAll(".subunit").style("fill", function(d) {
        //var a = e.data.color;
    
        if (!t || this === t) {
          
          return; }
        return "#cccccc";
    
        // var n = d3.rgb(a).hsl().darker(2);
        // n.s *= .9;
        // return n.toString()
    
      });
    };
     
    
    //d3.json("js/africaTopoMap.json", function(error, data) {
    //  if (error) return console.error(error);
    var data = (function () {
            
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "js/africaTopoMap.json",  
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
         
    
    var colorScale = d3.scale.threshold()
    //.domain([2000000, 5000000, 10000000, 13000000,  20000000, 30000000, 45000000])
    .domain([10, 20, 30, 40, 50, 60, 70, 80, 90])
    .range(colorbrewer.RdBu["10"]);    
    
    formatValue = d3.format("s");
    
    // A position encoding for the key only.
    var x = d3.scale.linear()
      //.domain([500000, 50000000])
      //.range([0, 600]);
      .domain([0, 100])
      .range([0, 180]);
    
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(10)
      .tickValues(colorScale.domain())
      .tickFormat(function(d) { return formatValue(d)});  
           
    // key
    var g = svg.append("g")
      .attr("class", "key")
      .attr("transform", "translate(170,50)");
    
    g.selectAll("rect")
      .data(colorScale.range().map(function(d, i) {
        return {
          x0: i ? x(colorScale.domain()[i - 1]) : x.range()[0],
          x1: i < colorScale.domain().length ? x(colorScale.domain()[i]) : x.range()[1],
          z: d
        };
      }))
    .enter().append("rect")
      .attr("height", 8)
      .attr("x", function(d) { return d.x0; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .style("fill", function(d) { return d.z; });
    
    g.call(xAxis).append("text")
      .attr("class", "caption")
      .attr("y", -6)
      .text("Immunization Rates in Africa");  
    // key end    
    
    formatNumber = d3.format(",.0f");  
    
    var subunits = topojson.feature(data, data.objects.collection);
    
    var projection = d3.geo.mercator()
      .center([15, 5])
      .scale(230)    //************************************************** change scale here
      .translate([width / 2, height / 2]);
    
    // var projection = d3.geo.albers()
    //     .center([0, 55.4])
    //     .rotate([4.4, 0])
    //     .parallels([50, 60])
    //     .scale(6000)
    //     .translate([width / 2, height / 2]);    
    
    var path = d3.geo.path()
      .projection(projection);
    
    d3.selectAll(".subunit").remove();
    
    
    ///************************* merge data together for plotting ***********************
    
    //console.log(data.objects.collection.geometries)
    
    // change the value of the population to coverage ****************
    for (i = 0; i < data.objects.collection.geometries.length; i++) {
        data.objects.collection.geometries[i].properties.pop_est = NaN;
    }
    //*************************end merge******************************  
    
    var map = svg.append("g")
                .attr("class", "map");
    
    var countries = map.selectAll(".subunit")
      .data(topojson.feature(data, data.objects.collection).features)
      //.data(topojson.feature(uk, uk.objects.subunits).features)
      .enter().append("path")
      .attr("class", function(d) { return "subunit " + d.properties.subunit; })
      .attr("d", path)
      .style("fill", function(d, i) {  return colorScale(d.properties.pop_est); });
    
    countries.on("mouseover", function (d, i) {
      //console.log(this)
      tooltip.show("<b>" + d.properties.subunit  + "</b>" + "<br>" + "Rate: " + d.properties.pop_est);
      //console.log(d.properties.pop_est)
      //toGreyExcept(this);
    });
    
    countries.on("mousemove", function (d, i) {   
      tooltip.move();
      })
      .on("mouseout", function (d, i) {
      //createStuff();
      tooltip.hide();
    });     
    
    map.append("path")
      .datum(topojson.mesh(data, data.objects.collection, function(a, b) { return a !== b; }))
      .attr("d", path)
      .attr("class", "subunit-boundary");
    
    //});
    
    // bl.ocks resize
    d3.select(self.frameElement).style("height", height + 70 + "px");

};