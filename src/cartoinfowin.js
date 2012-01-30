
	var CartoDBInfowindow = function(map) {
	  this.latlng_ = new google.maps.LatLng(0,0);
		this.feature_;
		this.map_ = map;
		this.columns_;
	  this.width_ = 264;
	  this.height_ = 124;
	  this.offsetVertical_ = -114;
	  this.offsetHorizontal_ = -191;
	  this.setMap(map);
	}
	CartoDBInfowindow.prototype = new google.maps.OverlayView();
	CartoDBInfowindow.prototype.draw = function(latlng,array) {
	  var me = this;
	  var div = this.div_;
	  this.latlng_ = latlng;

	  if (!div) {
	    div = this.div_ = document.createElement('DIV');
	    div.className = "cartodb_infowindow";
	    $(div).append('<a href="#close" class="close" style="background:red!important">x</a><div class="outer_top"><div class="top"><p>Mortgages seriously delinquent or in foreclosure</p></div></div><div class="bottom"><label class="strong">% </label><label class="box">ZIP CODE:</label></div>');

	    $(div).find('a.close').click(function(evz){
	      evz.preventDefault();
	      evz.stopPropagation();
	      me.hide();
	    });

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


	  if (array){
	  	$(div).find('label.strong').text(array[0] + '%');
	  	$(div).find('label.box').text(array[1]); 
	  }

	  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);

	  if (pixPosition) {
  	  div.style.width = this.width_ + 'px';
  	  div.style.left = (pixPosition.x + this.offsetHorizontal_) + 'px';
  	  div.style.height = this.height_ + 'px';
  	  div.style.top = (pixPosition.y + this.offsetVertical_) + 'px';
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
			div.style.opacity = 1;
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
		var pixPosition = this.getProjection().fromLatLngToContainerPixel(this.latlng_);

		if ((pixPosition.x + this.offsetHorizontal_) < 0) {
			left = (pixPosition.x + this.offsetHorizontal_ - 20);
		}

		if ((pixPosition.x + this.width_ + this.offsetHorizontal_) >= ($('#map_canvas').width())) {
			left = (pixPosition.x + this.width_ + this.offsetHorizontal_ - $('#map_canvas').width());
		}

		if ((pixPosition.y - $(div).height()) < 0) {
			top = (pixPosition.y - $(div).height() - 30);
		}

		this.map_.panBy(left,top);
	}