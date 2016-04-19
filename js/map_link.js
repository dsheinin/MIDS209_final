function highlight_map_border(country_name) {
    
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
    
    var svg = d3.select("#mainviz");
    
    console.log(svg)
    var map = svg.selectAll(".map");

    var country_pair_list = (function () {
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
    var countries_list = data;
    var country = countries_list.objects.collection.geometries;
    var countries = map.selectAll(".subunit").selectAll("path");
    //console.log(country_name)
    for (k=0; k < countries.length; k++) {
        countries[k].parentNode
        d3.select(countries[k].parentNode.parentNode.appendChild(countries[k].parentNode)).transition().duration(10)  //** color boarder of country upon hover over
            .style({'stroke-opacity':1,'stroke':'#CCC','stroke-width':1});
    }
    
    for (j=0; j < country_pair_list.length; j++) {
        if (country_pair_list[j].Country_Django == country_name) {
            for (i=0; i < countries.length; i++ ) {
                if (countries[i].parentNode.__data__.properties.subunit == country_pair_list[j].Country_Map) {

                    var selected_country_obj = countries[i].parentNode;
                    console.log(selected_country_obj)
                    d3.select(selected_country_obj.parentNode.appendChild(selected_country_obj)).transition().duration(100)  //** color boarder of country upon hover over
                    .style({'stroke-opacity':1,'stroke':'steelblue','stroke-width':3});
                }
            }
        }
    }
}