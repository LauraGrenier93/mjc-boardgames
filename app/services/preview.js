/**
* fonction permettant de créer une preview
* @param {Array} array - le tableau d'objet auquel on veut rajouté une preview
*/
function getPreview(array) {
    for (const props of array) {
        props.preview = props.description.split(" ").splice(0, 30).join(' ');
    }
    return array;
};

module.exports = getPreview;