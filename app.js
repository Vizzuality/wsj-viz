        var map;
        var center = new google.maps.LatLng(29.05, -81.25);
		function toggleFullscreen(){}

        function initialize() {


            alert($.browser.version);


            var mapOptions = {
                zoom: 9,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true,
	  		    zoomControl: true,
			    zoomControlOptions: {
			      style: google.maps.ZoomControlStyle.SMALL,
			      position: google.maps.ControlPosition.TOP_RIGHT
			    },
                styles:[
                    {
                        stylers: [
                            { invert_lightness: false },
                            { saturation: -100 }
                        ]
                    },{
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [
                            { visibility: "off" }
                        ]
                    },{
                        featureType: "administrative",
                        elementType: "labels",
                        stylers: [
                            { visibility: "off" }
                        ]
                    },{
                        featureType: "transit",
                        stylers: [
                            { visibility: "off" }
                        ]
                    },{
                        featureType: "road",
                        stylers: [
                            { visibility: "off" }
                        ]
                    },{
                        featureType: "landscape",
                        stylers: [
                            { visibility: "off" }
                        ]
                    },{
                        featureType: "water",
                        elementType: "labels",
                        stylers: [
                            { visibility: "off" }
                        ]
                    },{
                        featureType: "administrative",
                        elementType: "geometry",
                        stylers: [
                            { visibility: "on" },
                            { lightness: -111 }
                        ]
                    }
                ]
            };
            var LW = 2;
            var PO = 0.95;
            var sh =  [
               {
                      'point-color': '#FFF',
                      'line-color': "rgba(0, 0, 0, 0.4)",
                      'line-width': function(data) { 
						  if (data.cartodb_id == -1.0){
	                          return 3;
						  } else {
   	                          return 0.7;
                      	  }
					  },
                      'polygon-fill': function(data) { 
						  if (data.cartodb_id == -1.0){
	                          return 'none';
						  } else {
   	                          var q = data.percent_delinquent;
							  var v = 3; //Math.floor((q*100)/6)
	                          var colors = [
								"rgba(243,217,206, "+(PO)+")",
								"rgba(232,179,164, "+(PO)+")",
								"rgba(215,116,100, "+(PO)+")",
								"rgba(199,37,53, "+PO+")",
	                          ];
							  if (q<.2){
								v = 2;
							    if (q<.12){
								  v = 1;
							      if (q<.3){
							        v = 0;
						          }
						        }
								
						      }
	                          return colors[v];
						  }
                      }
                },
               {
                      'point-color': '#FFF',
                      'line-color': "rgba(0, 0, 0, 0.4)",
                      'line-width': function(data) { 
						  if (data.cartodb_id == -1.0){
	                          return 3;
						  } else {
   	                          return 0.7;
                      	  }
					  },
                      'polygon-fill': function(data) { 
						  if (data.cartodb_id == -1.0){
	                          return 'none';
						  } else {
   	                          var q = data.percent_delinquent;
	                          var colors = [
								"rgba(198, 219, 239, "+PO+")",
								"rgba(158, 202, 225, "+(PO)+")",
								"rgba(107, 174, 214, "+(PO)+")",
								"rgba(49, 130, 189, "+(PO)+")",
								"rgba(8, 81, 176, "+(PO)+")"
	                          ];
							  //console.log(q);
	                          return colors[Math.floor(((q*100))/5)];
						  }
                      }
                }
            ]


            map = new google.maps.Map(document.getElementById('map_canvas'),
                    mapOptions);

            var cartodb = new CartoDB({
                user: 'vizzuality',
                table: 'volusia_delorfore',
                columns: ['cartodb_id', 'zipcode', 'percent_delinquent'], //, 'ST_AsGeoJSON(ST_PointOnSurface(the_geom)) as pt'],
				where: "percent_delinquent IS NOT NULL",
                debug: false,
                shader: sh[0]
            });

			var sh_t = 'percent_delinquent'; //shader text
			
            map.overlayMapTypes.insertAt(0, cartodb.layer);
            var projection = new MercatorProjection();
            var myGoogleVectors = []; 

			var infowindow = new CartoDBInfowindow(map);
			
            google.maps.event.addListener(map, 'mousemove', function (event) {
                // get tile
                var coord = projection.latLngToTile(event.latLng,map.zoom);

                // get saved tile id from cartodb layer
                var tile_id = coord.x + '_' + coord.y + '_' + map.zoom;

                // get saved tile data from cartodb.layer
                var tile = cartodb.layer.tiles[tile_id];

                //Get current tile coordinates
                var numTiles = 1 << map.zoom;
                var pixel_offset = new google.maps.Point(Math.floor(event.point.x * numTiles % 256), Math.floor(event.point.y * numTiles % 256));

                // get hit context
                var hit_ctx = tile.hit_ctx;

                // get RGB values from context at current pixel position
                var c = hit_ctx.getImageData(pixel_offset.x, pixel_offset.y, 1, 1).data;

                // only do something if the hit context has 'visible' data 
                if (c[3] !== 0){
                    // get primitive array index from rgb
                    var primitive_idx = RGB2Int(c[0],c[1],c[2]);
                    //console.log(tile_id + ' ' + primitive_idx);

                    if (tile.primitives && tile.primitives[primitive_idx] && tile.primitives[primitive_idx].properties.cartodb_id != -1.0){
                        var geom = JSON.stringify(tile.primitives[primitive_idx].geometry);
                        var text =    "<b>tile:</b> " + coord + '<br>';
                        text = text + "<b>pixel:</b> " + pixel_offset + '<br>';
                        text = text + "<b>primitive_idx: </b>" + primitive_idx + '<br>';
                        opts = {
                            "strokeColor": "#FFF366",
                            "strokeOpacity": 0.8,
                            "strokeWeight": 2,
                            "fillColor": "#FFF366",
                            "fillOpacity": 0.6
                        };

                        if (myGoogleVectors.length > 0){

                            myGoogleVectors.forEach(function(gv){
                                    gv.setMap(null);
									google.maps.event.clearListeners(gv,'click');
                                    });
							
                            myGoogleVectors.remove(0,myGoogleVectors.length-1);
                        }

                        var myGoogleVector = new GeoJSON(tile.primitives[primitive_idx].geometry, opts);

                        if (myGoogleVector.error){
                            // Handle the error.
                        }else{
                          if(myGoogleVector.length === undefined) {
                            myGoogleVector.setMap(map);
                            myGoogleVectors.push(myGoogleVector);
                          }
                        }
						
						google.maps.event.addListener(myGoogleVector, 'click', function (ev) {
							var pc = (tile.primitives[primitive_idx].properties.percent_delinquent*100).toFixed(1);
							var zc = tile.primitives[primitive_idx].properties.zipcode;
							
							var scale = Math.pow(2, map.getZoom());
							
							var nw = new google.maps.LatLng(
							    map.getBounds().getNorthEast().lat(),
							    map.getBounds().getSouthWest().lng()
							);
							//console.log(map.getBounds().getSouthWest().lng());
							var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
							var worldCoordinate = map.getProjection().fromLatLngToPoint(ev.latLng);
							var xx = Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale);
							var yy = Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale);
							var txt = '<a href="#close" class="close">x</a>'+
			  			              '<div class="outer_top">'+
			  			                '<div class="top"><p>Homes seriously delinquent or in foreclosure</p></div>'+
			  			              '</div>'+
			  			              '<div class="bottom">'+
			  								'<label class="strong">' + pc + '% </label>'+
			  								'<label class="box">ZIP CODE: ' + zc + ' </label>'+
			  		                 '</div>';
							infowindow.draw(ev.latLng, txt);
							infowindow.start();
						});
						
                        // render the geometry to canvas here...
                    }
                } else {
                    // in the sea so clear the rollovers
                    if (myGoogleVectors.length > 0){

                        myGoogleVectors.forEach(function(gv){
                                gv.setMap(null);
								google.maps.event.clearListeners(gv,'click');
                        });
                        myGoogleVectors.remove(0,myGoogleVectors.length-1);
                    }
                }
            });
		
            function map_latlon(latlng, x, y, zoom) {
                latlng = new google.maps.LatLng(latlng[1], latlng[0]);
                return self.projection.latLngToTilePoint(latlng, x, y, zoom);
            }

            Array.prototype.remove = function(from, to) {
                var rest = this.slice((to || from) + 1 || this.length);
                this.length = from < 0 ? this.length + from : from;
                return this.push.apply(this, rest);
            };
			$('#fullscreen a').click(function(){
				var bnds = map.getBounds();
				if($('#map_canvas').hasClass('fullscreen')){
					$('#map_canvas').removeClass('fullscreen');
				}else{
					$('#map_canvas').addClass('fullscreen');
				}
				google.maps.event.trigger(map, 'resize');
				map.fitBounds(bnds);
				
			});
        }

        google.maps.event.addDomListener(window, 'load', initialize);