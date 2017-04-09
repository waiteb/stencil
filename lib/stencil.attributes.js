/* jshint esversion: 6 */
module.exports = function(Stencil) {

    // If: <div if="value"></div>
    Stencil.addAttribute({
        name: "if",
        onRender: function(attribute) {
            if (!attribute.value) {
                return "";
            }
        }
    });

    // Each: <ul><li each="items as item">{{item.value}}<li></ul>
    Stencil.addAttribute({
        name: "each",
        onRender: function(attribute, model, node, stencil, scratchpad) {
            
            // If the current each is being processed, exit right away:
            if (scratchpad.scope.each === node) {
                return;
            }
            
            // Mark the node as being in process:
            scratchpad.scope.each = node;
            
            // Convert the attribute value into 
            // an array if it isn't one already:
            let array = attribute.value.forEach ? attribute.value : [];
            
            // Render the node once per item in the array:
            let output = [];
            array.forEach(function(value) {
                output.push(stencil.renderElement(value, node, scratchpad)); 
            });
            
            // Since we're done iterating, remove this node from this list of inprocess items:
            delete scratchpad.scope.each;

            return output.join("");
        }
    });
};