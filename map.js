d3.csv("data/Buildings.csv").then(function(data) {

  // Determine the domain for the scales
  const maxX = d3.max(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.max(coords, pair => pair[0]);
  });
  const maxY = d3.max(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.max(coords, pair => pair[1]);
  });

  const minX = d3.min(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.min(coords, pair => pair[0]);
  });
  const minY = d3.min(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.min(coords, pair => pair[1]);
  });

  // Specify the desired dimensions for the SVG container
  const svgWidth = 500;
  const svgHeight = 500;

  // Create an SVG container
  const svg = d3.select('#map')
    .append('svg')
    .attr('width', 800)
    .attr('height', svgHeight);

  // Check if the SVG container is correctly created and appended to the DOM
  if (!svg.node()) {
    console.error('SVG container is not correctly created or appended to the DOM');
    return;
  }
  const quadrants = [
    { x: 0, y: 0, width: svgWidth / 2, height: svgHeight / 2, color: 'rgba(144, 238, 144, 0.4)', label: 'Zone 1' },
    { x: svgWidth / 2, y: 0, width: svgWidth / 2, height: svgHeight / 2, color: 'rgba(176, 196, 222, 0.4)', label: 'Zone 2' },
    { x: 0, y: svgHeight / 2, width: svgWidth / 2, height: svgHeight / 2, color: ' rgba(255, 218, 185, 0.4)', label: 'Zone 3' },
    { x: svgWidth / 2, y: svgHeight / 2, width: svgWidth / 2, height: svgHeight / 2, color: 'rgba(209, 95, 128, 0.4)', label: 'Zone 4' }
];

svg.selectAll('rect')
.data(quadrants)
.enter().append('rect')
.attr('x', d => d.x)
.attr('y', d => d.y)
.attr('width', d => d.width)
.attr('height', d => d.height)
.attr('fill', d => d.color)


  const tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .style("background", "#fff")
  .style("border", "1px solid #ddd")
  .style("padding", "5px");

  paths = []

  data.forEach(function(d) {
    // Extract the polygon coordinates from the WKT format
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));

    // Scale the coordinates to fit within the new dimensions
    const scaledCoords = coords.map(pair => [
      ((pair[0] - minX) / (maxX - minX)) * svgWidth,
      svgHeight - ((pair[1] - minY) / (maxY - minY)) * svgHeight

      // ((pair[1] - minY) / (maxY - minY)) * svgHeight
    ]);

    // Create a path data string
    const pathData = "M" + scaledCoords.map(pair => pair.join(',')).join('L') + "Z";

    const path = svg.append('path')
      .attr('d', pathData)
      .attr('fill', function() {
        if (d.buildingType === 'Commercial') {
          return 'green';
        } else if (d.buildingType === 'School') {
          return 'red';
        }
          else {
          return 'grey';
        }
      })


    paths.push(path);


    console.log(d.buildingId);
  });



  const buildingCount = data.length;


}).catch(function(error) {
  console.error('Error loading CSV data:', error);
});
