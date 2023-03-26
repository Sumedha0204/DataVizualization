
//const periods=["Late Triassic","Early Jurassic","Mid Jurassic","Late Jurassic","Early Cretaceous", "Late Cretaceous"]
const periods=["Early Cretaceous","Early Jurassic","Late Cretaceous","Late Jurassic","Late Triassic", "Mid Jurassic"]

const types = ["armoured dinosaur", "ceratopsian", "euornithopod", "large theropod", "sauropod", "small theropod"]
//const years=[1900, 1925, 1950, 1975, 2000, 2025]

// const periods = [
//     { name: "Early Cretaceous", start: new Date("124 million years ago"), end: new Date("90 million years ago") },
//     { name: "Early Jurassic", start: new Date("213 million years ago"), end: new Date("170 million years ago") },
//     { name: "Late Cretaceous", start: new Date("99 million years ago"), end: new Date("65 million years ago") },
//     { name: "Late Jurassic", start: new Date("150 million years ago"), end: new Date("135 million years ago") },
//     { name: "Late Triassic", start: new Date("220 million years ago"), end: new Date("190 million years ago") },
//     { name: "Mid Jurassic", start: new Date("170 million years ago"), end: new Date("150 million years ago") }
// ];


document.addEventListener('DOMContentLoaded', function () {

//svg = d3.select('#my_dataviz');

Promise.all([d3.csv('output.csv',(d)=> {
    return {
        type: d.type,
        period_name: d.period_name,
        lived_name: d.lived_name
    };
})])
    .then(function (values) {
        dinosaurs_data = values[0]

        data = []

        for (i=0; i<6; i++) {
            data.push({period: periods[i], "armoured dinosaur": getStrength(i, 0), "ceratopsian": getStrength(i, 1),
            "euornithopod": getStrength(i, 2), "large theropod": getStrength(i, 3), "sauropod": getStrength(i,4),
            "small theropod": getStrength(i,5)})
        }
        console.log(data)

        createGraph()
});


});

function createGraph() {

const margin = {top: 10, right: 30, bottom: 40, left: 50},
    width = 1100 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")

    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

// Parse the Data

    // List of groups = header of the csv files

    const keys = types

    //Add X axis


const x = d3.scaleBand()
    //.domain(data.map(function(d) { return d.period; }))
    .domain(periods)  // set the domain to the `periods` array
    .range([ 0, width])
    .padding(1.1);


    svg.append("g")
        .attr("transform", `translate(0, ${height*0.8})`)
        .call(d3.axisBottom(x).tickSize(-height*.7).tickValues(periods))
        .select(".domain").remove()


   // Customization
   svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2)
        .attr("y", height-30 )
        .text("Time (period)");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([-200, 200])
        .range([ height, 0 ]);

    // add ylable
    // Add Y axis label:
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)
        .attr("y", margin.left)
        .text("Number of dinosaurs");

    // color palette
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);

    //stack the data?
    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data)

    // create a tooltip
    const Tooltip = svg
        .append("text")
        .style("opacity", 10)
        .style("font-size", 25)
        .style('transform', `translate(${500}px, ${150}px)`)

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event,d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 2)
            .style("stroke-width", 2)



    }
    const mousemove = function(event,d,i) {
        grp = d.key
       Tooltip.text(grp)

    }
    const mouseleave = function(event,d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }

    const curve = d3.curveCardinal.tension(0.5); // set tension to control the curvature

    // Area generator
    const area = d3.area()
        .x(function(d) { return x(d.data.period); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(curve); // set the curve type


    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .join("path")
        .attr("class", "myArea")
        .style("fill", function(d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)




    // Add one dot in the legend for each name.
    var size = 17
    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", 880)
        .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 880 + size*1.2)
        .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

}




function getStrength(i, j) {
return dinosaurs_data.filter(obj => obj.type === types[j] && obj.period_name === periods[i]).length
}

