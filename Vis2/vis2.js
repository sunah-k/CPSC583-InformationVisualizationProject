
window.onload = function(){
    setupvis2();
};
//var series = stack(dataset);


var Visual = function() {
    this.data;
    this.width = 1000;
    this.height = 800;

    this.svgContainer;

    this.xAxisScale;
    this.yAxisScale;
    this.modeColours;
    this.colourScale;

    this.simulation;


}



//var series = stack(dataset);


function setup(){
    _vis = new Visual();
    _vis.svgContainer = d3.select("#vis");
    _vis.width = _vis.svgContainer.node().getBoundingClientRect().width != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().width :
        _vis.width;
    _vis.height = _vis.svgContainer.node().getBoundingClientRect().height != undefined ?
        _vis.svgContainer.node().getBoundingClientRect().height :
        _vis.height;


    loadData("spotifyPopularity.csv");

}


var dataset;
var angleScale;
var danceScale;
// var energyScale;
// var acousticScale;
// var valenceScale;
// var tempoScale;
var yScale;
var xScale;
// var dataset2 = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
//     11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
// var origin = function(d){
//     return [(w/2), (h/2)];
// }

function setupvis2(){

    d3.csv("spotifyPopularity.csv", function(data){
        //console.log(data);
        dataset = data;
    });

    load2("spotifyPopularity.csv");

}
var colors = d3.scaleOrdinal(d3.schemeCategory10);
var w = 1500;
var h = 1000;
function doBarChart2(){

    //Width and height
    var stack = d3.stack()
        .keys(["danceability", "energy", "acousticness", "valence"]);
    var barPadding = 4.5;

    let svg = d3.select("#vis2")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    var series = stack(dataset);

    var groups = svg.selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .style("fill", function(d, i) {
            //console.log(series);
            return colors(i);
        })
    ;

    var rects = groups.selectAll("rect")
        .data(function (d) {return d})
        .enter()
        .append("rect")
        .attr("x",  function(d, i) {
            // return xScale(i);
            return w/2;
            //return i * (w / dataset.length);
        })
        .attr("y",function(d){
            // return yScale(d[0]);
            return h;
        })
        // .attr("width", xScale.bandwidth())
        .attr("width", w / dataset.length - 2)
        .attr("height", function(d){
            return yScale(d[1]) - yScale(d[0]);
        })
        .attr("transform", function(d) {
            //console.log(d.data.popularity);
            //return "rotate(" + (angleScale(d.popularity)) +")";
            return "rotate(" + ((angleScale(d.data.popularity) + 90)) + ","
                + (w/2 + (w / dataset.length - barPadding)/2) +","
                + (h - 75) +")";
        })
        ;


}


function scaleSetupAngle(){
    // danceScale = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, function(d) {
    //         return d.danceability;
    //     })])
    //     .range([0,h]);
    // energyScale = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, function(d) {
    //         return d.energy;
    //     })])
    //     .range([0,h]);
    // acousticScale = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, function(d) {
    //         return d.acousticness;
    //     })])
    //     .range([0,h]);
    // valenceScale = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, function(d) {
    //         return d.valence;
    //     })])
    //     .range([0,h]);
    // tempoScale = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, function(d) {
    //         return d.tempo;
    //     })])
    //     .range([0,h]);
    xScale = d3.scaleBand()
        .domain(d3.range(dataset.length))
        .range([0,w/2])
        .paddingInner(0.5);
    yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, (w - 150) / 2]);
    angleScale = d3.scaleLinear()
        //.domain([0, 100])
        .domain([0, d3.max(dataset, function(d) {return d.popularity;})])
        .range([0, 180]);
}

function createLegend(properties) {
    properties = properties === undefined ? ["valence", "acousticness", "energy", "danceability"] : properties;
    let cellSize = 15;

    //create key
    let key = d3.select("#legend").append("g")
        .attr("id", "key")
        .attr("class", "key");

    key.selectAll("rect")
        .data(properties)
        .enter()
        .append("rect")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .attr("x", function (d, i) {
            return i * 200;
        })
        .attr("fill", function (d, i) {
            return colors(i);
        });

    key.selectAll("text")
        .data(properties)
        .enter()
        .append("text")
        .attr("x", function (d, i) {
            return cellSize + 5 + (i * 200);
        })
        .attr("y", "1em")
        .text(function (d, i) {
            return properties[i];
        });

}



var load2 = function loadData2(path){
    d3.csv(path).then(function(data){
        dataset = data;
        scaleSetupAngle();
        doBarChart2();
        createLegend();
    });
}
