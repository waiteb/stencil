/* jshint esversion: 6 */
module.exports = function(Stencil) {

    Stencil.addAttribute({
        name: "if",
        onRender: function(model, attribute, node, stencil) {
            if (!attribute.value) {
                return "";
            }
        }
    });

    Stencil.addAttribute({
        name: "each",
        onRender: function(model, attribute, node, stencil) {
            
            var output = [];

            for (let i = 0; i < attribute.value.length; i ++) {
                output.push(stencil.renderElement(attribute.value[i], [], node));
            }

            return output.join("");
        }
    });

};