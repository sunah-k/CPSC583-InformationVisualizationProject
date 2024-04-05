// Part of code for drawing concentric arcs referenced from
/***************************************************************************************
 *    Title: JavaScript D3: Drawing Concentric Arcs
 *    Author: Al Lin
 *    Date: August 2013
 *    Code version: n/a
 *    Availability: http://bl.ocks.org/cmdoptesc/6226150
 *
 ***************************************************************************************/
// Part of code for force referenced from
/***************************************************************************************
 *    Title: Getting started with D3.js force simulations
 *    Author: Bryony Miles
 *    Date: September 2017
 *    Code version: n/a
 *    Availability: https://medium.com/@bryony_17728/d3-js-two-v-4-network-charts-compared-8d3c66b0499c
 *
 ***************************************************************************************/

window.onload = function(){
    setup();
};

const MARGINS = {top: 10, right: 10, bottom: 60, left: 60};
const FORCE_SPACE = 200;
const PI = Math.PI;

var Visual = function() {
    this.data;
    this.width = 1000;
    this.height = 800;

    this.svgContainer;

    this.xAxisScale;
    this.yAxisScale;
    this.modeColours;
    this.colourScale;

    // var for rings around circles
    this.arcMin = 22;        // inner radius of the first arc
    this.arcWidth = 5;      // width
    this.arcPad = 1;         // padding between arcs

    this.simulation;

    this.setupScales = function (xRange, xDomain, modeColours, colourArray) {
        this.xAxisScale = d3.scaleLinear()
            .domain(xDomain)
            .range(xRange);

        //this.yAxisScale = d3.scaleLinear()
        //  .domain(yDomain)
        //.range(yRange);

        this.modeColours = modeColours;
        this.colourScale = colourArray;
    }

    this.setForce = function (xAxisSelector) {
        xAxisSelector = xAxisSelector === undefined ? "popularity" : xAxisSelector;

        this.simulation = d3.forceSimulation()
        //.force("center", d3.forceCenter(this.width/2, this.height/2))
        //.force("charge", d3.forceManyBody())
            .force("x", d3.forceX(_vis.width / 2).strength(0.6))
            .force("y", d3.forceY(_vis.height / 2).strength(0.6))
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("collide", d3.forceCollide().radius(60));
        this.simulation.stop();
    }

    // create labels
    this.song_labels = d3.select("#div_labels").style("opacity", 0);

    this.createNodes = function (xAxisSelector, properties) {
        xAxisSelector = xAxisSelector === undefined ? "popularity" : xAxisSelector;
        properties = properties === undefined ? ["danceability", "energy", "acousticness", "valence", "tempo"] : properties;

        this.nodes = this.svgContainer.selectAll("g")
            .data(this.data)
            .enter()
            .append("g")
            .attr("id", function (d) {
                return d["id"]
            })
            .attr("class", "node")
            .on("mouseover", function(d) {
                var group = this;
                _vis.song_labels.html("<b>" + d["name"] + "</b><br/>"
                    + "Artist: " + d["artist"] + "<br/>"
                    + "Popularity" + d["popularity"] + "<br/>"
                    + "Danceability: " + d["danceability"] + "<br/>"
                    + "Energy: " + d["energy"] + "<br/>"
                    + "Acousticness: " + d["acousticness"] + "<br/>"
                    + "Valence: " + d["valence"] + "<br/>"
                    + "Tempo: " + d["tempo"] + "<br/>")
                    .style("opacity", 1)
                    .style("left", function() {
                        var string = d3.select(group).attr("transform")
                        // getting translate values from https://stackoverflow.com/questions/38752879/d3-v4-get-translate-values-of-an-element/38753017
                        var translate = string.substring(string.indexOf("(")+1, string.indexOf(")")).split(",");
                        return (parseInt(translate[0]) + 200) + "px"
                    })
                    .style("top", function() {
                        var string = d3.select(group).attr("transform")
                        var translate = string.substring(string.indexOf("(")+1, string.indexOf(")")).split(",");
                        return (parseInt(translate[1]) + 400) + "px"
                    });
            })
            .on("mouseout", function(d) {
                _vis.song_labels.style("opacity", 0);
            });

        this.radiusScale = d3.scaleLinear()
            .domain([0, 100])
            .range([1, 50]);

        // draws circle part of node
        this.nodes.append("circle")
            .attr("r", function(d) {
                return _vis.radiusScale(parseInt(d["popularity"]));
            })
            .attr("fill", function (d) {
                return _vis.modeColours[d["mode"]]
            });

        // draws arcs of node
        for (k = 0; k < properties.length; k++) {
            // for each property, create a scale
            let ringScale = this.setArcScale(properties[k])

            // for each property append arc
            let arc = d3.arc()
                .innerRadius(function (d, i) {
                    let circle_radius = _vis.radiusScale(parseInt(d["popularity"]));
                    return circle_radius + _vis.arcPad + k * (_vis.arcWidth) + _vis.arcPad;
                })
                .outerRadius(function (d, i) {
                    let circle_radius = _vis.radiusScale(parseInt(d["popularity"]));
                    return circle_radius + _vis.arcPad + (k + 1) * (_vis.arcWidth);
                })
                .startAngle(0 * (PI / 180))
                .endAngle(function (d, i) {
                    //return 10 * (PI/180)
                    return ringScale(d[properties[k]]) * (PI / 180); // use property angle scale
                });

            this.nodes.append("path")
                .attr("d", arc)
                .attr("fill", this.colourScale[k]);
        }

        // use force
        this.simulation.nodes(this.data);
        this.simulation.on("tick", function (d) {
            //position nodes
            d3.selectAll(".node")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")"
                })
        });
        this.simulation.alpha(1).restart();
    }

    this.setArcScale = function (property) {
        // get max of property
        let maxVal = d3.max(this.data, function (d) {
            return parseFloat(d[property])
        });
        let scale = d3.scaleLinear()
            .domain([0, maxVal])
            .range([0, 360]);

        return scale
    }

    this.createLegend = function(properties) {
        properties = properties === undefined ? ["danceability", "energy", "acousticness", "valence", "tempo"] : properties;
        let cellSize = 15;

        //create key
        let key = d3.select("#legend").append("g")
            .attr("id", "key")
            .attr("class", "key");

        key.selectAll("rect")
            .data(this.colourScale)
            .enter()
            .append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function (d, i) {
                return i * 200;
            })
            .attr("fill", function (d) {
                return d;
            });

        key.selectAll("text")
            .data(this.colourScale)
            .enter()
            .append("text")
            .attr("x", function (d, i) {
                return cellSize + 5 + (i * 200);
            })
            .attr("y", "1em")
            .text(function (d, i) {
                return properties[i];
            });

        // create mode key
        let mode_key = d3.select("#legend").append("g")
            .attr("id", "mode_key")
            .attr("class", "key")
            .attr("transform", "translate(0,50)");

        mode_key.selectAll("rect")
            .data(this.modeColours)
            .enter()
            .append("rect")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function (d, i) {
                return i * 200;
            })
            .attr("fill", function (d) {
                return d;
            });

        mode_key.selectAll("text")
            .data(this.modeColours)
            .enter()
            .append("text")
            .attr("x", function (d, i) {
                return cellSize + 5 + (i * 200);
            })
            .attr("y", "1em")
            .text(function (d, i) {
                if (i == 0) {
                    return "minor";
                } else {
                    return "major";
                }
            });

        // popularity labels
        /*
        this.svgContainer.append("text")
            .attr("y", 50)
            .attr("x", 200)
            .attr("font-size", 30)
            .text("LOW POPULARITY");
        this.svgContainer.append("text")
            .attr("y", 50)
            .attr("x", 4500)
            .attr("font-size", 30)
            .text("HIGH POPULARITY");*/
    }
}

function setup() {
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

function loadData(path){
    // call D3's loading function for CSV and load the data to our global variable _data
    d3.csv(path).then(function(data){
        _vis.data = data;
        _vis.setupScales([MARGINS.left + FORCE_SPACE, _vis.width-MARGINS.left-FORCE_SPACE], [0,96],
            ["lightgray", "dimgray"],
            ["orange", "purple", "crimson", "teal", "yellowgreen"] );
        _vis.setForce();
        _vis.createNodes();
        _vis.createLegend();
    });

}