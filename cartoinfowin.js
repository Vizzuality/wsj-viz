
	var CartoDBInfowindow = function(map) {
	  this.latlng_ = new google.maps.LatLng(0,0);
		this.feature_;
		this.map_ = map;
		this.columns_;
	  this.offsetHorizontal_ = -132;
	  this.width_ = 264;
	  this.setMap(map);
	}
	CartoDBInfowindow.prototype = new google.maps.OverlayView();
	CartoDBInfowindow.prototype.draw = function(x,y,txt) {
	  var me = this;
	  var div = this.div_;
	  this.x_ = x;
	  this.y_ = y;
	  if (!div) {
	    div = this.div_ = document.createElement('div');
	    div.setAttribute('class','cartodb_infowindow');
	      google.maps.event.addDomListener(div,'click',function(ev){ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;});
      google.maps.event.addDomListener(div,'dblclick',function(ev){ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;});
      google.maps.event.addDomListener(div,'mousedown',function(ev){ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;});
      google.maps.event.addDomListener(div,'mouseup',function(ev){ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;});
	   google.maps.event.addDomListener(div,'mousewheel',function(ev){ev.stopPropagation()});
      google.maps.event.addDomListener(div,'DOMMouseScroll',function(ev){ev.stopPropagation()});

	    var panes = this.getPanes();
	    panes.floatPane.appendChild(div);

	    div.style.opacity = 0;
	  }
	  if (txt){
	      
        div.innerHTML = txt;
 	    $(div).find('a.close').click(function(evz){
 	      evz.preventDefault();
 	      evz.stopPropagation();
          me.hide();
        });
	  }

	  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
	  if (pixPosition) {
		  div.style.width = this.width_ + 'px';
		  div.style.left = (x - 49) + 'px';
		  var actual_height = - $(div).height();
		//actual_height = 33;
		  div.style.top = (y + actual_height + 2) + 'px';
	  }
	};
	CartoDBInfowindow.prototype.start = function() {
	  if (this.div_) { 
 	    var div = this.div_;
 	    this.moveMaptoOpen();
 	    this.show();
      }
	}
	CartoDBInfowindow.prototype.show = function() {
	  if (this.div_) {
	    var div = this.div_;
			div.style.opacity = 0;
			div.style.visibility = "visible";
			$(div).animate({
	      top: '-=' + 10 + 'px',
	      opacity: 1},
	      250
			);
		}
	}
	CartoDBInfowindow.prototype.hide = function() {
	  if (this.div_) {
	    var div = this.div_;
	    $(div).animate({
	      top: '+=' + 10 + 'px',
	      opacity: 0},
	      100, 'swing',
        function () {
          div.style.visibility = "hidden";
        }
			);
	  }
	}
	
	CartoDBInfowindow.prototype.hideAll = function() {
        $('div.cartodb_infowindow').css('visibility','hidden');
    }
	CartoDBInfowindow.prototype.moveMaptoOpen = function() {
		var left = 0;
		var top = 0;
		var div = this.div_;
		var x = this.x_;
		var y = this.y_;
	    //var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.latlng_);

		if ((x + this.offsetHorizontal_) < 0) {
			left = (x + this.offsetHorizontal_ - 20);
		}

		if ((x + 180) >= ($('#map_canvas').width())) {
			left = (x + 180 - $('#map_canvas').width());
		}

		if ((y - $(div).height()) < 0) {
			top = (y - $(div).height() - 30);
		}

		this.map_.panBy(left,top);
	}