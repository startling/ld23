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
        console.log("npcs: go!");
        stage.npcs.forEach(function (npc) {
            npc.move(stage, context);
        });
        // and then reset the "moved" counter.
        turn(stage, canvas, context, []);
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
        // if the click is in the range, move there.
        for (var index = 0; index < in_range.length; index ++) {
            if (in_range[index].x == x && in_range[index].y == y) {
                stage.move(player, x, y, context);
                moved.push(player);
                break;
            };
        }; 
        // redraw things to get rid of the boxes and move the character
        stage.redraw(context);
        // run the turn again
        turn(stage, canvas, context, moved);
    });
    canvas.addEventListener("click", move, false);
};
