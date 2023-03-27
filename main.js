
//const periods=["Late Triassic","Early Jurassic","Mid Jurassic","Late Jurassic","Early Cretaceous", "Late Cretaceous"]
const periods=["Early Cretaceous","Early Jurassic","Late Cretaceous","Late Jurassic","Late Triassic", "Mid Jurassic"]

const types = ["armoured dinosaur", "ceratopsian", "euornithopod", "large theropod", "sauropod", "small theropod"]
const country=["Argentina","USA","China","United Kingdom","Mongolia","Canada","Germany"]

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

// Use reduce to count the number of countries for each dinosaur type
const countryCountsByType = types.reduce((counts, data) => {
    const { type, country } = data;
    if (!counts[type]) {
        counts[type] = {};
    }
    if (!counts[type][country]) {
        counts[type][country] = 0;
    }
    counts[type][country]++;
    return counts;
}, {});

console.log(countryCountsByType);





function createGraph() {

    const margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 890 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#stream_svg")
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
        .attr("y", height-50 )
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
        .style('transform', `translate(${350}px, ${150}px)`)

    // Three function that change the tooltip when user hover / move / leave a cell

    const mouseover = function(event,d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 2)
            .style("stroke-width", 2)

    }

    const clickFunction = function (event, d) {
        createPieChart(d.key)
    }

    const mousemove = function(event,d,i) {
        grp = d.key
       Tooltip.text(grp)

    }
    const mouseleave = function(event,d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }

    const curve = d3.curveCardinal.tension(0.1); // set tension to control the curvature

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
        .on("click", clickFunction)


    // Add one dot in the legend for each name.
    var size = 17
    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", 775)
        .attr("y", function(d,i){ return 180 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 775 + size*1.1)
        .attr("y", function(d,i){ return 180 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

}


function getStrength(i, j) {
    return dinosaurs_data.filter(obj => obj.type === types[j] && obj.period_name === periods[i]  ).length
}


function createPieChart(type) {
    console.log(type)

    argCount = getTypeInCountry(type, "Argentina");

    usaCount = getTypeInCountry(type, "USA");

    chinaCount = getTypeInCountry(type, "China");

    ukCount = getTypeInCountry(type, "United Kingdom");

    mongoliaCount = getTypeInCountry(type, "Mongolia");

    canadaCount = getTypeInCountry(type, "Canada");

    germanyCount = getTypeInCountry(type, "Germany");

    total = getTypeCount(type);

    otherCount = total - germanyCount - canadaCount - mongoliaCount - ukCount - chinaCount - usaCount - argCount;

    if (otherCount < 0) {
        otherCount = 0;
    }

    const width = 580;
    const height = 580;

    pie_svg = d3.select("#pie_svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const data = [
        { name: "Argentina", count: argCount, percent: argCount / total },
        { name: "USA", count: usaCount, percent: usaCount / total },
        { name: "China", count: chinaCount, percent: chinaCount / total },
        { name: "United Kingdom", count: ukCount, percent: ukCount / total },
        { name: "Mongolia", count: mongoliaCount, percent: mongoliaCount / total },
        { name: "Canada", count: canadaCount, percent: canadaCount / total },
        { name: "Germany", count: germanyCount, percent: germanyCount / total },
        { name: "Other", count: otherCount, percent: otherCount / total }
    ];

    const argColor = "#41EAD3";
    const usaColor = "#0FE469";
    const chinaColor = "#6741EA";
    const ukColor = "#E48A0F";
    const monColor = "#0F9DE4";
    const canColor = "#F60A38";
    const gerColor = "#090909";
    const otherColor ="#E1E40F";
    //var color = d3.scaleOrdinal(d3.schemeSet3)
    var color = d3.scaleOrdinal()
        .domain(data)
        .range([argColor, usaColor, chinaColor, ukColor, monColor, canColor, gerColor, otherColor]);


    var pie = d3.pie()
        .value(function(d) { return d.percent; });

    var arc = d3.arc()
        .outerRadius(150)
        .innerRadius(100);

    var g = pie_svg.selectAll("arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("stroke", "black")
        .style("stroke-width", 2)
       // .attr("fill", "#ffffff");
        .attr("fill", function(d) { return color(d.data.name); });


    g.append("path");
    g.on("mouseover", function(d,i) {
        d3.select(this).select("path")
            .style("stroke", "black")
            .style("stroke-width", 4)
            .style("opacity", 1);
        var ttext = pie_svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(i.data.name + ":" + i.data.count);

    });

    g.on("mouseout", function(d) {
        d3.select(this).select("path")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("opacity", 1);
        pie_svg.selectAll("text").remove();

    });

}

function getTypeCount(type) {
    return dinosaurs_data.filter(obj => obj.type === type).length
}

function getTypeInCountry(type, country) {
    return dinosaurs_data.filter(obj => obj.type === type && obj.lived_name === country  ).length
}







