function chart(){

  var width = 600,
    barHeight = 20,
    data = [];
  for (var i=0; i<15; i++) {
    data.push( Math.ceil( Math.random() * 50 ) );
  }

  var x = d3.scale.linear()
    .range([0, width]);

  var chart = d3.select('#scales')
    .html('')
    .attr('width', width);

  x.domain([0, d3.max(data, function(d) { return d; })]);

  chart.attr('height', barHeight * data.length);

  var bar = chart.selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr('transform', function(d, i) { return 'translate(0,' + i * barHeight + ')'; });

  bar.append('rect')
    .attr('width',0)
    .attr('height', barHeight - 1)
    .transition()
    .duration(600)
    .delay(function (d,i){ return 500 + i * 100;})
    .attr('width', function(d) { return x(d); });

  bar.append('text')
    .attr('class', 'barLabel')
    .attr('x', 0)
    .attr('y', barHeight / 2)
    .attr('dy', '.35em')
    .text(function(d) { return d; })
    .transition()
    .duration(600)
    .delay(function (d,i){ return 500 + i * 100;})
    .attr('x', function(d) { return x(d) - 3; });

}

Reveal.addEventListener('slidechanged', function(e) {
  if (e.indexh === 21) {
    chart();
  }
});
