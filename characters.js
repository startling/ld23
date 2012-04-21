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
}


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
    // and return it.
    return character
};
