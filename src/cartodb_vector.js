
function CartoDB(options) {
    this.options = options;
    this.projection = new MercatorProjection();
    this.shader = new CartoShader(this.options.shader || '{ point-color: "#000" }');
    this.cache = {};
    // shader used to render the hit grid
    this.hit_shader = new CartoShader({
          'line-color': '#FFDA00',
          'line-width': 3,
          'polygon-fill': function(data, render_context) {
              return 'rgb(' + Int2RGB(render_context.id).join(',') + ')';
          }
    });

    if(options.user && options.table) {
        this.base_url = 'http://' + options.user + ".cartodb.com/api/v2/sql";
        this._init_layer();
    } else {
        throw Exception("CartoDB user and table must be specified");
    }
}

CartoDB.prototype.set_css = function(css) {
    this.shader = new CartoShader(css);
    this.layer.redraw();
}

// executes sql on the cartodb server
CartoDB.prototype.sql = function(sql, callback) {
    var self = this;
    if(this.options.debug) {
        //console.log(sql);
    }
    data = this.cache[sql];
    if(data) {
        //console.log("CACHED");
        callback(data);
        return;
    }
    $.getJSON(this.base_url  + "?q=" + encodeURIComponent(sql) + "&format=geojson&dp=6",function(data){
        self.cache[sql] = data;
        callback(data);
    });
};

//get data for a tile
CartoDB.prototype.tile_data = function(x, y, zoom , callback) {
    var opts = this.options;
    var projection = new MercatorProjection();
    var bbox = projection.tileBBox(x, y, zoom);
    var geom_column = 'the_geom';
    var the_geom;

    // simplify
    // todo: replace with area/vertices ratio dependent?
    if (zoom >= 17){
      the_geom = geom_column
    } else if (zoom >= 14 ){
      the_geom = 'ST_Simplify((ST_Dump('+geom_column+')).geom,0.0000005) as the_geom';
      //the_geom = 'ST_SnapToGrid('+geom_column+',0.0000005) as the_geom'
    } else if (zoom >= 10){
      the_geom = 'ST_Simplify((ST_Dump('+geom_column+')).geom,0.00005) as the_geom';
      //the_geom = 'ST_SnapToGrid('+geom_column+',0.00005) as the_geom'
    } else if (zoom >=6){
      the_geom = 'ST_Simplify((ST_Dump('+geom_column+')).geom,0.0005) as the_geom';
      //the_geom = 'ST_SnapToGrid('+geom_column+',0.0005) as the_geom'
    } else {
      the_geom = 'ST_Simplify((ST_Dump('+geom_column+')).geom,0.0005) as the_geom';
      the_geom = 'ST_SnapToGrid('+geom_column+',0.0005) as the_geom'
    }
    
    var columns = [the_geom].concat(opts.columns).join(',');
    var ints = "ST_SetSRID(ST_MakeBox2D(";
    ints += "ST_Point(" + bbox[0].lng() + "," + bbox[0].lat() +"),";
    ints += "ST_Point(" + bbox[1].lng() + "," + bbox[1].lat() +")), 4326)";
    
    var sql = "select " + columns +" from " + opts.table + " WHERE the_geom && ";
    sql = sql + ints;
    
    if(this.options.where) {
        sql  += " AND " + this.options.where;
    }
    this.sql(sql, callback);
};


function Renderer() {
    var self = this;
    var primitive_render = this.primitive_render = {
        'Point': function(ctx, coordinates) {
                  ctx.save();
                  var radius = 2;
                  var p = coordinates;
                  ctx.translate(p.x, p.y);
                  ctx.beginPath();
                  ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
                  ctx.closePath();
                  ctx.fill();
                  ctx.stroke();
                  ctx.restore();
        },
        'MultiPoint': function(ctx, coordinates) {
              var prender = primitive_render['Point'];
              for(var i=0; i < coordinates.length; ++i) {
                  prender(ctx, zoom, coordinates[i]);
              }
        },
        'Polygon': function(ctx, coordinates) {
              ctx.beginPath();
              var p = coordinates[0][0];
              ctx.moveTo(p.x, p.y);
              for(var i=0; i < coordinates[0].length; ++i) {
                p = coordinates[0][i];
                ctx.lineTo(p.x, p.y);
             }
             ctx.closePath();
             ctx.fill();
             ctx.stroke();
        },
        'MultiPolygon': function(ctx, coordinates) {
              var prender = primitive_render['Polygon'];
              for(var i=0; i < coordinates.length; ++i) {
                  prender(ctx, coordinates[i]);
              }
        }
    };
}

Renderer.prototype.render = function(ctx, primitives, coord, zoom, shader, hit) {
  var primitive_render = this.primitive_render;
  ctx.canvas.width = ctx.canvas.width;
  var visible_only = new Array();
  var visible_only_i = new Array();
  if(primitives.length) {
      for(var i = 0; i < primitives.length; ++i) {
          var renderer = primitive_render[primitives[i].geometry.type];
          if(renderer) {
              // render visible tile
              var render_context = {
                  zoom: zoom,
                  id: i
              };
              //cartodb_id = -1 is reserved for non-hit geoms
              if (primitives[i].properties.cartodb_id == -1){
                    visible_only.push(primitives[i]);
                    visible_only_i.push(i);
              } else {
                  shader.apply(ctx, primitives[i].properties, render_context);
                  renderer(ctx, primitives[i].geometry.projected);
              }
          }
						
      }
      if (!hit){ //only draws the polygon if on the hit canvas
          if (0 < visible_only.length){
              for(var i = 0; i < visible_only.length; ++i) {
                  var renderer = primitive_render[visible_only[i].geometry.type];
                  if(renderer) {
                      // render visible tile
                      var render_context = {
                          zoom: zoom,
                          id: visible_only_i[i]
                      };
                      shader.apply(ctx, visible_only[i].properties, render_context);
                      renderer(ctx, visible_only[i].geometry.projected);
                  }
              }
          }
      }
  }
};

CartoDB.prototype.convert_geometry = function(geometry, zoom, x, y) {
    var self = this;
    function map_latlon(latlng, x, y, zoom) {
        latlng = new google.maps.LatLng(latlng[1], latlng[0]);
        return self.projection.latLngToTilePoint(latlng, x, y, zoom);
    }
    var primitive_conversion = this.primitive_conversion = {
        'Point': function(x, y, zoom, coordinates) {
            return map_latlon(coordinates, x, y, zoom);
        },
        'MultiPoint': function(x, y,zoom, coordinates) {
              var converted = [];
              var pc = primitive_conversion['Point'];
              for(var i=0; i < coordinates.length; ++i) {
                  converted.push(pc(x, y, zoom, coordinates[i]));
              }
              return converted;
        },
        //do not manage inner polygons!
        'Polygon': function(x, y, zoom, coordinates) {
              var coords = [];
              for(var i=0; i < coordinates[0].length; ++i) {
                coords.push(map_latlon(coordinates[0][i], x, y, zoom));
             }
             return [coords];
        },
        'MultiPolygon': function(x, y, zoom, coordinates) {
              var polys = [];
              var pc = primitive_conversion['Polygon'];
              for(var i=0; i < coordinates.length; ++i) {
                  polys.push(pc(x, y, zoom, coordinates[i]));
              }
              return polys;
        }
    };
    var conversor = this.primitive_conversion[geometry.type];
    if(conversor) {
        return conversor(x, y , zoom, geometry.coordinates);
    }

};

// init google maps layer
CartoDB.prototype._init_layer = function() {
    var self = this;

    var r = new Renderer();
    r.projection = self.projection;

    this.layer = new CanvasTileLayer(function(tile_info, coord, zoom, ready) {

          var ctx = tile_info.ctx;
          var hit_ctx = tile_info.hit_ctx;
          self.tile_data(coord.x, coord.y, zoom, function(data) {
            var primitives = tile_info.primitives = data.features;
            for(var i = 0; i < primitives.length; ++i) {
                var p = primitives[i];
                if(p.geometry.projected === undefined) {
                    p.geometry.projected = self.convert_geometry(p.geometry, zoom, coord.x, coord.y);
                }
            }
            r.render(ctx, primitives, coord, zoom, self.shader);
            r.render(hit_ctx, primitives, coord, zoom, self.hit_shader, true);
            
            //ready && ready();
          });

    });
};


// conversion from RGB => integer and back
// note, we have another channel to play with...
RGB2Int = function(r,g,b){
    return r+(256*g)+(256*256*b);
};

Int2RGB = function(input){
    var r = input % 256;
    var g = parseInt(input / 256) % 256;
    var b = parseInt(input / 256 / 256) % 256;
    return [r,g,b];
};



