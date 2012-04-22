/* core stuff. */

// and constants for tile height and width and page height and width (in
// number of tiles, not pixels).
var tile_size = 20;
var page_height = 25;
var page_width = 25;

// the image we use to highlight tiles
var highlight = new Image();
highlight.src = "resources/highlight.png"


// main list of stages to play.
levels = [first];


// stuff to do when the page finishes loading:
window.addEventListener('load', function () {
    // get the canvas element
    var canvas = document.getElementsByTagName("canvas")[0];
    // set its height and width.
    canvas.width = tile_size * page_width;
    canvas.height = tile_size * page_height;
    // get its 2d context.
    var context = canvas.getContext("2d");

    // run the first stage.
    run_stage(levels[0], canvas, context);

}, false);


function run_stage (stage, canvas, context) {
    stage.redraw(context);
    turn(stage, canvas, context, []);
};


function turn(stage, canvas, context, moved) {
    if (moved.length < stage.players.length) {
        var listener = click(function (x, y) {
            stage.players.forEach(function (player) {
                if (player.x == x && player.y == y && moved.indexOf(player) == -1) {
                    canvas.removeEventListener("click", listener);
                    highlight_movements(player, stage, canvas, context, moved);
                };
            });
        });
        canvas.addEventListener("click", listener, false);
    } else {
        // move all of the npcs.
        stage.npcs.forEach(function (npc) {
            // try attacking all of the players.
            var index = 0;
            function next () {
                if (index >= stage.players.length) {
                    turn(stage, canvas, context, []);
                } else {
                    var player = stage.players[index];
                    // if an npc is orthagonal to a player, attack it.
                    var o_x = Math.abs(npc.x - player.x) == 1 && npc.y - player.y == 0;
                    var o_y = Math.abs(npc.y - player.y) == 1 && npc.x - player.x == 0;
                    index++;
                    if (o_x | o_y) {
                        console.log(npc.name, "is attacking", player.name);
                        npc.attack(player, stage, context, next);
                    } else {
                        next();
                    };
                };
            };
            npc.move(stage, context, next);
        });
    };
};


function highlight_movements (player, stage, canvas, context, moved) {
    // determine all fo the tile coordinates (from the player's position) that
    // are in-range.
    var in_range = stage.possible(player);

    // highlight each of those tiles
    in_range.forEach(function (tile) {
        context.drawImage(highlight, tile.x * tile_size, tile.y * tile_size)
    });
    
    var move = click(function (x, y) {
        // remove this event listener
        canvas.removeEventListener("click", move);
        var have_moved = false;
        // if the click is in the range, move there.
        for (var index = 0; index < in_range.length; index ++) {
            if (in_range[index].x == x && in_range[index].y == y) {
                stage.move(player, x, y, context, function resume () {
                    // try attacking all of the npcs.
                    stage.npcs.forEach(function (npc) {
                        // if an npc is orthagonal to a player, attack it.
                        var o_x = Math.abs(npc.x - player.x) == 1 && npc.y - player.y == 0;
                        var o_y = Math.abs(npc.y - player.y) == 1 && npc.x - player.x == 0;
                        if (o_x | o_y) {
                            console.log(player.name, "are attacking the", npc.name);
                        };
                    });

                    moved.push(player);
                    stage.redraw(context);
                    turn(stage, canvas, context, moved);
                });
                have_moved = true;
                break;
            };
        }; 
        if (!have_moved) {
            // redraw things to get rid of the boxes and move the character
            stage.redraw(context);
            // run the turn again
            turn(stage, canvas, context, moved);
        }
    });
    canvas.addEventListener("click", move, false);
};
