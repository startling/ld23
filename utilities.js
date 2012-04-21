/* A function wrapper that does two things:
 *  a.) it gets the position relative to the clicked target, rather than
 *      absolute coordinates from the page.
 *  b.) it determines which tile was clicked on, rather than the coordinates.
 *
 *  I'm not sure what pattern is appropriate for this in javascript, but it
 *  would be a decorator in python. Here's how you use it:
 *
 *  > document.addEventListener("click", click(function (x, y) {
 *      console.log(x, y);
 *  }), false);
 * */

function click (fn) {
    function click_wrapper (evt) {
        /* Silly hacks to get the position of a click, relative to the target.
         * Why is the DOM so terrible? */
        var rect = evt.target.getBoundingClientRect();
        var click_x = (evt.offsetX || evt.pageX - rect.left - window.scrollX) - 2;
        var click_y = (evt.offsetY || evt.pageY - rect.top - window.scrollY) - 2;
        // get rid of negative values.
        click_x = Math.abs(click_x);
        click_y = Math.abs(click_y);
        // and then figure out the actual tile that we clicked.
        var x = Math.floor(click_x / tile_size);
        var y = Math.floor(click_y / tile_size);
        // and then call the wrapped function
        return fn(x, y);
    };
    return click_wrapper;
};
