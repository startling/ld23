/* core stuff. */

// and constants for tile height and width and page height and width (in
// number of tiles, not pixels).
var tile_size = 20;
var page_height = 26;
var page_width = 25;


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
    stage.draw_tiles(context);
    // save the stage's background only.
    context.save();
    // and draw all of the characters.
    stage.draw_characters(context);
    turn(stage, canvas, context);
};


function turn(stage, canvas, context) {
    var listener = click(function (x, y) {
        stage.players.forEach(function (player) {
            if (player.x == x && player.y == y) {
                canvas.removeEventListener("click", listener);
                highlight_movements(player, stage, canvas, context);
            };
        });
    });
    canvas.addEventListener("click", listener, false);
};


function highlight_movements (player, stage, canvas, context) {
    // determine all fo the tile coordinates (from the player's position) that
    // are in-range.
    // TODO: ignore blocked paths.
    var in_range = [];
    for (var x = -player.speed; x <= player.speed; x++) {
        for (var y =-player.speed; y <= player.speed; y++) {
            // ignore the ones that are too far away.
            if (Math.abs(x) + Math.abs(y) <= player.speed) {
                in_range.push({x: x + player.x, y: y + player.y});
            };
        };
    };

    // highlight each of those tiles
    in_range.forEach(function (tile) {
        context.strokeStyle = "#ffffff";
        context.strokeRect(tile.x * tile_size, tile.y * tile_size, tile_size, tile_size)
    });
    
    var move = click(function (x, y) {
        // redraw things to get rid of the boxes
        stage.draw_tiles(context);
        stage.draw_characters(context);
        // remove this event listener
        canvas.removeEventListener("click", move);
        // run the turn again
        turn(stage, canvas, context);
    });
    canvas.addEventListener("click", move, false);
};









