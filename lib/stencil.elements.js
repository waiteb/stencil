module.exports = function(Stencil) {

    Stencil.addElement({
    tagName: "x",
        onRender: function(model, node, stencil, scratchpad) {

            // Render the children of this node instead of the node itself:
            return stencil.render(model, node, scratchpad);
        } 
    });

};