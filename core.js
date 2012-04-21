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

    // just log tiles for now.
    canvas.addEventListener("click", click(function (x, y) {
        console.log(x, y);
    }), false);
}

