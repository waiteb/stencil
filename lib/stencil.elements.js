module.exports = function(Stencil) {

    Stencil.addElement({
    tagName: "x",
        onRender: function(model, node, stencil, scratchpad) {
            return stencil.render(model, node, scratchpad);
        } 
    });

};