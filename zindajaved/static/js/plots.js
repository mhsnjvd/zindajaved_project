// Function to set margins
// height and width of the svg image are passed:
function defineMargins(height, width)
{
     var topMargin = height/8;
     var rightMargin = width/20;
     var bottomMargin = height/8;
     var leftMargin = width/20;
     var margin = {top: topMargin, right: rightMargin, bottom: bottomMargin, left: leftMargin};
     return margin;
}

function getVerticalScales(svg, margin, data)
{
     var scales = {};
    // Define the margins:
    var height = svg.attr("height");
    var width = svg.attr("width");    

    var minyData = d3.min(data);
    var maxyData = d3.max(data); 

    // Add some cushion for the data to look nice:
    minyData = minyData - 0.5*(maxyData - minyData);
    if ( minyData <= 0 )
    {
        minyData = 0;
    }

    // y scale
    scales.yScale = d3.scaleLinear()
              .domain([minyData, maxyData])
              .range([height-margin.top,  margin.bottom]);

    scales.hScale = d3.scaleLinear()
                   .domain([minyData, maxyData])
                   .range([0, height-margin.top - margin.bottom]);
    return scales;
}

// Takes  a d3 selected SVG element and makes a histogram
function plotHistogram( svg, margin, xData, yData, xScale, yScale, heightScale, barColor)
{
    // Object to be returned which will have an update function
    histogram = {};
    var height = svg.attr("height");
    var width  = svg.attr("width");
    
    // Switch to default if no color is passed
    barColor = barColor || "DeepSkyBlue"
    
    if ( typeof(barColor) === "string")
    {
        // Copy the same string n times, for each data entry
        barColor = yData.map(function(d) {return barColor;});
    }
    else
    {
        // Should be an array of colors
        if ( barColor.length !== yData.length)
        {
             console.log( "plotHistogram: number of colors not the same as number of bars.");
        }
    }
    
    // Draw the rectangles with 0 height:
    var bars = svg.selectAll("rect")
    .data(yData)
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return xScale(i); })
    .attr("y", function(d) { return height - margin.bottom;})
    .attr("height", function(d) { return 0; })
    .attr("width", function(d) { return xScale.bandwidth(); })
    .attr("fill", function(d, i){ return barColor[i];} );

    // animate the bars:
    svg.selectAll("rect")
    .data(yData)
    .transition()
    .duration(2000)
    .attr("y", function(d) { return yScale(d);})
    .attr("height", function(d) { return heightScale(d); });
    
     // Define the tooltip:     
    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
               return "Value: <span style='color:red'>" + d + "</span>";
          });

    bars.call(tip);

    // Functions for mouse-over and mouse-out:
    bars.on("mouseover", function(d)
           {
               d3.select(this)                
               .transition()
               .duration(200)                                    
               .attr("fill", "blue");

               var numberFormatter = d3.format(",.2f");
               tip.show(numberFormatter(d));
                           
               return;
           });

    bars.on("mouseout", function(d, i)
           {
               d3.select(this)
               .transition()
               .duration(500)
               .attr("fill", barColor[i]);

               tip.hide();

               return;
           });    

    bars.update = function(newData)
    {
        svg.selectAll("rect")
        .data(newData)
        .transition()
        .duration(2000)
        .attr("y", function(d) { return yScale(d);})
        .attr("height", function(d) { return heightScale(d); });
    }
    return bars;
}


// Takes  a d3 selected SVG element and makes a histogram
// where each bar of the histogram has multiple sub quantities
// xData is an array
// yData is an 2D array with length equal to xData but each element is an array of 
// size equal to the number of sub quantities
// WARNING: yData is assumed to be non-negative
function plotMultiHistogram( svg, margin, xData, yData, xScale, yScale, heightScale, barColorArray)
{
     // Object to be returned which will have an update function
     histogram = {};
     var height = svg.attr("height");
     var width  = svg.attr("width");
     
     if ( yData.length !== xData.length )
     {
         console.log( 'plotMultiHistogram: xData an yData should have same length' );
     }

     if ( yData[0].length !== barColorArray.length )
     {
         console.log( 'plotMultiHistogram: not enough colors specified for each bar.');
     }


     // Append the groups to which bars will be attached:
     for ( var barIndex = 0; barIndex < xData.length; barIndex++ )
     {
         svg.append("g")
         .attr("id", "bars" + barIndex )
         .attr("transform", "translate(" + xScale(barIndex) + ",0)");
     }

     // for each bar:
     for ( var barIndex = 0; barIndex < xData.length; barIndex++ )
     {
         // y-Data for this bar:
         var yBarData = yData[barIndex];

         // Initialize the offset array with 0.0
         var yOffset = yBarData.map(function(d) { return 0.0; } );
         for ( var i = 1; i < yOffset.length; i++ )
         {
             // Offset is simply the cumulative sum:
             yOffset[i] = yOffset[i-1] + yBarData[i-1];
         }

         // Draw the rectangles with 0 height:
         var bars = svg.select("#bars"+barIndex)
         .selectAll("rect")
         .data(yBarData)
         .enter()
         .append("rect")
         // fix the x coordinate to 0 because the "g" is already passed through the xScale()
         .attr("x", function(d, i) { return 0; }) 
         .attr("y", function(d, i) { return yScale(d + yOffset[i]);})
         .attr("height", function(d) { return 0*heightScale(d); })
         .attr("width", function(d) { return xScale.bandwidth(); })
         .attr("fill", function(d, i){ return barColorArray[i];} );

        // animate the bars:
        svg.select("#bars" + barIndex )
        .selectAll("rect")
        .data(yBarData)
        .transition()
        .duration(2000)
        .attr("y", function(d, i) { return yScale(d + yOffset[i]);})
        .attr("height", function(d) { return heightScale(d); });

         // Define the tooltip:     
        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
               return "Value: <span style='color:red'>" + d + "</span>";
          });

        bars.call(tip);

        // Functions for mouse-over and mouse-out:
        bars.on("mouseover", function(d)
           {
               d3.select(this)                
               .transition()
               .duration(1000)                                    
               .attr("fill", "blue");

               var numberFormatter = d3.format(",.2f");
               tip.show(numberFormatter(d));
                           
               return;
           });

        bars.on("mouseout", function(d, i)
           {
               d3.select(this)
               .transition()
               .duration(1000)
               .attr("fill", barColorArray[i]);

               tip.hide();

               return;
           });    
     }
}


function addTitle( svg, title, align)
{
  var height = svg.attr("height");
  var width = svg.attr("width");

  var alignment = align || "middle";

  var plotTitle = svg.append("text")
        .attr( "id", "plotTitle")
        .attr("x", (width - title.length) / 2.0 + 10)
        .attr("y", 15 )
        .style("text-anchor", alignment)
        .style("font-weight", "bold")
        .text(title);  
  return plotTitle;  
}

function plotXLabel( svg, margin, xLabel)
{
  var height = svg.attr("height");
  var width = svg.attr("width");

  var label = svg.append("text")
        .attr( "id", "xLabel")
        .attr("x", margin.left + (width - margin.left - margin.right - xLabel.length) / 2)
        .attr("y", height - (margin.top  / 4) )
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(xLabel);  
  return label;  
}

function plotYLabel(svg, margin, yLabel, xShift=margin.left)
{
   var label = svg.append("text")
        .attr( "id", "yLabel")
        .attr("x", xShift)
        .attr("y", margin.top  / 2 )
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(yLabel);

        return label;
}

// Takes  an SVG element and draws a line
function plotLine( svg, margin, xData, yData, xScale, yScale, lineColor)
{     
    // Define the line
    var dummyLineFunction = d3.line()
    .x( function(d, i){ return xScale(0) + xScale.bandwidth()/2; })
    .y( function(d, i){ return yScale(yData[0])-margin.bottom; });


    var lineFunction = d3.line()
    .x( function(d, i){ return xScale(i) + xScale.bandwidth()/2; })
    .y( function(d, i){ return yScale(d)-margin.bottom; });

    // Adds the svg canvas
    var lineGraph = svg.append("g")
    .attr("transform", "translate(" + 0 + "," + margin.top + ")")
    .attr('id', "lines"+lineColor);

    // Add the valueline path.
    lineGraph.append("path")
    .attr("class", "line")
    .attr("d", dummyLineFunction(yData))
    .attr("stroke", lineColor)
    .attr("stroke-width", 2)
    .attr("fill", "none");

    // Animations:
    svg.select("#lines"+lineColor)
    .selectAll("path")
    .data(yData)
    .transition()
    .duration(2000)
    .attr("d", lineFunction(yData));
    

    return lineGraph;
} // End of function plotQuarterlyLine


// gridlines in x axis function
function make_x_gridlines(nLines) {        
    return d3.axisBottom(x)
            .ticks(nLines)
}

// gridlines in y axis function
function make_y_gridlines() {        
    return d3.axisLeft(y)
           .ticks(nLines)
}

function plotHorisontalGrid( svg, margin, nLines)
{
    /*
    var height = svg.attr("height") - margin.top  - margin.bottom;
    var width  = svg.attr("width")  - margin.left - margin.right,

    svg.append("g")         
       .attr("id", 'horzGridLines')                          
       .attr("class", "grid")
       .call(make_y_gridlines(nLines)
       .tickSize(-width)
       .tickFormat(""))
    */
    var height = svg.attr("height");
    var width  = svg.attr("width");

    // Draw the gird lines with 0 length:
    var grid = d3.range(nLines).map( function(d){ 
      return {'x1': margin.left, 'y1': margin.top, 'x2': margin.left, 'y2':margin.top};
    });

   var spanHeight = (height - margin.top - margin.bottom)/nLines;
   var grids = svg.append('g')
              .attr("id", 'horzGridLines')                          
              .selectAll('line')
              .data(grid)
              .enter()
              .append('line')
              .attr({'x1':function(d, i){ return d.x1; },
                     'y1':function(d, i){ return d.y1 + (i)*spanHeight; },
                     'x2':function(d, i){ return d.x2; },
                     'y2':function(d, i){ return d.y2 + (i)*spanHeight; } });
              //.style({'stroke':'#adadad','stroke-width':'1px'});

    // animate the gird lines:
    svg.select("#horzGridLines")
       .selectAll("line")
       .data(grid)
       .transition()
       .duration(2000)
       .attr("x2", function(d) { return width - margin.right;});
}

function plotCircles(svg, margin, xData, yData, xScale, yScale, circleColor)
{
    var circlesSVG = svg.append("g")
    .attr("transform", "translate("+ 0 +","+margin.top+")")
    .attr("id", "circles"+circleColor);

    var normalRadius = 3;

    var circles = circlesSVG.selectAll("circle")
    .data(yData)
    .enter()
    .append("circle")
    .attr("cx", function(d, i){ return xScale(0) + xScale.bandwidth()/2;})
    .attr("cy", function(d, i){ return yScale(yData[0]) - margin.bottom;})
    .attr("r", normalRadius)
    .attr("fill", circleColor);


    // Animations:
    svg.select("#circles"+circleColor)
    .selectAll("circle")
    .data(yData)
    .transition()
    .duration(2000)
    .attr("cx", function(d, i){ return xScale(i) + xScale.bandwidth()/2;})
    .attr("cy", function(d, i){ return yScale(d) - margin.bottom;});
    

    var tip = d3.tip()
     .attr('class', 'd3-tip')
     .offset([-10, 0])
     .html(function(d) {
                return "Value: <span style='color:red'>" + d + "</span>";
           });

     circles.call(tip);

     circles.on("mouseover", function(d){
        var mouseOnRadius = 2 * normalRadius;
        var circle = d3.select(this);
        circle.transition()
       .duration(250)
       .attr("r", mouseOnRadius)
       .attr("fill", "black")
       .attr("opacity", 1);

       var numberFormatter = d3.format(",.2f");
       tip.show(numberFormatter(d));
     });

     circles.on("mouseout", function(d){    
        var mouseOutRadius = normalRadius;
        var circle = d3.select(this);
        circle.transition()
       .duration(250)
       .attr("opacity", 1.0)
       .attr("fill", circleColor)
       .attr("r", mouseOutRadius);

       tip.hide();
     });
    
    return circles;
}

function plotVerticalGrid( svg, margin, nLines)
{
    var height = svg.attr("height");
    var width  = svg.attr("width");

    var grid = d3.range(nLines).map( function(d)
    {
      return {'x1':margin.left,'y1':margin.top,'x2':margin.left,'y2':margin.top};
    });    

    var gridSpacing = (width - margin.left - margin.right )/nLines;

    var grids = svg.append('g')
              .attr("id", 'verticalGridLines')                                      
              .selectAll('line')
              .data(grid)
              .enter()
              .append('line')
              .attr({'x1':function(d, i){ return margin.left + (i+1)*gridSpacing; },
                     'y1':function(d, i){ return margin.top; },
                     'x2':function(d, i){ return margin.left + (i+1)*gridSpacing; },
                     'y2':function(d, i){ return margin.top; } })
              .style({'stroke':'#adadad','stroke-width':'1px'});

     // animate the gird lines:
     svg.select("#verticalGridLines")
       .selectAll("line")
       .data(grid)
       .transition()
       .duration(2000)
       .attr("y2", function(d) { return height - margin.bottom;});        

}   

function plotHorisontalBars(svg, margin, categories, values)
{
    var height = svg.attr("height");
    var width = svg.attr("width");    

    var minVal = 0;
    var maxVal = d3.max(values);

    // used for the height of the horizontal bar and the gaps 
    // in between:
    var yScale = d3.scale.ordinal()
             .domain(d3.range(categories.length))
             .rangeRoundBands( [margin.top, height - margin.bottom], .2 );

    // used for the width of the horizontal bar:
    var xScale = d3.scaleLinear()
            .domain([0, maxVal])
            .range([0, width - margin.right - margin.left ]);
      
    var color = d3.scale.category20();
    var chart = svg.append('g')              
              .attr('id','horzBars')
              .selectAll('rect')
              .data(values)
              .enter()
              .append('rect')
              .attr("x", function(d, i) { return margin.left;})
              .attr("y", function(d, i) { return yScale(i);})
              .attr('height', yScale.bandwidth())              
              .attr('width',function(d){ return 0; })
              .style('fill', function(d,i){ return color(d); });

    // animate the horizontal bars:
     svg.select("#horzBars")
       .selectAll("rect")
       .data(values)
       .transition()
       .duration(2000)
       .attr("width", function(d) { 
            if ( d === 0 )
            { 
                d3.select(this).attr("opacity", 0);
                return width - margin.left - margin.right;
            }
            else
            { 
                 return xScale(d);
            }
          });    


       // Design text for the tool tip:
        var tip = d3.tip()
         .attr('class', 'd3-tip')
         .offset([-10, 0])
         .html(function(d, i) {
                var name = categories[i];
                var value = d;                
                var displayText = "<span style='color:red'>name: " + name + "</span> value: " + value;
                return displayText;
           });        

        
        chart.on("mouseover", function(d, i)
        {
            d3.select(this)
            .transition()
            .duration(500)
            .style("color", "blue");

            tip.show(d, i)       
        })
        .on("mouseout", function(d)
        {   
            d3.select(this)
            .transition()
            .duration(500)
            .style("color", color(d));

            tip.hide();            
        });

        chart.call(tip);

        var yAxis = d3.svg.axis();
         yAxis.orient('left')
        .scale(yScale)
        .tickSize(1)        
        .tickFormat(function(d,i){ return categories[i]; })
        .tickValues(d3.range(categories.length));

    var y_xis = svg.append('g')
              .attr("transform", "translate(" + margin.left + ",0)")
              .attr('id','yaxis')
              .call(yAxis)
              .selectAll("text")
              .attr("font-size", "6");
        
}


function initScatterSettings(width, height)
{
    var scatterStyle = {};
    var margin = {top: 40, right: 40, bottom: 60, left: 80};
    scatterStyle.margin = margin;
    scatterStyle.minRadius = 3;
    scatterStyle.maxRadius = 15;

    return scatterStyle;
}

// dataSet is an array which must have the following fields
// x for x coordinate
// y for y corrdinate
// value which controls the radius of the circle and must be non negative
// color for the color of each circle
// label to describe the name of the circle and associate with mouse hover etc.
function scatterObjectConstructor(svg, dataSet, scatterStyle)
{
    // Store the data:
    this.data = {};
    this.data.x = dataSet.map(function(d){ return +d.x; } );
    this.data.y = dataSet.map(function(d){ return +d.y; } );
    this.data.label = dataSet.map(function(d){ return d.label; } );
    this.data.value = dataSet.map(function(d){ return +d.value; } );

    var margin = scatterStyle.margin;
    var minRadius = scatterStyle.minRadius;
    var maxRadius = scatterStyle.maxRadius;

    var width = svg.attr("width") - margin.left - margin.right;
    var height = svg.attr("height") - margin.top - margin.bottom;

    var xScale = d3.scale.linear().domain([d3.min(this.data.x), d3.max(this.data.x)]).range([0, width]);
    var yScale = d3.scale.linear().domain([d3.min(this.data.y), d3.max(this.data.y)]).range([height, 0]);
    var rScale = d3.scale.linear().domain([0, d3.max(this.data.value)]).range([minRadius, maxRadius]);

    scatterStyle.xLabel = scatterStyle.xLabel || "x";
    this.xLabel = scatterStyle.xLabel;

    scatterStyle.yLabel = scatterStyle.yLabel || "y";
    this.yLabel = scatterStyle.yLabel;
    
    scatterStyle.tipEnabled = scatterStyle.tipEnabled || 1;
    this.tipEnabled = scatterStyle.tipEnabled;

    scatterStyle.transitionDuration =  scatterStyle.transitionDuration || 4000;
    this.transitionDuration =  +scatterStyle.transitionDuration;

    scatterStyle.showXAxis = scatterStyle.showXAxis || 1;
    this.showXAxis = scatterStyle.showXAxis;

    scatterStyle.showYAxis = scatterStyle.showYAxis || 1;
    this.showYAxis = scatterStyle.showYAxis;

    // SVG for the main scatter plot
    var scatterSVG = svg.append("g")
                 .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                 .attr("id", "scatter_circles");

    var circlesSVG = svg.select("#scatter_circles")
        .selectAll("circle")
        .data(dataSet)
        .enter()
        .append("circle")
        .attr("cx", function(d, i){ return xScale(d.x);})
        .attr("cy", function(d, i){ return yScale(d.y);})
        .attr("r",  function(d, i){ return 0*rScale(d.value); } )
        .attr("fill", function(d, i){ return d.color; });


    // Animations:
    svg.select("#scatter_circles")
    .selectAll("circle")
    .data(dataSet)
    .transition()
    .duration(scatterStyle.transitionDuration)
    .attr("r",  function(d, i){ return rScale(d.value); } );
    
    // Define tip
    var tip = d3.tip()
       .attr('class', 'd3-tip')
       .offset([-10, 0])
       .html(function(d, i) {
            var displayText = "<span style='color:red'>" + d.label + "</span>" + " value: " + dashBoardSettings.numberFormat(d.value);
                return displayText;
           });        
     
     circlesSVG.call(tip);

     circlesSVG.on("mouseover", function(d){
        var circle = d3.select(this);
        circle.transition()
       .duration(250)
       .attr("r", 3*rScale(d.value));

     if ( scatterStyle.tipEnabled )
     {
         tip.show(d);
     }
     });

     circlesSVG.on("mouseout", function(d){    
        var circle = d3.select(this);
        circle.transition()
       .duration(250)
       .attr("opacity", 1.0)
       .attr("fill", d.color)
       .attr("r", rScale(d.value));

     if ( scatterStyle.tipEnabled )
     {
       tip.hide();
     }
     });
  
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10);
        //.tickFormat(function(d, i) { return dataSet[i]["x"]; });      

    // Add the X Axis
    if ( scatterStyle.showXAxis )
    {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + ", " + (svg.attr("height") - margin.bottom) + ")")
            .call(xAxis);
    }

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left").ticks(10);

    if ( scatterStyle.showYAxis )
    {
        // Add the Y Axis
        var label = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(yAxis);  
    }

     /*
    // Animated update:
    this.update = function(newData)
    {
       // Remove text in the beginning
       textSVG.selectAll("*").remove();

       // Animate the new data
       pieSVG.selectAll("path")
       .data(pieLayOut(newData.map(function(d){ return d.value; })))
       .transition()
       .duration(pieStyle.transitionDuration)
       .attrTween("d", arcTween);

       // Add new text labels
       addText(newData.map(function(d){ return d.value;}));
    }   

    // Interpolation function
    function arcTween(a)
    {
       var i = d3.interpolate(this._current, a);
       this._current = i(0);
       return function(t) { return arc(i(t)); };
    }    
    */

    this.scatterSVG = scatterSVG;
    this.circlesSVG = circlesSVG;
}


function plotScatter(svg, scatterData, scatterStyle)
{
    // The mother of all objects:
    var scatter = {};
    var dataSet = scatterData;
    // Create dummy data initially:
    scatter.scatterPlot = new scatterObjectConstructor(svg, scatterData, scatterStyle);

    var height = svg.attr("height");
    var width = svg.attr("height");

    return scatter;
}

//**************************************************
// New graphics for pie charts
// *************************************************
function initPieSettings(width, height, colorFunction)
{
    var pieStyle = {};

    pieStyle.color = colorFunction;
    pieStyle.strokeColor = "orange";
    pieStyle.strokeWidth = 1.0;
    pieStyle.cx = width/1.4;
    pieStyle.cy = height/2;

    // These control the size of the pie
    pieStyle.outerRadius = width / 3.5
    pieStyle.innerRadius = pieStyle.outerRadius/1.6;


    // Text settings
    pieStyle.textSuffix = "";
    pieStyle.textColor = "black";
    pieStyle.textEnabled = 1;
    return pieStyle;
}

function initRaySettings(pieStyle)
{
    var rayStyle = {};

    rayStyle.color = pieStyle.color;
    rayStyle.strokeColor = "black";
    rayStyle.strokeWidth = "1";
    rayStyle.textSuffix = "";
    rayStyle.textColor = "black";
    rayStyle.cx = pieStyle.cx;
    rayStyle.cy = pieStyle.cy;
    var dr = pieStyle.outerRadius - pieStyle.innerRadius;
    rayStyle.outerRadius = pieStyle.outerRadius + dr/2;
    rayStyle.innerRadius = pieStyle.outerRadius - dr/2;
    // This is for turning rays on and off:
    rayStyle.raysEnabled = 0;

    return rayStyle;
}

function initLegendSettings(style)
{

    var legendStyle = {};
    legendStyle.shape = "rect";
    legendStyle.width = 12;
    legendStyle.height = 12;
    legendStyle.spacing = 3;
    legendStyle.cssClass = ".legend";
    //var colors = ["#dc3912", "#ff9900", "#109618", "grey"];
    legendStyle.color = style.color;

    // Top left for the legend:
    legendStyle.x = style.cx - 2.5*style.outerRadius; 
    legendStyle.y = style.cy - (legendStyle.height + legendStyle.spacing)*(legendStyle.color.length/2.0);
    return legendStyle;
}

// dataSet is an array of objects, where each object
// has two fields:
// {label: "xxxx", value: 42.134123}
function pieObjectConstructor(svg, dataSet, pieStyle)
{
    // Store the data:
    this.data = {};
    this.data.label = dataSet.map(function(d){ return d.label; } );
    this.data.value = dataSet.map(function(d){ return d.value; } );

    // Check if outer radius is given explicitly
    this.outerRadius = pieStyle.outerRadius || pieStyle.radius;

    // If inner radius is not given, assume it's zero
    this.innerRadius = pieStyle.innerRadius || 0;

    // Where is the centre of the pie:
    this.cx = pieStyle.cx;
    this.cy = pieStyle.cy;

    // What colors do we want for the borders and their width:
    pieStyle.strokeColor = pieStyle.strokeColor || "orange";
    this.strokeColor = pieStyle.strokeColor;

    pieStyle.strokeWidth = pieStyle.strokeWidth || 1.2;
    this.strokeWidth = pieStyle.strokeWidth; 
    
    pieStyle.percentageEnabled = pieStyle.percentageEnable || 0;
    this.percentageEnabled = pieStyle.percentageEnabled;

    pieStyle.tipEnabled = pieStyle.tipEnabled || 1;
    this.tipEnabled = pieStyle.tipEnabled;

    pieStyle.textColor = pieStyle.textColor || "black";
    this.textColor = pieStyle.textColor;

    pieStyle.textSuffix =  pieStyle.textSuffix || "";
    this.textSuffix =  pieStyle.textSuffix;

    pieStyle.transitionDuration =  pieStyle.transitionDuration || 3000;
    this.transitionDuration =  +pieStyle.transitionDuration;

    var arc = d3.svg.arc()
        .outerRadius(this.outerRadius)
        .innerRadius(this.innerRadius);

    var pieLayOut = d3.layout.pie()
                    .sort(null);
                    //.value(function(d) { return dataSet; });

    // SVG for the main pie
    var pieSVG = svg.append("g")
                 .attr("transform", "translate(" + this.cx + "," + this.cy + ")");

    // Add text label:
    var textSVG = svg.append("g")
                  .attr("transform", "translate(" + pieStyle.cx + "," + pieStyle.cy + ")");

    var piePath = pieSVG.selectAll("path")
         .data(pieLayOut(dataSet.map(function(d) { return d.value; })))
         .enter()
         .append("path")
         .attr("d", arc)
         .each(function(d) { this._current = d; })
         .attr("fill", function(d, i) { return pieStyle.color(i); })
         .attr("stroke", this.strokeColor)
         .attr("stroke-width", this.strokeWidth);

    // Cannot use this.color for nested functions
    // as "this" refers to this only in non-nested functions
    var tip = d3.tip()
       .attr('class', 'd3-tip')
       .offset([-10, 0])
       .html(function(d, i) {
            var displayText = "<span style='color:red'>" + dataSet[i].label + "</span>" + " value: " + dashBoardSettings.numberFormat(dataSet[i].value);
                return displayText;
           });        
     
    piePath.call(tip);

    piePath.clickedData = {};
    piePath.clickedData.object = {};
    piePath.clickedData.data = {};

    piePath.on("mouseover", function(d, i)
    {
        var currentPie = d3.select(this);

        var total = d3.sum(dataSet.map(function(d){ return d.value; }));
        d.percent = d/total * 100;                                                              
        if ( pieStyle.tipEnabled )
        {
            tip.show(d, i);
        }
        piePath.clickedData.object = currentPie;
        piePath.clickedData.data = dataSet[i];
    })
    .on("mouseout", function(d)
    {
        //d3.select(this);
        if ( pieStyle.tipEnabled )
        {
            tip.hide();            
        }
    });


    // Function for adding text:
    function addText(numData)
    {
        if ( pieStyle.textEnabled )
        {
            var formattedData = [];
            if ( pieStyle.percentageEnabled )
            {
                var s = d3.sum(numData);
                formattedData = numData.map(function(d) { return dashBoardSettings.piePercentFormat((d*100)/s); } );
            }
            else
            {
                formattedData = numData.map(function(d) { return dashBoardSettings.pieNumberFormat(d); } ); 
            }
            var textData = formattedData.map(function(d, i) {
                var tol = 1e-10;
                return ( numData[i] > tol ) ?  d + pieStyle.textSuffix : "";
            });

            textSVG.selectAll("text")
            .data(pieLayOut(numData))
            .enter()
            .append("text")
            .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"})
            .attr("text-anchor", "middle")
            .text(function(d, i) { return textData[i]; })
            .style("fill", pieStyle.textColor );
        }
    }

    // Animated update:
    this.update = function(newData)
    {
       // Remove text in the beginning
       textSVG.selectAll("*").remove();

       // Animate the new data
       pieSVG.selectAll("path")
       .data(pieLayOut(newData.map(function(d){ return d.value; })))
       .transition()
       .duration(pieStyle.transitionDuration)
       .attrTween("d", arcTween);

       // Add new text labels
       addText(newData.map(function(d){ return d.value;}));
    }   

    // Interpolation function
    function arcTween(a)
    {
       var i = d3.interpolate(this._current, a);
       this._current = i(0);
       return function(t) { return arc(i(t)); };
    }    

    this.color = pieStyle.color;
    this.pieSVG = pieSVG;
    this.textSVG = textSVG;
    this.piePath = piePath;
}

// svg is d3 selected svg
// pieData is an array of objects with format: 
// pieData = [ {label: xxxx, value: xxxx}, {}, {}, ...]
function plotPie(svg, pieData, data, areaProperty, area, legendData, pieStyle, rayStyle, legendStyle)
{
    // The mother of all objects:
    var pie = {};
    var dataSet = pieData.map(function(d) { return d.value; });
    pieData.forEach(function(d, i){ pieData[i].value = 1.0; } );
    // Create dummy data initially:
    pie.piePlot = new pieObjectConstructor(svg, pieData, pieStyle);
    // Update with actual data:
    pieData.forEach(function(d, i){ pieData[i].value = dataSet[i]; });
    pie.piePlot.update(pieData);

    pie.rayPlot = new rayObjectConstructor(svg, dataSet, rayStyle);
    pie.legend = new legendObjectConstructor( svg, legendData, legendStyle )

    // Update everything in the pie:
    pie.update = function(data)
    {
        pie.piePlot.update(data);
        pie.rayPlot.update(data);
    }

    var piePath = pie.piePlot.piePath;
    piePath.on("click", pieClick);

    function pieClick(d)
    {
        var label = piePath.clickedData.data.label;
        var property = piePath.clickedData.data.propertyName;
        var value = piePath.clickedData.data.propertyValue;
        var subData = data;
        if ( area != dashBoardData.allUKString )
        {
            subData = subData.filter( function(d) { return d[areaProperty] == area; }); 
        }
        subData = subData.filter( function(d) { return d[property] == value; } );
        console.log(subData.length + " entries selected by the click.");
        openTablePage(subData);
        return;
    }
    return pie;
}

function rayObjectConstructor(svg, dataSet, rayStyle)
{
    // Check if outer radius is given explicitly
    this.outerRadius = rayStyle.outerRadius || rayStyle.radius;

    // If inner radius is not given, assume it's zero
    this.innerRadius = rayStyle.innerRadius || 0;

    // Where is the centre of the ray:
    this.cx = rayStyle.cx;
    this.cy = rayStyle.cy;

    // What colors do we want for the borders and their width:
    rayStyle.strokeColor = rayStyle.strokeColor || "black";
    this.strokeColor = rayStyle.strokeColor;

    rayStyle.strokeWidth = rayStyle.strokeWidth || 1.2;
    this.strokeWidth = rayStyle.strokeWidth;
    
    rayStyle.textSuffix = rayStyle.textSuffix || "";
    this.textSuffix = rayStyle.textSuffix;
    
    rayStyle.textColor = rayStyle.textColor || "black";
    this.textColor = rayStyle.textColor;

    // This one is tricky:
    if ( rayStyle.leftSpacing === undefined )
    {
        rayStyle.leftSpacing = ( rayStyle.textSuffix === "" ) ? -30:-40;
    }
    rayStyle.leftSpacging = +rayStyle.leftSpacing;
    this.leftSpacing = rayStyle.leftSpacing;

    rayStyle.rightSpacing = +rayStyle.rightSpacing || 5;
    this.rightSpacing = rayStyle.rightSpacing;

    this.textColor = rayStyle.textColor;
    var arc = d3.svg.arc()
        .outerRadius(this.outerRadius)
        .innerRadius(this.innerRadius);

    var pieLayOut = d3.layout.pie()
                    .sort(null);
                    //.value(function(d) { return dataSet; });

    // SVG for the rays:
    var raySVG = svg.append("g")
                 .attr("transform", "translate(" + this.cx + "," + this.cy + ")");

    this.raySVG = raySVG;

    var lineFunction = d3.svg.line()
       .x(function(d){ return d.x; })
       .y(function(d){ return d.y; });

    addRays(dataSet);

    function addRays(dataSet)
    {
        if ( rayStyle.raysEnabled )
        {
            var pieData = pieLayOut(dataSet);
            for ( var i = 0; i < pieData.length; i++ )
            {
                // Ignore 0 values:
                var tol = .0001
                if ( Math.abs(pieData[i].value) > tol)
                {
                   var lineData = arcToRay(pieData[i]);
                   raySVG.append("path")
                    .attr("d", lineFunction(lineData))
                    .attr("stroke", rayStyle.strokeColor)
                    .attr("stroke-width", rayStyle.strokeWidth)
                    .attr("fill", "none");
                       
                   // Gap between rays and the text:
                   var xShift = (lineData[2].x < 0) ? rayStyle.leftSpacging:rayStyle.rightSpacing;

                   raySVG.append("text")
                   .attr("x", lineData[2].x + xShift)
                   .attr("y", lineData[2].y + 5)
                   .text(pieData[i].value + rayStyle.textSuffix)
                   .style("fill", rayStyle.textColor);
                }
            }
        }
    }

    // convert arc info into a ray of type  __/ 
    // output are three sets of x,y pairs 
    function arcToRay(d)
    {
        var angle = (d.startAngle - d.endAngle)/2;
        var dr = (rayStyle.outerRadius - rayStyle.innerRadius)/2;
        var dx = dr*Math.cos(angle);
        var dy = dr*Math.sin(angle);

        var arc1 = d3.svg.arc()
                   .outerRadius(rayStyle.innerRadius)
                   .innerRadius(rayStyle.outerRadius);

        var arc2 = d3.svg.arc()
                   .outerRadius(rayStyle.outerRadius+dr)
                   .innerRadius(rayStyle.outerRadius);

        var xy1 = arc1.centroid(d);
        var xy2 = arc2.centroid(d);

        var xData = [xy1[0], xy2[0], xy2[0]];
        // x = 0 passes through is the centre of the figure
        if ( xData[0] >= 0 )
        {
            xData[2] = xData[2] + dr/2;
        }
        else
        {
            xData[2] = xData[2] - dr/2;
        }

        var yData = [xy1[1], xy2[1], xy2[1]];
        var lineData = [];
        xData.forEach(function(d, i){lineData[i] = {x: xData[i], y: yData[i]};});
        return lineData;
    }

    this.update = function(newData)
    {
       // Remove all existing rays and text:
       raySVG.selectAll("*").remove();
       addRays(newData);
    }

}

function legendObjectConstructor(svg, legendData, legendStyle)
{
    this.shape = legendStyle.shape;
    this.width = legendStyle.width;
    this.height = legendStyle.height;
    this.spacing = legendStyle.spacing;
    this.cssClass = legendStyle.cssClass;
    this.color = legendStyle.color;

    // Top left for the legend:
    this.x = legendStyle.x;
    this.y = legendStyle.y;

    var legend = svg.selectAll(legendStyle.cssClass)                     
          .data(legendData)                                   
          .enter()                                                
          .append('g')                                            
          .attr('class', legendStyle.cssClass)                                
          .attr('transform', function(d, i) {                     
            var legendHeight = legendStyle.height + legendStyle.spacing;          
            var vertShift = i * legendHeight + legendStyle.y;                       
            return 'translate(' + legendStyle.x + ',' + vertShift + ')';        
          });                                                     

        legend.append(legendStyle.shape)                                     
          .attr('width', legendStyle.width)                          
          .attr('height', legendStyle.height)                          
          .style('fill', function(d, i) { return legendStyle.color(i); } )
          .style('stroke', function(d, i) { return legendStyle.color(i); } );
          
        legend.append('text')                                     
          .attr('x', legendStyle.width + legendStyle.spacing)              
          .attr('y', legendStyle.height - legendStyle.spacing)              
          .text(function(d) { return d; });              

    legend.update = function()
    {
        legend.selectAll("*").remove();
    }

    legend.on("mouseover", function(d)
            {
                return;
            });

    legend.on("mouseout", function(d)
            {
                return;
            });
    legend.on("click", function(d)
            {
                return;
            });

    return legend;

}

function addTip()
{
   // Design text for the tool tip:
   var tip = d3.tip()
   .attr('class', 'd3-tip')
   .offset([-10, 0])
   .html(function(d) {
        var label = d.data.label;
        var value = d.data.value;
        var percent = d.data.percent;                
        var displayText = "<span style='color:red'>" + label + "</span>" + " value: " + value + " (" + dashBoardSettings.numberFormat(percent) + "%)";
                return displayText;
           });        
}


function stackObjectConstructor(svg, stackedData, stackSettings)
{
    stackSettings.color = stackSettings.color || d3.scale.category20();
    this.color = stackSettings.color;
    var color = this.color
    var margin = stackSettings.margin || defineMargins(height, width);
    // height is the total length of svg available to us:
    var height = +svg.attr("height") - margin.top - margin.bottom;
    // width is the total width of svg available to us:
    var width = +svg.attr("width") - margin.left - margin.right;

    stackSettings.textEnabled = stackSettings.textEnabled || 0;
    this.textEnabled = stackSettings.textEnabled;

    stackSettings.tipEnabled = stackSettings.tipEnabled || 1;
    this.tipEnabled = stackSettings.tipEnabled;

    // Stack bar direction, h for horizontal, v for vertical
    stackSettings.barDirection = stackSettings.barDirection || "h";
    this.barDirection = stackSettings.barDirection;

    // Optional settings:
    stackSettings = stackSettings || {};

    // Prepare stack data:
    var stackLayOut = d3.layout.stack();
    // Data is modified:
    stackLayOut(stackedData);

    var xScale;
    var yScale;

    if ( stackSettings.barDirection == "v" )
    {
        // Define scales and their domain: 
        xScale = d3.scale.ordinal()
            .rangeRoundBands([0, width], .5);
        yScale = d3.scale.linear()
        .rangeRound([height, 0] );
        // Define range for our scales:
        xScale.domain(stackedData[0].map(function(d) { return d.label; }));
        yScale.domain([0, d3.max(stackedData[stackedData.length - 1], function(d) { return d.y0 + d.y; })]).nice();
    }
    else if ( stackSettings.barDirection == "h" )
    {
        // Define scales and their domain: 
        yScale = d3.scale.ordinal()
            .rangeRoundBands([0, height], .5);
        xScale = d3.scale.linear()
        .rangeRound([0 , width] );

        // Define range for our scales:
        xScale.domain([0, d3.max(stackedData[stackedData.length - 1], function(d) { return d.y0 + d.y; })]).nice();
        yScale.domain(stackedData[0].map(function(d) { return d.label; }));
    }
    else
    {
        console.log("stackObjectConstructor: barDirection unknown");
    }

    var stackSVG = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var stackLayer = stackSVG.selectAll(".layer")
          .data(stackedData)
          .enter()
          .append("g")
          .attr("class", "layer")
          .style("fill", function(d, i) { return color(i); });

    function getXValue(d, i)
    {
        if ( stackSettings.barDirection == "v" )
        {
            return xScale(d.label);
        }
        else
        {
            return xScale(d.y0);
        }
    }

    function getYValue(d, i)
    {
        if ( stackSettings.barDirection == "v" )
        {
            return yScale(d.y0 + d.y); 
        }
        else
        {
            return yScale(d.label);
        }
    }
    
    function getHeight(d, i)
    {
        if ( stackSettings.barDirection == "v")
            return yScale(d.y0) - yScale(d.y0 + d.y);
        else
            return yScale.bandwidth();
    }

    function getWidth(d, i)
    {
        if ( stackSettings.barDirection == "v" )
            return xScale.bandwidth();
        else
            return xScale(d.y);
    }

    stackLayer.selectAll("rect")
          .data(function(d) { return d; })
          .enter().append("rect")
          .attr("x", getXValue)
          .attr("y", getYValue)
          .attr("height", getHeight)
          .attr("width", getWidth)
          .on("mouseover", stackMouseOver)
          .on("mouseout", stackMouseOut);
    stackLayer.clickedData = {};
    stackLayer.clickedData.object = {};
    stackLayer.clickedData.data = {};

    
    var textSVG = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var textLayer =  textSVG.selectAll(".layer")
        .data(stackedData)
        .enter().append("g")
        .attr("class", "layer");

    var tip = d3.tip()
       .attr('class', 'd3-tip')
       .offset([-10, 0])
       .html(function(d, i) {
            var displayText = "<span style='color:red'>" + d.label + "</span>" + " value: " + dashBoardSettings.numberFormat(d.y);
                return displayText;
           });
     
    stackLayer.call(tip);

    if ( stackSettings.textEnabled )
    {
        textLayer.selectAll("text")
        .data(function(d){ return d; })
        .enter()
        .append("text")
        .attr("x", function(d) { return yScale(d.y0 + d.y/1.1);} )
        .attr("y", function(d, i)
        {
            return xScale(d.label) + xScale.bandwidth()/2;
        })
        .attr("text-anchor", "middle")
        .text( function(d, i) 
                { 
                    if ( Math.abs(d.y) < 1e-10 )
                    {
                        return "";
                    }
                    else
                    {
                        return dashBoardSettings.stackNumberFormat(d.y); 
                    }
                })
        .style("fill", "black" )
        .attr("id", function(d) { return d.label + d.y;} )
        .style("visibility", "visible");
    }

    function stackMouseOver(d, i)
    {
        var currentBar = d3.select(this);
        var currentData = d;
        stackLayer.clickedData.object = currentBar;
        stackLayer.clickedData.data = currentData;

        if ( stackSettings.tipEnabled )
        {
            tip.show(d, i);
        }
        return;
    }

    function stackMouseOut(d, i)
    {
        if ( stackSettings.tipEnabled )
        {
            tip.hide();
        }
        return;
    }

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
    
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    stackSVG.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0" + "," + height + ")")
        .call(xAxis);
    
    stackSVG.append("g")
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0, 0)")
        .call(yAxis);

    this.stackSVG = stackSVG;
    this.stackLayer = stackLayer;
}

function plotStack(svg, stackData, subAreaProperty, data, fileName, stackSettings )
{
    // The mother object:
    var stack = {};

    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var margin = defineMargins(height, width);
    // More space on the left for long names
    margin.left = 2*margin.left;
    stackSettings.margin = stackSettings.margin || margin;

    // If bars are horizontal, the grid is vertical 
    // and vice versa:
    stackSettings.barDirection = stackSettings.barDirection || "h";
    if ( stackSettings.barDirection == "h" )
    {
        plotVerticalGrid(svg, stackSettings.margin, 10);
    }
    else
    {
        plotHorisontalGrid(svg, stackSettings.margin, 10);
    }



    stack = new stackObjectConstructor(svg, stackData, stackSettings);

    // Legend:
    stackSettings.legendEnabled = stackSettings.legendEnalbled || 0;
    if ( stackSettings.legendEnabled )
    {
        stack.legend = new legendObjectConstructor( svg, stackSettings.legendData, stackSettings.legendStyle )
    }

    stack.stackLayer.on("click", stackClick);

    function stackClick(d)
    {
        var label = stack.stackLayer.clickedData.data.label;
        var property = stack.stackLayer.clickedData.data.propertyName;
        var value = stack.stackLayer.clickedData.data.propertyValue;
        var subData = data[fileName].filter(function(d) { return d[subAreaProperty] == label; } )
        subData = subData.filter(function(d) { return d[property] == value; } );
        console.log(subData.length + " entries selected by the click.");
        openTablePage(subData);
        return;
    }
    return stack;
}
