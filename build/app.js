var map,ie_cartodb1_gmapsv3,ie_cartodb2_gmapsv3;function toggleFullscreen(){}
function initialize(){var h={zoom:9,center:new google.maps.LatLng(29.05,-81.25),mapTypeId:google.maps.MapTypeId.ROADMAP,disableDefaultUI:!0,styles:[{stylers:[{saturation:-75}]},{featureType:"administrative",stylers:[{visibility:"off"}]},{featureType:"road.highway",stylers:[{gamma:6.18},{hue:"#3c00ff"},{lightness:74},{saturation:54},{visibility:"simplified"}]},{featureType:"road.arterial",stylers:[{visibility:"simplified"},{saturation:90},{lightness:54}]},{featureType:"water",stylers:[{saturation:18}]},
{elementType:"labels",stylers:[{visibility:"off"}]},{featureType:"poi.park",stylers:[{visibility:"simplified"},{lightness:30},{saturation:-7}]},{elementType:"labels",stylers:[{visibility:"off"}]}]};map=new google.maps.Map(document.getElementById("map_canvas"),h);google.maps.event.addDomListener(document.getElementById("zoom_in"),"click",function(){map.setZoom(map.getZoom()+1)});google.maps.event.addDomListener(document.getElementById("zoom_out"),"click",function(){map.setZoom(map.getZoom()-1)});if($.browser.msie&&
9>parseInt($.browser.version)){var h=document.getElementsByTagName("head")[0],e=document.createElement("script");e.id="uploadScript";e.type="text/javascript";e.src="cartodb-gmapsv3.js?x="+Math.random();h.appendChild(e);e.onreadystatechange=function(){ie_cartodb2_gmapsv3=new google.maps.CartoDBLayer({map_canvas:"map_canvas",map:map,user_name:"wsj",table_name:"volusiaboundary",query:"SELECT * FROM volusiaboundary",map_style:!0,infowindow:!1,auto_bound:!1});ie_cartodb1_gmapsv3=new google.maps.CartoDBLayer({map_canvas:"map_canvas",
map:map,user_name:"wsj",table_name:"volusia_homes_data",map_style:!0,query:"SELECT * FROM volusia_homes_data WHERE cartodb_id != -1",infowindow:!0,auto_bound:!1})}}else{var i=new CartoDB({user:"wsj",table:"volusia_homes_data",columns:["cartodb_id","zipcode","percent_delinquent"],where:"percent_delinquent IS NOT NULL",debug:!1,shader:{"point-color":"#FFF","line-color":"rgba(0, 0, 0, 0.4)","line-width":function(a){return-1==a.cartodb_id?3:0.7},"polygon-fill":function(a){if(-1==a.cartodb_id)return"rgba(0,0,0,0)";
var a=a.percent_delinquent,b=0;0.22>=a&&(b++,0.195>a&&(b++,0.17>a&&(b++,0.145>a&&(b++,0.12>a&&(b++,0.95>a&&b++)))));return"rgba(252, 187, 161,0.7);rgba(252, 146, 114,0.7);rgba(251, 106, 74,0.7);rgba(239, 59, 44,0.7);rgba(203, 24, 29,0.7);rgba(165, 15, 21,0.7);rgba(103, 0, 13,0.7)".split(";")[b]}}});map.overlayMapTypes.insertAt(0,i.layer);var j=new MercatorProjection,c=[],g=new CartoDBInfowindow(map);google.maps.event.addListener(map,"mousemove",function(a){var b=j.latLngToTile(a.latLng,map.zoom),
d=i.layer.tiles[b.x+"_"+b.y+"_"+map.zoom],b=1<<map.zoom,a=new google.maps.Point(Math.floor(a.point.x*b%256),Math.floor(a.point.y*b%256)),a=d.hit_ctx.getImageData(a.x,a.y,1,1).data;if(0!==a[3]){var f=RGB2Int(a[0],a[1],a[2]);d.primitives&&d.primitives[f]&&-1!=d.primitives[f].properties.cartodb_id&&(JSON.stringify(d.primitives[f].geometry),opts={strokeColor:"#FFF366",strokeOpacity:0.8,strokeWeight:2,fillColor:"#FFF366",fillOpacity:0.6},0<c.length&&(c.forEach(function(a){a.setMap(null);google.maps.event.clearListeners(a,
"click")}),c.remove(0,c.length-1)),a=new GeoJSON(d.primitives[f].geometry,opts),!a.error&&void 0===a.length&&(a.setMap(map),c.push(a)),google.maps.event.addListener(a,"click",function(a){var b=(100*d.primitives[f].properties.percent_delinquent).toFixed(1),c=d.primitives[f].properties.zipcode;Math.pow(2,map.getZoom());var e=new google.maps.LatLng(map.getBounds().getNorthEast().lat(),map.getBounds().getSouthWest().lng());map.getProjection().fromLatLngToPoint(e);map.getProjection().fromLatLngToPoint(a.latLng);
g.draw(a.latLng,'<a href="#close" class="close">x</a><div class="outer_top"><div class="top"><p>Homes seriously delinquent or in foreclosure</p></div></div><div class="bottom"><label class="strong">'+b+'% </label><label class="box">ZIP CODE: '+c+" </label></div>");g.start()}))}else 0<c.length&&(c.forEach(function(a){a.setMap(null);google.maps.event.clearListeners(a,"click")}),c.remove(0,c.length-1))});Array.prototype.remove=function(a,b){var c=this.slice((b||a)+1||this.length);this.length=0>a?this.length+
a:a;return this.push.apply(this,c)}}$("#fullscreen").click(function(){map.getBounds();var a=map.getCenter(),b=map.getZoom();$("body").hasClass("fullscreen")?($("body").removeClass("fullscreen"),b--):($("body").addClass("fullscreen"),b++);g&&g.hideAll();google.maps.event.trigger(map,"resize");map.setCenter(a);map.setZoom(b)})}google.maps.event.addDomListener(window,"load",initialize);
