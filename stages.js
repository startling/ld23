/* Stage Creation:
 * This is a little bit messy, but the upshot of it all is that we have a Stage
 * constructor that:
 *  a.) creates a stage that inherits from the base stage, which is all sky
 *      tiles.
 *  b.) gives the new stage a bunch of Row objects that inherit from the base
 *      stage's Row objects.
 * This makes it so that you can assign to each stage's tiles like so:
 *  > stage[0][0] = tiles.grass;
 * ...and it will overwrite that one's [0][0] (top right) tile, but leave the
 * rest to be inherited from the base. Yay differential inheritance!
 * */


// row objects, given an array.
function Row (arr) {
    for (var num=0; num < 25; num++) {
        this[num] = arr[num];
    };
};


// the base stage object every other stage inherits rows from.
var _base_stage = {
    draw: function (context) {
        // draw this stage to a canvas' 2d context
        for (var row = 0; row < page_height - 1; row++) {
            var x = row * tile_size;
            for (var col = 0; col < page_width; col ++) {
                var y = col * tile_size;
                context.drawImage(this[row][col].image, x, y);
            };
        };
    }
};


// fill it up with 20 new rows
for (var num=0; num < 25; num++) {
    // each of which is a sky tile for now.
    _base_stage[num] = new Row([
        tiles.sky, tiles.sky, tiles.sky, tiles.sky, tiles.sky,
        tiles.sky, tiles.sky, tiles.sky, tiles.sky, tiles.sky,
        tiles.sky, tiles.sky, tiles.sky, tiles.sky, tiles.sky,
        tiles.sky, tiles.sky, tiles.sky, tiles.sky, tiles.sky,
        tiles.sky, tiles.sky, tiles.sky, tiles.sky, tiles.sky,
    ]);
};


function Stage () {
    // create a stage with clones of each row of the base stage.
    var stage = Object.create(_base_stage);
    for (var num = 0; num < 25; num++){
        stage[num] = Object.create(_base_stage[num]);
    };
    return stage;
};
