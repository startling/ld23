/* core stuff. */

// and constants for tile height and width and page height and width (in
// number of tiles, not pixels).
var tile_size = 20;
var page_height = 7;
var page_width = 7;

// the image we use to highlight tiles
var highlight = new Image();
highlight.src = "resources/highlight.png"


// main list of stages to play.
var levels = [first, second, third, fourth, fifth, sixth];
var this_stage = 0;


// stuff to do when the page finishes loading:
window.addEventListener('load', function () {
    // get the canvas element
    var canvas = document.getElementById("board");
    // set its height and width.
    canvas.width = tile_size * page_width;
    canvas.height = tile_size * page_height;
    // get its 2d context.
    var context = canvas.getContext("2d");
    // get the little information bar
    var i_canvas = document.getElementById("information");
    var i_context = i_canvas.getContext("2d");
    i_canvas.width = tile_size * page_width;
    i_canvas.height = tile_size * 2;
    // run the first stage.
    var f = Object.create(levels[0])
    run_stage(levels[0](), canvas, context, i_context);

}, false);


function run_stage (stage, canvas, context, i_context) {
    stage.redraw(context);
    stage.redraw(context);
    turn(stage, canvas, context, i_context, []);
};


function turn(stage, canvas, context, i_context, moved) {
    if (stage.win()) {
        if (this_stage == levels.length - 1){
            console.log("you won everything");
        } else {
            this_stage += 1;
            console.log(levels[this_stage]())
            run_stage(levels[this_stage](), canvas, context, i_context);
        };
    } else if (stage.lose()) {
        var n = levels.indexOf(stage);
        run_stage(levels[n](), canvas, context, i_context);
    } else if (moved.length < stage.players.length) {
        var listener = click(function (x, y) {
            var clicked_on = false;
            stage.players.forEach(function (player) {
                if (player.x == x && player.y == y && moved.indexOf(player) == -1) {
                    canvas.removeEventListener("click", listener);
                    player.information(i_context);
                    highlight_movements(player, stage, canvas, context, i_context, moved);
                    clicked_on = true;
                };
            });
            if (!clicked_on) {
                for (var i = 0; i < stage.npcs.length; i++) {
                    var npc = stage.npcs[i];
                    if (npc.x == x && npc.y == y) {
                        npc.information(i_context);
                        clicked_on = true;
                        break
                    };
                };
            };
            if (!clicked_on) {
                i_context.clearRect(0, 0, 500, 40);
                i_context.fillStyle = "#000000";
                i_context.font="12px subtitles";
                console.log("!")
                i_context.fillText(stage.subtitle, 0, 20);
            };
        });
        canvas.addEventListener("click", listener, false);
    } else {
        // move all of the npcs.
        stage.npcs.forEach(function (npc) {
            // try attacking all of the players.
            var index = 0;
            function next () {
                if (index >= stage.players.length) {
                    turn(stage, canvas, context, i_context, []);
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


function highlight_movements (player, stage, canvas, context, i_context, moved) {
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
                var index = 0;
                stage.move(player, x, y, context, function next () {
                    if (index >= stage.npcs.length) {
                        moved.push(player);
                        stage.redraw(context);
                        turn(stage, canvas, context, i_context, moved);
                    } else {
                        var npc = stage.npcs[index];
                        // if an npc is orthagonal to a player, attack it.
                        var o_x = Math.abs(npc.x - player.x) == 1 && npc.y - player.y == 0;
                        var o_y = Math.abs(npc.y - player.y) == 1 && npc.x - player.x == 0;
                        index++;
                        if (o_x | o_y) {
                            console.log(player.name, "is attacking", npc.name);
                            player.attack(npc, stage, context, next);
                        } else {
                            next();
                        };
                    };
                });
                have_moved = true;
                break;
            };
        }; 
        if (!have_moved) {
            // redraw things to get rid of the boxes and move the character
            stage.redraw(context);
            // run the turn again
            turn(stage, canvas, context, i_context, moved);
        }
    });
    canvas.addEventListener("click", move, false);
};
