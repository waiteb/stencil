/* jshint node: true, esversion: 6, undef: true, unused: true */
var Plugin = require("./stencil.plugin.js");


/**
 * Creates a logging element of the given type
 * @param  {string} log|info|warn|error
 */
function logger(type) {
    return new Plugin(type, {
        onRenderElement: function(scratchpad, stencil) {
            var text = stencil.renderChildren(scratchpad);
            console[type](text);
            return "";
        }
    });
}


var xPlugin = new Plugin("x");
xPlugin.onRenderElement = function(scratchpad, stencil) {
    // Render the children of this node instead of the node itself:
    return stencil.renderChildren(scratchpad);
};


var stencilPlugin = new Plugin("stencil");
stencilPlugin.onRenderElement = function(scratchpad, stencil) {

    var attribute = scratchpad.node.attributes.name,
        name = stencil.renderExpression(scratchpad.model, attribute.expression),
        substencil = stencil.substencils[name],
        scope = scratchpad.parent,
        output;
    
    // If we didn't find a substencil, it may be inherited:
    while(!substencil && scope) {
        stencil = scope.stencil;
        substencil = stencil && stencil.substencils[name];
        scope = scope.parent;
    }

    // If we still didn't find one, use the missing template:
    if (!substencil) {
        substencil = stencil.substencils.error;
        scratchpad.root.error = {
            title: "missing substencil",
            detail: name
        };
    }

    // Branch over to the new substencil:
    output = stencil.branch(substencil, scratchpad);

    return output;
};


module.exports = {

    log: logger("log"),
    info: logger("info"),
    warn: logger("warn"),
    error: logger("error"),

    x: xPlugin,
    stencil: stencilPlugin
};