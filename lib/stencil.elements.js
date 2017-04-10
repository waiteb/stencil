/* jshint node: true, esversion: 6, undef: true, unused: true */
module.exports = {

    x: {
        onRender: function(model, node, stencil, scratchpad) {

            // Render the children of this node instead of the node itself:
            return stencil.renderChildren(model, node, scratchpad);
        } 
    },

    stencil: {
        onRender: function(model, node, stencil, scratchpad) {

            var name = scratchpad.element.attributes.name.value,
                substencil = stencil.substencils[name],
                output;
            
            // If we didn't find a substencil, it may be inherited:
            while(!substencil && stencil.parent) {
                stencil = stencil.parent;
                substencil = stencil.substencils[name];
            }

            // If we still didn't find one, use the missing template:
            if (!substencil) {
                substencil = stencil.substencils.undefined;
                model = {name: name};
            }

            // Since we're replacing an element in the stack, we need 
            // to get rid of the current state so we don't double up:
            scratchpad.pop();

            output = substencil.renderChildren(model, substencil.document, scratchpad);

            // Before we return, we should return 
            // the stack to the way we found it:
            scratchpad.push(node);

            return output;
        }
    }
};