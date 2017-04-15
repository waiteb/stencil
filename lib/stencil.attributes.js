/* jshint node: true, esversion: 6, undef: true, unused: true */
var Plugin = require("./stencil.plugin.js");


var scopePlugin = new Plugin("scope");
scopePlugin.onRenderAttribute = function(value, model, node, stencil, scratchpad) {
    scratchpad.model = value;
};


var ifPlugin = new Plugin("if");
ifPlugin.onRenderAttribute =  function(value, model, node, stencil, scratchpad) {

    // Make a note of the state of this "if" attribute.
    // This overwrites any previous "if", thus creating a new 
    // if/elseif/else chain:
    scratchpad.parent.if = value;

    // If the attribute is falsey, don't render the element:
    if (!value) {
        return "";
    }
};


var elseIfPlugin = new Plugin("elseif");
elseIfPlugin.onRenderAttribute =  function(value, model, node, stencil, scratchpad) {

    var output;

    // If a previous if/elseif/else value was truthy, or
    // if this attribute's value is falsey, do not render the element:
    if (scratchpad.parent.if || !value) {
        output = "";
    }

    // Make a note of the state of this if attribute scratchpad:
    scratchpad.parent.if = scratchpad.parent.if || value;

    return output;
};


var elsePlugin = new Plugin("else");
elsePlugin.onRenderAttribute = function(value, model, node, stencil, scratchpad) {

    // Don't render this element if another if/elseif/else was truthy:
    if (scratchpad.parent.if) {
        return "";
    }

    // Mark the if as handled:
    scratchpad.parent.if = true;
};


var eachPlugin = new Plugin("each");
eachPlugin.onRenderAttribute = function(value, model, node, stencil, scratchpad) {

    // If the current each is being processed, exit right away:
    if (scratchpad.scope.each === node) {
        return;
    }

    // Create a new scope, and mark the 
    // node as being in process:
    scratchpad.newScope();
    scratchpad.scope.each = node;
    
    // Convert the attribute value into 
    // an array if it isn't one already:
    let array = value.forEach ? value : [];
    
    // Render the node once per item in the array:
    let output = "";
    for(let i = 0, length = array.length; i < length; i++) {
        scratchpad.model = array[i];
        scratchpad.scope.index = i;
        output += stencil.renderElement(scratchpad);
    }
    
    // Since we're done iterating, remove this node from this list of inprocess items:
    scratchpad.scope.each = undefined;

    return output;
};
    

module.exports = {
    scope: scopePlugin,
    if: ifPlugin,
    elseif: elseIfPlugin,
    else: elsePlugin,
    each: eachPlugin
};