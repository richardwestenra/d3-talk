(function(){
  'use strict';

  // Config
  var interval;

  //  Utility functions

  function startInterval(callback, t){
    interval = setInterval(callback, t);
  }

  function stopInterval(){
    clearInterval(interval);
  }

  function getRandomNumber(max) {
    return Math.ceil( Math.random() * max );
  }

  function getRandomData(max, len){
    var arr = [];
    for (var i=0; i<len; i++) {
      arr.push( getRandomNumber(max) );
    }
    return arr;
  }



  // Make some charts

  function TransChart(){

    var id = '#transitions',
      width = 600,
      barHeight = 20,
      data = getRandomData(50,15);

    var x = d3.scale.linear()
      .range([0, width]);

    var chart = d3.select(id)
      .attr('width', width);

    x.domain([0, d3.max(data, function(d) { return d; })]);

    chart.attr('height', barHeight * data.length);

    this.start = function () {

      var bar = chart.html('')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', function(d, i) { return 'translate(0,' + i * barHeight + ')'; });

      bar.append('rect')
        .attr('width',0)
        .attr('height', barHeight - 1)
        .transition()
        .duration(600)
        .delay(function (d,i){ return 800 + i * 100;})
        .attr('width', function(d) { return x(d); });

      bar.append('text')
        .attr('class', 'barLabel')
        .attr('x', 0)
        .attr('y', barHeight / 2)
        .attr('dy', '.35em')
        .text(function(d) { return d; })
        .transition()
        .duration(600)
        .delay(function (d,i){ return 800 + i * 100;})
        .attr('x', function(d) { return x(d) - 3; });
    };
  }



  function UpdateChart(){

    var id = '#update',
      width = 600,
      barHeight = 20,
      max = 15;

    var x = d3.scale.linear()
      .range([0, width]);

    var chart = d3.select(id)
      .html('')
      .attr('width', width)
      .attr('height', max * barHeight);


    this.update = function () {
      var dataLength = getRandomNumber(max);
      var data = getRandomData(50, dataLength);
      var t = 1000;

      d3.select('#updateArray').text('['+data.join(',')+']');

      x.domain([0, d3.max(data, function(d) { return d; })]);

      var bar = chart.selectAll('rect')
        .data(data);

      bar.exit()
        .transition()
        .style('fill','#ff5a00')
        .transition()
        .delay(t)
        .remove();

      bar.enter()
        .append('rect')
        .attr('width',0)
        .attr('height', barHeight - 1)
        .attr('x',x(0))
        .attr('y',function(d, i) { return i * barHeight;});

      bar.transition()
        .attr('width', function(d) { return x(d); })
        .transition()
        .delay(t)
        .style('fill','#777');

    };

  }



  function GeoChart(){

    var width = 800,
      height = 600,
      rotation = [-11, 0],
      scale = 120,
      translation = [width/2, height/1.8];

    var proj = {
      mercator: d3.geo.mercator(),
      equirectangular: d3.geo.equirectangular(),
      azimuthalEqualArea: d3.geo.azimuthalEqualArea(),
      azimuthalEquidistant: d3.geo.azimuthalEquidistant(),
      conicEqualArea: d3.geo.conicEqualArea(),
      conicConformal: d3.geo.conicConformal(),
      conicEquidistant: d3.geo.conicEquidistant(),
      orthographic: d3.geo.orthographic(),
      stereographic: d3.geo.stereographic(),
      transverseMercator: d3.geo.transverseMercator()
    };

    var current = 'mercator';


    var svg = d3.select('#map')
      .attr('width', width)
      .attr('height', height);

    var projection = proj[current]
      .rotate(rotation)
      .scale(scale)
      .translate(translation);

    var geo, path, iss, issText;

    function long(d) { return projection([d.longitude,d.latitude])[0]; }
    function lat(d) { return projection([d.longitude,d.latitude])[1]; }

    d3.json('js/world-110m.json', function(error, world) {
      if (error) { return console.error(error); }

      var worldData = topojson.feature(world, world.objects.countries);

      geo = d3.geo.path()
        .projection(projection);

      path = svg.append('path')
        .datum(worldData)
        .attr('d', geo);

      var issW = 550.2 * 0.7,
        issH = 34.158 * 0.7;

      iss = svg.append('svg:image')
        .attr('xlink:href','img/iss.svg')
        .attr('transform','translate('+(issW/-2)+',' + (issH/-2) + ')')
        .attr('width',issW)
        .attr('height',issH)
        .attr('opacity',0);

      issText = svg.append('text')
        .attr('x', width/2)
        .attr('y', height - 10)
        .style({
          'text-anchor':'middle',
          'font-size': '18px',
          'fill': '#333',
          'text-shadow': '0 0 8px rgba(255,255,255,0.3)'
        });

    });

    svg.on('mousemove',function (){
      projection.rotate( d3.mouse(this) );
      path.attr('d', geo);
      iss.attr('x', long).attr('y', lat);
    });

    var mapButtons =  d3.select('#mapButtons');

    var button = mapButtons.selectAll('button')
      .data( d3.keys(proj) )
      .enter()
      .append('button')
      .text(function (d){ return d; })
      .on('click',function (e){
        current = d3.select(this).text();
        button.style({'background':''});
        d3.select(this).style({'background':'#444'});

        projection = proj[current]
          .rotate(rotation)
          .scale(scale)
          .translate(translation);

        geo.projection(projection);

        path.transition().attr('d', geo);
        iss.transition().attr('x', long).attr('y', lat);
      });

    button.filter(function (d,i){ return i===0; })
      .style({'background':'#444'});


    function getISSLocation(callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET','https://api.wheretheiss.at/v1/satellites/25544');
      xhr.addEventListener('load',function(){
        if (this.status == 200) {
          var response = JSON.parse(this.responseText);
          callback(response);
        }
      });
      xhr.send();
    }



    this.updateISS = function(){
      getISSLocation(function(d){

        issText.text('Current ISS location: ('+d.latitude+', '+d.longitude+')');

        iss.datum(d)
          .attr('x', long)
          .attr('y', lat)
          .attr('opacity',1);
      });
    };

    this.updateISS();

  }



  // Get some adjectives

  var i = 0;
  var arr = ['dank','diabolical','daffy','dubious','desirable','delicious','dependable','docile','dramatic','diverse','dreamy','deluxe','deceitful','disruptive','dauntless','deft','dynamic','dainty','decisive','dazzling','dastardly','decent','decorative','decadent','dicey'];

  function getNewAdjective(){
    var adj = arr[i++];
    d3.select('#adjective').text(adj);
    if (i>=arr.length) {
      i = 0;
    }
  }

  d3.select('#showNotes').on('click',function(){
    var show = d3.select(this).text() === 'Show notes';
    d3.selectAll('.notes').classed('visible', show);
    d3.select(this).text(show ? 'Hide notes' : 'Show notes');
  });


  // Init
  var uc = new UpdateChart();
  var tc = new TransChart();
  var gc = new GeoChart();

  startInterval(getNewAdjective, 500);

  Reveal.addEventListener('slidechanged', function(e) {
    var id = e.currentSlide.getAttribute('data-id');

    stopInterval();

    switch (id) {
      case 'title':
        startInterval(getNewAdjective, 500);
        break;
      case 'update':
        startInterval(uc.update, 2000);
        break;
      case 'transitions':
        tc.start();
        break;
      case 'map':
        startInterval(gc.updateISS,5000);
        break;
    }
  });

})();
