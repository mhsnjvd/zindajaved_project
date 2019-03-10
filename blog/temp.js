     svg.selectAll("*").remove();
      svg.style("background-color", "white"); 
      var height = +svg.attr("height");
      var width = +svg.attr("width");

      var margin = defineMargins(height, width);
      
      var xData =  data.quarterNames;
      // Transposed data, have to be transposed for quarterly plotting:
      var yTransposedData = [data.pipeLineQualifiedOut, data.pipeLineInProgress, data.pipeLineSuccessful, data.pipeLineUnsuccessful];
      // only the initial entries correspond to the quarters
      yTransposedData = yTransposedData.map( function(d) { return d.slice(0, data.quarterNames.length); } );
      
      var yData = data.quarterNames.map( function(d) { return []; } );
      for ( var i = 0; i < data.quarterNames.length; i++ )
      {
          for ( var j = 0; j < yTransposedData.length; j++ )
          {
             // Another divide by 1000 to convert to millions:
             yData[i][j] = yTransposedData[j][i]/1000.0;
          }
      }

      // Sum of local Arrays
      var sumYData = yData.map(function(d) { return d3.sum(d); } );
      // Global maximum
      var maxYData = d3.max(sumYData);

      // How much cushion do we want?
      maxYData = 1.5*maxYData;
      var minYData = 0.0;

       // x scale and width gap:
      var xScale = d3.scale.ordinal()
             .domain(d3.range(xData.length))
             .rangeRoundBands( [margin.left, width - margin.right], .6 );

      var yScale = d3.scale.linear()
                   .domain([minYData, maxYData])
                   .range([height-margin.top,  margin.bottom]);
      var hScale = d3.scale.linear()
                   .domain([minYData, maxYData])
                   .range([0, height-margin.top - margin.bottom]); 


      plotHorisontalGrid( svg, margin, 10);
      var color = dashBoardSettings.color;
      var histColors = [color.pipeLineQualifiedOut, color.pipeLineInProgress, color.successful, color.unsuccessful];
      var bars = plotMultiHistogram( svg, margin, xData, yData, xScale, yScale, hScale, histColors);          

      plotXAxis(svg, margin, xData, xScale );
      addTitle(svg, "Quarterly Contracts and Opportunities");
      plotYAxis(svg, margin, yScale);
      plotYLabel(svg, margin, "£M");         

      // Legend:
      var legendRectSize = 18;
      var legendSpacing = 4;     

      // TODO: these should be read from the dashboard settings file:
      var labels = [ 
                     {label:"Unsuccessful" , color: color.unsuccessful},
                     {label:"Successful" , color: color.successful},
                     {label:"In Progress" , color: color.pipeLineInProgress},
                     {label:"Qualified Out" , color: color.pipeLineQualifiedOut}
                    ]; 

      var legend = svg.selectAll('.legend')                     
      .data(labels)                                   
      .enter()                                                
      .append('g')                                            
      .attr('class', 'legend')                                
      .attr('transform', function(d, i) {                     
            var legendHeight = legendRectSize + legendSpacing;                    
            var horz = margin.left + legendRectSize;                       
            var vert = 1.2*margin.top + i * legendHeight;                       
            return 'translate(' + horz + ',' + vert + ')';        
          });                                                     

        legend.append('rect')                                     
          .attr('width', legendRectSize)                          
          .attr('height', legendRectSize)                         
          .style('fill', function(d, i) { return d.color; })                                   
          .style('stroke', function(d, i) { return d.color; });                                
          
          
        legend.append('text')                                     
          .attr('x', legendRectSize + legendSpacing)              
          .attr('y', legendRectSize - legendSpacing)              
          .text(function(d) { return d.label; });              

        //legend.on("mouseover", function(d) { bars.update( [0, 0, 0, 0] ); return ; } );
}
