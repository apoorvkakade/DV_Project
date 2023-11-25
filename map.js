csv_data=[]
var pieG;
var pieSvg;
function drawPieChart(event, d)
{
  var counts={'employers':0, 'apartments':0, 'restaurants':0, 'schools':0, 'pubs':0};
  csv_data.forEach(csv_d=>{
    if(csv_d.quadrant == d.quadrant)
    {
      if(csv_d.exactbuildingtype in counts)
      {
        counts[csv_d['exactbuildingtype']]++;
      }
      else
      {
        counts[csv_d['exactbuildingtype']] = 1;
      }
    }
  });
  const width = 500;
  const height = 500;
const radius = Math.min(width, height) / 3;

const countData = Object.keys(counts).map(key => ({
    exactBuildingType: key,
    count: counts[key],
}));
// pieG.selectAll('*').remove();

const colorScale = d3.scaleOrdinal()
.domain(countData.map(d => d.exactBuildingType))
.range(['#ffcc00', '#66c2ff', '#99ff99', '#ff6666', '#cc99ff']);

pieSvg.selectAll('*').remove();
pieG = pieSvg.append('g')
.attr('transform', `translate(${500 / 2}, ${500 / 2})`);
const pie = d3.pie()
.value(d => d.count) // Use the 'count' property as the value
.sort(null);


const arcs = pie(countData);

// Draw the pie slices
const path = pieG.selectAll('path')
    .data(arcs)
    .enter().append('path')
    .attr('d', d3.arc().outerRadius(radius).innerRadius(0))
    .attr('fill', d => colorScale(d.data.exactBuildingType))
    .attr('stroke', 'white') // Add a white border for better visibility
    .style('stroke-width', '2px');


var legendG = pieSvg.selectAll(".legend") // note appending it to mySvg and not svg to make positioning easier
  .data(arcs)
  .enter().append("g")
  .attr('transform', (d, i) => `translate(0,${50+i * 20})`)
  .attr("class", "legend");   

legendG.append("rect") // make a matching color rect
  .attr("width", 10)
  .attr("height", 10)
  .attr("fill", d => colorScale(d.data.exactBuildingType));

legendG.append("text") // add the text
  .text(function(d){
    return d.data.exactBuildingType + "  " + d.data.count;
    // return "Apoorv";
  })
  .style("font-size", 12)
  .attr("y", 10)
  .attr("x", 11);



}

function getQuadrant(x,y)
{
  const originX = -1125;
  const originY = 4009;

  // Calculate relative coordinates
  const relativeX = x - originX;
  const relativeY = originY - y; // Reverse the y-axis

  // Determine the quadrant
  if (relativeX >= 0 && relativeY >= 0) {
      return 4; // Four quadrant
  } else if (relativeX < 0 && relativeY >= 0) {
      return 3; // Third quadrant
  } else if (relativeX < 0 && relativeY < 0) {
      return 1; // First quadrant
  } else {
      return 2; // Second quadrant
  }
}

function dataConverter(row)
{
  for(const col in row)
  {
    if(col ==='point')
    {
      const match = row[col].match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/);
      if(match)
      {
        row['x'] = parseFloat(match[1]);
        row['y'] = parseFloat(match[2]);
        row['location_present'] = true;

        row['quadrant'] = getQuadrant(row['x'], row['y']);
      }
      else
      {
        row['x']=0;
        row['y']=0;
        row['location_present'] = false;
        row['quadrant'] = 0;
      }
    }
  }
  return row
}

document.addEventListener("DOMContentLoaded", function()
{
  pieSvg = d3.select('#pie_svg');

  pieG = pieSvg.append('g')
  .attr('transform', `translate(${500 / 2}, ${500 / 2})`);
  load_csv_and_draw();
})
function load_csv_and_draw()
{

d3.csv("data/result_df_1.csv", dataConverter).then(function(data) {
  
  csv_data =data;



   maxX = d3.max(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.max(coords, pair => pair[0]);
  });
   maxY = d3.max(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.max(coords, pair => pair[1]);
  });

   minX = d3.min(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.min(coords, pair => pair[0]);
  });
   minY = d3.min(data, d => {
    let coords = d.location.match(/(\(\((.*?)\)\))/)[2]
      .split(', ')
      .map(pair => pair.split(' ').map(Number));
    return d3.min(coords, pair => pair[1]);
  });

  // Specify the desired dimensions for the SVG container
  const svgWidth = 500;
  const svgHeight = 500;

  // Create an SVG container
  const svg = d3.select('#map_svg')

  // Check if the SVG container is correctly created and appended to the DOM
  if (!svg.node()) {
    console.error('SVG container is not correctly created or appended to the DOM');
    return;
  }
  const quadrants = [
    { x: 0, y: 0, width: svgWidth / 2, height: svgHeight / 2, color: 'rgba(144, 238, 144, 0.4)', label: 'Zone 1', quadrant:1 },
    { x: svgWidth / 2, y: 0, width: svgWidth / 2, height: svgHeight / 2, color: 'rgba(176, 196, 222, 0.4)', label: 'Zone 2', quadrant:2 },
    { x: 0, y: svgHeight / 2, width: svgWidth / 2, height: svgHeight / 2, color: ' rgba(255, 218, 185, 0.4)', label: 'Zone 3', quadrant:3 },
    { x: svgWidth / 2, y: svgHeight / 2, width: svgWidth / 2, height: svgHeight / 2, color: 'rgba(209, 95, 128, 0.4)', label: 'Zone 4', quadrant:4 }
];

svg.selectAll('rect')
.data(quadrants)
.enter().append('rect')
.attr('x', d => d.x)
.attr('y', d => d.y)
.attr('width', d => d.width)
.attr('height', d => d.height)
.attr('fill', d => d.color)
.on('click', drawPieChart);

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
      });

    paths.push(path);
  });

}).catch(function(error) {
  console.error('Error loading CSV data:', error);
});
}



