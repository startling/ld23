/* Character Creation.
 * A base character and a Character constructor. The Character constructor takes
 * and object literal that it'll copy everything from. Use it like this:
 * > Character({
 *     name: "startling",
 *     image: "resources/x.png",
 *     x: 12, y: 13
 * });
 *  */


var _base_character = {
    // every character should have a name,
    name: null,
    // and image url,
    image: null,
    // and x and y coordinates.
    x: null, y: null,
    // the distance this thing can move in one turn.
    speed: 3,
    // hit points!
    max_hp: 10,
    // damage
    damage: 2,

    at: function (x, y) {
        var n = Object.create(this);
        n.x = x;
        n.y = y;
        return n;
    },

    move: function (stage, context) {
        // gets called whenever an npc has a chance to move.
        return;
    },

    information: function (to) {
        to.clearRect(0, 0, 500, 40);
        to.fillStyle = "#000000";
        to.font="12px subtitles";
        to.fillText(this.name + " (" + this.hp + "/" + this.max_hp + ")", 0, 20);
    },

    attack: function (other, stage, context, resume) {
        // MAKE SURE THE OTHER IS WITHIN ONE TILE
        // figure out what direction to jerk towards.
        var delta_x = other.x - this.x;
        var delta_y = other.y - this.y;

        var up = true;
        var _this = this;

        // assume it's one pixel! (don't draw this thing)
        setTimeout(function redraw () {
            stage.redraw(context, _this);
            if (Math.abs(delta_y) > 5 | Math.abs(delta_x) > 5) {
                up = false;
            }
            if (up) {
                delta_y *= 1.5; delta_x *= 1.5;
            } else {
                delta_y /= 1.5; delta_x /= 1.5;
            };
            var now_x = _this.x * tile_size + delta_x
            var now_y = _this.y * tile_size + delta_y
            context.drawImage(_this.image, now_x, now_y);
            
            if (Math.abs(delta_y) <= 1 && Math.abs(delta_x) <= 1) {
                stage.redraw(context);
                other.hp -= _this.damage;
                if (other.hp <= 0) {
                    // remove the other if it's dead.
                    var npc_index = stage.npcs.indexOf(other);
                    var p_index = stage.players.indexOf(other);
                    if (npc_index > -1) {
                        stage.npcs.splice(npc_index, 1)
                    } else if (p_index > -1) {
                        stage.players.splice(p_index, 1)
                    };
                };
                stage.redraw(context);
                resume();
            } else {
                setTimeout(redraw, 40);
            };
        }, 40);
    },
};


function Character (literal) {
    // create a new character, given an object literal of attributes.
    var character = Object.create(_base_character);
    // for each attribute in the literal, add it to the character
    Object.keys(literal).forEach(function (key) {
        character[key] = literal[key];
    });
    // set the character's image to the image it got...
    var image = new Image();
    image.src = character.image;
    character.image = image;
    // set its hp to its max_hp
    character.hp = character.max_hp;
    // and return it.
    return character
};


var player = Character({
    name: "you", image: "resources/player.png",
});


var block = Character({
    name: "a block", image: "resources/block.png",
});


var npc = Character({
    name: "magenta square", image: "resources/npc.png",
    move: function (stage, context, resume) {
        // gets called whenever an npc has a chance to move.
        // list of all the possible places to go.
        var possible = stage.possible(this);
        // find a random tile to go to.
        var index = Math.floor(Math.random() * possible.length)
        var tile = possible[index];
        stage.move(this, tile.x, tile.y, context, resume);
    },
});
