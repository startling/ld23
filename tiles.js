// constructor for tiles
function Tile (source_image) {
    this.image = new Image();
    this.image.src = source_image;
};


// these are all the tiles we have access to.
var tiles = {
    grass: new Tile("resources/grass.png"),
    sky: new Tile("resources/sky.png"),
};
