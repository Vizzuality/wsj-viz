
function CanvasTileLayer(canvas_setup) {
    this.tileSize = new google.maps.Size(256,256);
    this.maxZoom = 19;
    this.name = "Tile #s";
    this.alt = "Canvas tile layer";
    this.tiles = {};
    this.canvas_setup = canvas_setup;
}


// create a tile with a canvas element
CanvasTileLayer.prototype.create_tile_canvas = function(coord, zoom, ownerDocument) {

    // create canvas and reset style
    var back_canvas = ownerDocument.createElement('canvas');
    var canvas      = ownerDocument.createElement('canvas');
    var hit_canvas  = ownerDocument.createElement('canvas');
    canvas.style.border  = hit_canvas.style.border = "none";
    canvas.style.margin  = hit_canvas.style.margin = "0";
    canvas.style.padding = hit_canvas.style.padding = "0";
    back_canvas.style.border = "none";
    back_canvas.style.margin = "0";
    back_canvas.style.padding = "0";
    back_canvas.style.display = "none";

    // prepare canvas and context sizes
    var ctx    = canvas.getContext('2d');
    ctx.width  = canvas.width = this.tileSize.width;
    ctx.height = canvas.height = this.tileSize.height;

    var hit_ctx = hit_canvas.getContext('2d');
    hit_canvas.width  = hit_ctx.width  = this.tileSize.width;
    hit_canvas.height = hit_ctx.height = this.tileSize.height;

    var back_ctx = back_canvas.getContext('2d');
    back_ctx.width = back_canvas.width  = this.tileSize.width;
    back_ctx.height = back_canvas.height = this.tileSize.height;

    //set unique id
    var tile_id = coord.x + '_' + coord.y + '_' + zoom;

    canvas.setAttribute('id', tile_id);
    hit_canvas.setAttribute('id', tile_id);

    if (tile_id in this.tiles)
        delete this.tiles[tile_id];

    this.tiles[tile_id] = {
       canvas: canvas,
       ctx: ctx,
       hit_canvas: hit_canvas,
       hit_ctx: hit_ctx,
       coord: coord,
       zoom: zoom,
       primitives: null,
       back_ctx: back_ctx,
       back_canvas: back_canvas
    };

    // custom setup
    if (this.canvas_setup)
        this.canvas_setup(this.tiles[tile_id], coord, zoom);

    return canvas;
}

 
CanvasTileLayer.prototype.each = function(callback) {
    for(var t in this.tiles) {
        var tile = this.tiles[t];
        callback(tile);
    }
}

// flip backbuffer to canvas
CanvasTileLayer.prototype.flip = function() {
    for(var t in this.tiles) {
        var tile = this.tiles[t];
        tile.canvas.width = tile.canvas.width;
        tile.ctx.drawImage(tile.back_canvas, 0, 0);
    }
}

CanvasTileLayer.prototype.redraw = function() {
    var self = this;
    for(var t in this.tiles) {
        var tile = this.tiles[t];
        this.canvas_setup(tile, tile.coord, tile.zoom, function() {
              //self.flip();
        });
    }
};

// could be called directly...
CanvasTileLayer.prototype.getTile = function(coord, zoom, ownerDocument) {
    return this.create_tile_canvas(coord, zoom, ownerDocument);
};

CanvasTileLayer.prototype.releaseTile = function(tile) {
    var id = tile.getAttribute('id');
    delete this.tiles[id];
};
