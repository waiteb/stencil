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
        onRender: function(attribute, model, node, stencil) {
            
            // If the current each is being processed, exit right away:
            if (node.eaching) {
                return;
            }
            
            // Mark the node as being in process:
            node.eaching = true;
            
            // Render the node once per item in the array:
            let output = [];
            attribute.value.forEach(function(value) {
                output.push(stencil.renderElement(value, node)); 
            });
            
            return output.join("");
        }
    });
};