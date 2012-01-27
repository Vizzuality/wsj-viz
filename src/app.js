var map;
var ie_cartodb1_gmapsv3,
ie_cartodb2_gmapsv3;
function toggleFullscreen() {}

function initialize() {
    var mapOptions = {
        zoom: 9,
        center: new google.maps.LatLng(29.05, -81.25),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        styles: [{
            stylers: [{
                saturation: -75
            }]
        },
        {
            featureType: "administrative",
            stylers: [{
                visibility: "off"
            }]
        },
        {
            featureType: "road.highway",
            stylers: [{
                gamma: 6.18
            },
            {
                hue: "#3c00ff"
            },
            {
                lightness: 74
            },
            {
                saturation: 54
            },
            {
                visibility: "simplified"
            }]
        },
        {
            featureType: "road.arterial",
            stylers: [{
                visibility: "simplified"
            },
            {
                saturation: 90
            },
            {
                lightness: 54
            }]
        },
        {
            featureType: "water",
            stylers: [{
                saturation: 18
            }]
        },
        {
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        },
        {
            featureType: "poi.park",
            stylers: [{
                visibility: "simplified"
            },
            {
                lightness: 30
            },
            {
                saturation: -7
            }]
        },
        {
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }]
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
    google.maps.event.addDomListener(document.getElementById('zoom_in'), 'click',
    function() {
        map.setZoom(map.getZoom() + 1);
    });
    google.maps.event.addDomListener(document.getElementById('zoom_out'), 'click',
    function() {
        map.setZoom(map.getZoom() - 1);
    });
    if ($.browser.msie && parseInt($.browser.version) < 9) {
        //START NON IE
        //alert('IE Explorer');
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement('script');
        script.id = 'uploadScript';
        script.type = 'text/javascript';
        script.src = "build/cartodb-gmapsv3.js";
        head.appendChild(script);
        script.onreadystatechange = function() {
            ie_cartodb2_gmapsv3 = new google.maps.CartoDBLayer({
                map_canvas: 'map_canvas',
                map: map,
                user_name: 'wsj',
                table_name: 'volusiaboundary',
                query: "SELECT * FROM volusiaboundary",
                map_style: true,
                infowindow: false,
                auto_bound: false
            });
            ie_cartodb1_gmapsv3 = new google.maps.CartoDBLayer({
                map_canvas: 'map_canvas',
                map: map,
                user_name: 'wsj',
                table_name: 'volusia_homes_data',
                map_style: true,
                query: "SELECT * FROM volusia_homes_data WHERE cartodb_id != -1",
                infowindow: true,
                auto_bound: false
            });
        }
        //END IE
    } else {
        var LW = 2;
        var PO = 0.7;
        var sh = [
        {
            'point-color': '#FFF',
            'line-color': function(data) {
                if (data.zipcode == 32720 || data.zipcode == 32724) {
                    return "rgba(11,11,11, 0.6)";
                } else {
                    return "rgba(0, 0, 0, 0.4)";
                }
            },
            'line-width': function(data) {
                if (data.cartodb_id == -1.0) {
                    return 3;
                } else if (data.zipcode == 32720 || data.zipcode == 32724) {
                    return 2.8;
                } else {
                    return 0.7;
                }
            },
            'polygon-fill': function(data) {
                if (data.cartodb_id == -1.0) {
                    return "rgba(0,0,0,0)";
                } else {
                    var q = data.percent_delinquent;
                    var v = 0;
                    //Math.floor((q*100)/6)
                    var colors = [
                    "rgba(103, 0, 13," + PO + ")",
                    "rgba(165, 15, 21," + PO + ")",
                    "rgba(203, 24, 29," + PO + ")",
                    "rgba(239, 59, 44," + PO + ")",
                    "rgba(251, 106, 74," + PO + ")",
                    "rgba(252, 146, 114," + PO + ")",
                    "rgba(252, 187, 161," + PO + ")"
                    ];
                    if (q <= .22) {
                        v++;
                        if (q < .195) {
                            v++;
                            if (q < .17) {
                                v++;
                                if (q < .145) {
                                    v++;
                                    if (q < .12) {
                                        v++;
                                        if (q < .095) {
                                            v++;
                                        }
                                    }
                                }
                            }
                        }

                    }
                    return colors[v];
                }
            }
        }
        ]

        var cartodb = new CartoDB({
            user: 'wsj',
            table: 'volusia_homes_data',
            columns: ['cartodb_id', 'zipcode', 'percent_delinquent'],
            where: "percent_delinquent IS NOT NULL",
            debug: false,
            shader: sh[0]
        });

        var sh_t = 'percent_delinquent';
        //shader text
        map.overlayMapTypes.insertAt(0, cartodb.layer);
        var projection = new MercatorProjection();
        var myGoogleVectors = [];

        var infowindow = new CartoDBInfowindow(map);

        google.maps.event.addListener(map, 'mousemove',
        function(event) {
            // get tile
            var coord = projection.latLngToTile(event.latLng, map.zoom);

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
            if (c[3] !== 0) {
                // get primitive array index from rgb
                var primitive_idx = RGB2Int(c[0], c[1], c[2]);
                if (tile.primitives && tile.primitives[primitive_idx] && tile.primitives[primitive_idx].properties.cartodb_id != -1.0) {
                    var geom = JSON.stringify(tile.primitives[primitive_idx].geometry);
                    var text = "<b>tile:</b> " + coord + '<br>';
                    text = text + "<b>pixel:</b> " + pixel_offset + '<br>';
                    text = text + "<b>primitive_idx: </b>" + primitive_idx + '<br>';
                    opts = {
                        "strokeColor": "#FFF366",
                        "strokeOpacity": 0.8,
                        "strokeWeight": 2,
                        "fillColor": "#FFF366",
                        "fillOpacity": 0.6
                    };

                    if (myGoogleVectors.length > 0) {

                        myGoogleVectors.forEach(function(gv) {
                            gv.setMap(null);
                            google.maps.event.clearListeners(gv, 'click');
                        });

                        myGoogleVectors.remove(0, myGoogleVectors.length - 1);
                    }

                    var myGoogleVector = new GeoJSON(tile.primitives[primitive_idx].geometry, opts);

                    if (myGoogleVector.error) {
                        // Handle the error.
                        } else {
                        if (myGoogleVector.length === undefined) {
                            myGoogleVector.setMap(map);
                            myGoogleVectors.push(myGoogleVector);
                        }
                    }
                    
                    google.maps.event.addListener(myGoogleVector, 'click',
                    function(ev) {
                        var pc = (tile.primitives[primitive_idx].properties.percent_delinquent * 100).toFixed(1);
                        var zc = tile.primitives[primitive_idx].properties.zipcode;

                        var scale = Math.pow(2, map.getZoom());

                        var nw = new google.maps.LatLng(
                        map.getBounds().getNorthEast().lat(),
                        map.getBounds().getSouthWest().lng()
                        );
                        var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
                        var worldCoordinate = map.getProjection().fromLatLngToPoint(ev.latLng);
                        var xx = Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale);
                        var yy = Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale);
                        var txt = '<a href="#close" class="close">x</a>' +
                        '<div class="outer_top">' +
                        '<div class="top"><p>Mortgages seriously delinquent or in foreclosure</p></div>' +
                        '</div>' +
                        '<div class="bottom">' +
                        '<label class="strong">' + pc + '% </label>' +
                        '<label class="box">ZIP CODE: ' + zc + ' </label>' +
                        '</div>';
                        infowindow.draw(ev.latLng, txt);
                        infowindow.start();
                    });

                    // render the geometry to canvas here...
                }
            } else {
                // in the sea so clear the rollovers
                if (myGoogleVectors.length > 0) {

                    myGoogleVectors.forEach(function(gv) {
                        gv.setMap(null);
                        google.maps.event.clearListeners(gv, 'click');
                    });
                    myGoogleVectors.remove(0, myGoogleVectors.length - 1);
                }
            }
        });

        function map_latlon(latlng, x, y, zoom) {
            latlng = new google.maps.LatLng(latlng[1], latlng[0]);
            return self.projection.latLngToTilePoint(latlng, x, y, zoom);
        }

        Array.prototype.remove = function(from, to) {
            var rest = this.slice((to || from) + 1 || this.length);
            this.length = from < 0 ? this.length + from: from;
            return this.push.apply(this, rest);
        };
    }

    $('#fullscreen').click(function() {
        var bnds = map.getBounds();
        var cent = map.getCenter();
        var zm = map.getZoom();
        if ($('body').hasClass('fullscreen')) {
            $('body').removeClass('fullscreen');
            zm--;
            if (infowindow) {
                infowindow.hideAll()
            }
        } else {
            $('body').addClass('fullscreen');
            zm++;
            if (infowindow) {
                infowindow.hideAll()
            }
        }
        google.maps.event.trigger(map, 'resize');
        map.setCenter(cent);
        map.setZoom(zm);

    });
}

google.maps.event.addDomListener(window, 'load', initialize);