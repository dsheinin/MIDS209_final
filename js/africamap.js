function color_africa(user_year1, user_year2, immunization_data) {

    user_disease_group = immunization_data.group_slug;

// modified from https://gist.github.com/chule

    var width = 450,                //************************************************** change container size here
        height = 600;
    
    var svg = d3.select("div.africamap").selectAll("svg") 

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
      
      
    var coverage_year1 = [];
    var coverage_year2 = [];
    var coverage_final = [];
    var country_list = [];
    
    var text = "";
    for (k = 0; k < immunization_data.countries.length; k++) { 
        text += immunization_data.countries[k].name + "<br>";
        country_list.push(immunization_data.countries[k].name);
        
        for (m = 0; m < immunization_data.countries[k].years.length; m++) {
            if (immunization_data.countries[k].years[m].year == user_year1) {
                coverage_year1.push(immunization_data.countries[k].years[m].coverage);
            }
            else if (immunization_data.countries[k].years[m].year == user_year2) {
                coverage_year2.push(immunization_data.countries[k].years[m].coverage);
            }
        }   
    }
    
    for (i = 0; i < coverage_year1.length; i++) {
        
        if (user_disease_group=='dpt') {
            if (user_year1 == user_year2) {
                coverage_final.push((coverage_year1[i].DTP1 + coverage_year1[i].DTP3)/2); 
            }
            else {
                var cov_ave = (coverage_year2[i].DTP1 + coverage_year1[i].DTP1 + coverage_year2[i].DTP3 + coverage_year1[i].DTP3) / 4;      
                coverage_final.push(cov_ave);    
            }
        } else if (user_disease_group=='measles') {
            if (user_year1 == user_year2) {
                coverage_final.push(coverage_year1[i].MCV1); 
            }
            else {
                var cov_ave = (coverage_year2[i].MCV1 + coverage_year1[i].MCV1) / 2;      
                coverage_final.push(cov_ave);    
            }
        } else if (user_disease_group=='pab') {
            if (user_year1 == user_year2) {
                coverage_final.push(coverage_year1[i].PAB); 
            }
            else {
                var cov_ave = (coverage_year2[i].PAB + coverage_year1[i].PAB) / 2;      
                coverage_final.push(cov_ave);    
            }
        } else if (user_disease_group=='polio') {   
            if (user_year1 == user_year2) {
                coverage_final.push(coverage_year1[i].Pol3); 
            }
            else {
                var cov_ave = (coverage_year2[i].Pol3 + coverage_year1[i].Pol3) / 2;      
                coverage_final.push(cov_ave);    
            }
        } else if (user_disease_group=='yfv') {
            if (user_year1 == user_year2) {
                coverage_final.push(coverage_year1[i].YFV); 
            }
            else {
                var cov_ave = (coverage_year2[i].YFV + coverage_year1[i].YFV) / 2;      
                coverage_final.push(cov_ave);    
            }
        } 
    }
    //console.log(coverage_final)
    //document.getElementById("testarea").innerHTML = text;
    
    var country_pair = (function () {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': "js/country_mapping.json",  
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
    
    
    ///************************* end api call for data  *********************************************************************
      
    
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
              
    formatNumber = d3.format(",.0f");  
    
    var subunits = topojson.feature(data, data.objects.collection);
    
    /*  
    var text2 = "";
    for (k = 0; k < subunits.features.length; k++) { 
        text2 += subunits.features[k].properties.subunit + "<br>";
    }
    document.getElementById("testarea").innerHTML = text2;  
    //console.log(subunits.features[0].properties.subunit)
    */  
    
    var projection = d3.geo.mercator()
      .center([15, 5])
      .scale(340)    //************************************************** change scale here
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
    for (i = 0; i < data.objects.collection.geometries.length; i++) {
        for (j = 0; j < country_pair.length; j++){
            if (data.objects.collection.geometries[i].properties.subunit == country_pair[j].Country_Map) {
                for (k = 0; k < country_list.length; k++) {
                    if (country_pair[j].Country_Django == country_list[k]) {
                        
                        data.objects.collection.geometries[i].properties.pop_est = coverage_final[k];
                        
                    }
                }            
            }
        }
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
      //console.log(d)
      tooltip.show("<b>" + d.properties.subunit  + "</b>" + "<br>" + "Rate: " + d.properties.pop_est);
      //toGreyExcept(this);
     
     var countries_list = map.selectAll(".subunit").selectAll("path");
     for (k=0; k < countries_list.length; k++) {
        countries_list[k].parentNode
        d3.select(countries_list[k].parentNode.parentNode.appendChild(countries_list[k].parentNode)).transition().duration(10)  //** color boarder of country upon hover over
            .style({'stroke-opacity':1,'stroke':'#FFF','stroke-width':1});
    }
      
      d3.select(this.parentNode.appendChild(this)).transition().duration(50)  //** color boarder of country upon hover over
        .style({'stroke-opacity':1,'stroke':'#F00','stroke-width':3});
        
     selectCountry(d.properties.iso_a3);   
  
    });
       
            
    countries.on('click', function(d,i){   //****************** this is the part where the map is clicked
        
        alert("Country: " + d.properties.subunit  + " was clicked");
    
    });
    
    countries.on("mousemove", function (d, i) {   
      tooltip.move();
      })
      .on("mouseout", function (d, i) {
      //createStuff();
      tooltip.hide();
      
      //d3.select(this.parentNode.appendChild(this)).transition().duration(50)
       // .style({'stroke-opacity':1,'stroke':'#FFF','stroke-width':1});
      
    });     
    
    map.append("path")
      .datum(topojson.mesh(data, data.objects.collection, function(a, b) { return a !== b; }))
      .attr("d", path)
      .attr("class", "subunit-boundary");
    
    //});
    
    // bl.ocks resize
    d3.select(self.frameElement).style("height", height + 70 + "px");

};