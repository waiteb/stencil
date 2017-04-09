/* jshint esversion: 6 */
module.exports = function(Stencil) {

    Stencil.addAttribute({
        name: "if",
        onRender: function(attribute) {
            if (!attribute.value) {
                return "";
            }
        }
    });

    Stencil.addAttribute({
        name: "each",
        onRender: function(attribute, model, node, scratchpad, stencil) {
            
            // If the current each is being processed,
            // exit right away:
            if (node.eaching) {
                return;
            }

            try {
                node.eaching = true;

                var output = [];

                for (let i = 0; i < attribute.value.length; i ++) {
                    output.push(stencil.renderElement(attribute.value[i], node, scratchpad));
                }
            }
            
            finally {
                node.eaching = false;
            }

            return output.join("");
        }
    });

};