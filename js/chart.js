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
        .attr('y', height - 5)
        .style({
          'text-anchor':'middle',
          'font-size': '15px',
          'fill': '#333'
        });

    });

    function updateElements(){
      path.attr('d', geo);

      iss.attr('x', long)
        .attr('y', lat);
    }

    svg.on('mousemove',function (){
      projection.rotate( d3.mouse(this) );
      updateElements();
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

        updateElements();
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

        issText.text('('+d.latitude+','+d.longitude+')');

        iss.datum(d)
          .attr('x', long)
          .attr('y', lat)
          .attr('opacity',1);
      });
    };

    this.updateISS();

  }


  // Init
  var uc = new UpdateChart();
  var tc = new TransChart();
  var gc = new GeoChart();

  Reveal.addEventListener('slidechanged', function(e) {
    var id = e.currentSlide.getAttribute('data-id');

    stopInterval();

    switch (id) {
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
