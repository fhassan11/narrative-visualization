const width = 960;
const height = 500;
let activeScene = 1;

const svg = d3.select("#visualization")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const data = [
    { year: 2000, temperature: 14.29, lat: 0, lon: 0 },
    { year: 2005, temperature: 14.39, lat: 0, lon: 0 },
    { year: 2010, temperature: 14.49, lat: 0, lon: 0 },
    { year: 2015, temperature: 14.69, lat: 0, lon: 0 },
    { year: 2020, temperature: 14.89, lat: 0, lon: 0 }
];

const x = d3.scaleLinear()
    .domain([2000, 2020])
    .range([50, width - 50]);

const y = d3.scaleLinear()
    .domain([14, 15])
    .range([height - 50, 50]);

function showScene(scene) {
    activeScene = scene;
    updateScene();
}

function updateScene() {
    svg.selectAll("*").remove();
    d3.select("#title").text("");
    d3.select("#description").text("");

    if (activeScene === 1) {
        renderOverview();
    } else if (activeScene === 2) {
        renderYearFocus();
    } else if (activeScene === 3) {
        renderInteractiveMap();
    }
}

function renderOverview() {
    d3.select("#title").text("Global Temperature Changes (2000-2020)");
    d3.select("#description").text("This overview shows the global average temperatures from 2000 to 2020.");

    svg.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", "translate(50, 0)")
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.temperature))
        );

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.temperature))
        .attr("r", 5)
        .attr("fill", "black");

    const annotations = [
        {
            note: { label: "Temperature in 2000", title: "2000" },
            x: x(2000),
            y: y(14.29),
            dx: 50,
            dy: -50
        },
        {
            note: { label: "Temperature in 2020", title: "2020" },
            x: x(2020),
            y: y(14.89),
            dx: -50,
            dy: -50
        }
    ];

    const makeAnnotations = d3.annotation()
        .annotations(annotations);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);
}

function renderYearFocus() {
    d3.select("#title").text("Focus on the Year 2010");
    d3.select("#description").text("This section highlights the temperature for the year 2010 with additional details.");

    const yearFocusData = data.filter(d => d.year === 2010);

    svg.append("g")
        .attr("transform", `translate(0, ${height - 50})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("transform", "translate(50, 0)")
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "lightgray")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => y(d.temperature))
        );

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.temperature))
        .attr("r", 5)
        .attr("fill", "lightgray");

    svg.selectAll(".focus-dot")
        .data(yearFocusData)
        .enter().append("circle")
        .attr("class", "focus-dot")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.temperature))
        .attr("r", 8)
        .attr("fill", "red");

    const focusAnnotations = [
        {
            note: { label: "Temperature in 2010", title: "2010" },
            x: x(2010),
            y: y(14.49),
            dx: 50,
            dy: -50
        }
    ];

    const makeFocusAnnotations = d3.annotation()
        .annotations(focusAnnotations);

    svg.append("g")
        .attr("class", "annotation-group")
        .call(makeFocusAnnotations);
}

function renderInteractiveMap() {
    d3.select("#title").text("Interactive Map of Temperature Changes");
    d3.select("#description").text("Explore global temperature changes by interacting with the map.");

    const projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(geojson) {
        svg.append("g")
            .selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "lightgray")
            .attr("stroke", "black");

        svg.selectAll(".circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => projection([d.lon, d.lat])[0])
            .attr("cy", d => projection([d.lon, d.lat])[1])
            .attr("r", 5)
            .attr("fill", "blue")
            .on("mouseover", function(event, d) {
                d3.select(this).attr("fill", "orange");
                const xPosition = parseFloat(d3.select(this).attr("cx")) + 10;
                const yPosition = parseFloat(d3.select(this).attr("cy")) - 10;
                svg.append("text")
                    .attr("id", "tooltip")
                    .attr("x", xPosition)
                    .attr("y", yPosition)
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(`${d.year}: ${d.temperature}°C`);
            })
            .on("mouseout", function() {
                d3.select(this).attr("fill", "blue");
                d3.select("#tooltip").remove();
            })
            .on("click", function(event, d) {
                d3.select("#info").remove();
                svg.append("text")
                    .attr("id", "info")
                    .attr("x", 10)
                    .attr("y", 20)
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "14px")
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(`Year: ${d.year}, Temperature: ${d.temperature}°C, Location: (${d.lat}, ${d.lon})`);
            });
    });
}

updateScene();
