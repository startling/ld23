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
    // an (uninitialized) list of the player characters...
    players: null,
    // an (unitialized) list of obstacles
    obstacles: [],
    // and a list of npcs
    npcs: [],

    draw_tiles: function (context) {
        // draw this stage to a canvas' 2d context
        for (var row = 0; row < page_height; row++) {
            var x = row * tile_size;
            for (var col = 0; col < page_width; col ++) {
                var y = col * tile_size;
                context.drawImage(this[row][col].image, x, y);
            };
        };
    },

    draw_characters: function (context) {
        // draw each player character (more later)
        this.contains().forEach(function (character) {
            var x = character.x * tile_size;
            var y = character.y * tile_size;
            context.drawImage(character.image, x, y);
        });
    },
    
    open: function (x, y) {
        // return true if a space isn't filled, false otherwise
        // check if there are any player characters here.
        var everything = this.contains();
        for (var index = 0; index < everything.length; index++) {
            var character = everything[index];
            if (character.x == x && character.y == y) {
                return false;
            };
        };
        return true;
    },
    
    in_bounds: function(x, y) {
        // determine whether a space is in-bounds
        return x >= 0 && y >= 0 && x < page_width && y < page_height
    },

    neighbors: function (x, y) {
        // return objects like {x:0, y:0} that are next to given coordinates
        // and *not blocked*.
        var ns = [];
        var _this = this;
        // the only possible neighbors (no diagonals):
        [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(function (c) {
            var this_x = c[0] + x;
            var this_y = c[1] + y;
            if (_this.in_bounds(this_x, this_y) && _this.open(this_x, this_y)) {
                ns.push({x: this_x, y: this_y});
            };
        })
        return ns;
    },

    possible: function (character) {
        // return a list of the possible (unblocked) moves for a character
        var ps = [];
        var these = {
            0: [this.neighbors(character.x, character.y)],
        }
        var counter = 0;
        var _this = this;
        while (counter < character.speed) {
            these[counter + 1] = [];
            these[counter].forEach(function (set) {
                ps = ps.concat(set);
                set.forEach(function (c) {
                    these[counter + 1].push(_this.neighbors(c.x, c.y));
                });
            });
            counter++;
        };
        return ps;
    },

    contains: function () {
        // return an array of everything in here.
        return this.players.concat(this.obstacles).concat(this.npcs);
    },
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


function Stage (literal) {
    // create a stage with clones of each row of the base stage.
    var stage = Object.create(_base_stage);
    // add each value of the literal to this thing.
    Object.keys(literal).forEach(function (key) {
        stage[key] = literal[key];
    });
    // copy all of the rows here.
    for (var num = 0; num < 25; num++){
        stage[num] = Object.create(_base_stage[num]);
    };
    return stage;
};


/* Defined Stages:
 * These are stages with stuff in them. */


var first = Stage({
    players: [player.at(0, 2), player.at(2, 2)],
    obstacles: [block.at(1, 1), block.at(1, 2), block.at(1, 3)],
});
