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


// row objects
function Row () {
    for (var num=0; num < 25; num++) {
        this[num] = null;
    };
};


// the base stage object every other stage inherits rows from.
var _base_stage = {
    // a background image
    background: null,
    // an (uninitialized) list of the player characters...
    players: null,
    // an (unitialized) list of obstacles
    obstacles: [],
    // and a list of npcs
    npcs: [],
    // nice information regarding this page.
    subtitle: "",

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
        // filter out duplicates
        // TODO: make this better/faster
        var uniques = [];
        ps.forEach(function (c) {
            // keep track of whether we've seen this thing
            var already = false;
            // if it's not already in "uniques", add it.
            for (var i = 0; i < uniques.length; i++) {
                if (uniques[i].x == c.x && uniques[i].y == c.y) {
                    already = true;
                    break;
                };
            };
            if (!already) {
                uniques.push(c);
            };
        });
        return uniques;
    },

    contains: function () {
        // return an array of everything in here.
        return this.players.concat(this.obstacles).concat(this.npcs);
    },

    path_to: function (ax, ay, bx, by, max) {
        // wooh tree recursion
        if (max < 0 | !this.open(bx, by)) {
            return null;
        } else if (ax == bx && ay == by) {
            return [];
        } else {
            var neighbors = this.neighbors(ax, ay);
            var shortest = null;
            for (var i = 0; i < neighbors.length; i ++) {
                var c = neighbors[i];
                var tried  = this.path_to(c.x, c.y, bx, by, max - 1);
                if (tried != null) {
                    var success = [c].concat(tried);
                    if (shortest == null) {
                        shortest = success;
                    } else if (success.length < shortest.length) {
                        shortest = success;   
                    };
                };
            }; 
            return shortest;
        };
    
    },

    move: function (character, x, y, context, resume) {
        var steps = this.path_to(character.x, character.y, x, y, character.speed);
        var index = 0;
        var _this = this;

        // handle illegal moves.
        if (steps == null) return;

        function step () {
            if (index < steps.length - 1) {
                var c = steps[index];
                index++;
                _this.move_one(character, c.x, c.y, context, step);
            } else {
                _this.move_one(character, x, y, context, resume);
            }
        };
        step();
    },

    move_one: function (character, x, y, context, resume) {
        // move smoothly from one square to another.
        var delta_x = x - character.x;
        var delta_y = y - character.y;
        var now_x = character.x * tile_size + delta_x;
        var now_y = character.y * tile_size + delta_y;
        var _this = this
        setTimeout(function redraw () {
            _this.redraw(context, character);
            context.drawImage(character.image, now_x, now_y);
            now_x += delta_x;
            now_y += delta_y;
            if (now_x == x * tile_size && now_y == y * tile_size) {
                character.x = x;
                character.y = y;
                _this.redraw(context);
                if (resume) {
                    resume();
                }
            } else {
                setTimeout(redraw, 7);
            };
        }, 7);
    },

    redraw: function (context, except) {
        // given an optional argument of a character *not* to draw, draw all of
        // the tiles and characters.
        context.clearRect(0, 0, tile_size * page_height, tile_size * page_width);
        context.drawImage(this.background, 0, 0);
        // draw each character + obstacle.
        this.contains().forEach(function (character) {
            if (character != except) {
                var x = character.x * tile_size;
                var y = character.y * tile_size;
                context.drawImage(character.image, x, y);
            };
        });
    },

    win: function () {
        // you win if there are no npcs left
        return this.npcs.length == 0;
    },

    lose: function () {
        // and you lose if there are no players left.
        return this.players.length == 0;
    },
};


function Stage (literal) {
    // create a stage with clones of each row of the base stage.
    var stage = Object.create(_base_stage);
    // add each value of the literal to this thing.
    Object.keys(literal).forEach(function (key) {
        stage[key] = literal[key];
    });
    // set the background image to the image it got...
    var image = new Image();
    image.src = stage.background;
    stage.background = image;
    return stage;
};


/* Defined Stages:
 * These are stages with stuff in them. */


function first(){ 
    return Stage({
        background: "resources/background_1.png",
        subtitle: "Pretty easy.",
        players: [player.at(3, 3), player.at(4, 4)],
        obstacles: [block.at(1, 1), block.at(1, 2), block.at(1, 3)],
        npcs: [npc.at(5, 5)]
    });
};


function second () {
    return Stage({
        background: "resources/brown.png",
        subtitle: "A little trickier.",
        players: [player.at(0, 0), player.at(6, 6)],
        obstacles: [block.at(0, 2), block.at(2, 0), block.at(1, 2), block.at(5, 4),
            block.at(4, 6), block.at(6, 4)],
        npcs: [npc.at(3, 3)],
    });
};

function third () {
    return Stage({
        background: "resources/background_1.png",
        subtitle: "Glider",
        players: [player.at(0, 0), player.at(6, 6)],
        obstacles: [block.at(2, 2), block.at(3, 2), block.at(4, 2), block.at(4, 3),
            block.at(3, 4)],
        npcs: [npc.at(3, 3)],
    });
};

function fourth () { 
    return Stage({
        background: "resources/brown.png",
        subtitle: "Around.",
        players: [player.at(6, 6)],
        obstacles: [puddle.tl.at(1, 1), puddle.left.at(1, 2), puddle.left.at(1, 3),
           puddle.bl.at(1, 4), puddle.inside_bl.at(2, 4), puddle.bl.at(2, 5), puddle.bottom.at(3, 5),
           puddle.bottom.at(5, 5), puddle.bottom.at(4, 5), puddle.br.at(6, 5), puddle.right.at(6, 4),
           puddle.right.at(6, 3), puddle.right.at(6, 2), puddle.tr.at(6, 1), puddle.top.at(5, 1),
           puddle.top.at(4, 1), puddle.top.at(3, 1), puddle.top.at(2, 1), puddle.middle.at(2, 2),
           puddle.middle.at(3, 2), puddle.middle.at(4, 2), puddle.middle.at(5, 2),
           puddle.middle.at(2, 3), puddle.middle.at(3, 3), puddle.middle.at(3, 4),
           puddle.middle.at(4, 4), puddle.middle.at(5, 4), puddle.middle.at(4, 3),
           puddle.middle.at(5, 3)],
        npcs: [npc.at(0, 0)],
    });
};

function fifth () {
    return Stage({
        background: "resources/background_1.png",
        subtitle: "Cornered",
        players: [player.at(6, 3)],
        obstacles: [block.at(4, 4), block.at(3, 2), block.at(4, 2), block.at(4, 3),
            block.at(3, 4)],
        npcs: [lazy.at(3, 3)],
    });
};

function sixth () {
    return Stage({
        background: "resources/brown.png",
        subtitle: "Sympleglades",
        players: [player.at(3, 0), player.at(3, 6)],
        obstacles: [block.at(5, 4), block.at(5, 2), block.at(4, 2), block.at(5, 3),
            block.at(4, 4), block.at(1, 2), block.at(2, 2), block.at(2, 4), block.at(1, 4),
           block.at(1, 3)],
        npcs: [lazy.at(4, 3), lazy.at(2, 3)],
    });

}
