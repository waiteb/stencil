/* jshint node: true, esversion: 6, undef: true, unused: true */
module.exports = {

    scope: {
        onRender: function(attribute, model, node, stencil, scratchpad) {
            scratchpad.model = attribute.value;
        }
    },


    // If: <div if="value"></div>
    if: {
        onRender: function(attribute, model, node, stencil, scratchpad) {

            // Make a note of the state of this "if" attribute.
            // This overwrites any previous "if", thus creating a new 
            // if/elseif/else chain:
            scratchpad.parent.element.if = attribute.value;

            // If the attribute is falsey, don't render the element:
            if (!attribute.value) {
                return "";
            }
        }
    },


    // ElseIf: <div if="value"></div><div elseif="anotherValue"></div>
    elseif: {
        onRender: function(attribute, model, node, stencil, scratchpad) {

            // If a previous if/elseif/else value was truthy, or
            // if this attribute's value is falsey, do not render the element:
            if (scratchpad.parent.element.if || !attribute.value) {
                return "";
            }

            // Make a note of the state of this if attribute scratchpad:
            scratchpad.parent.element.if = scratchpad.parent.element.if || attribute.value;
        }
    },


    // Else: <div if="value"></div><div elseif="anotherValue"></div><div else></div>
    else: {
        escapeExpressions: true,
        onRender: function(attribute, model, node, stencil, scratchpad) {

            // Don't render this element if another if/elseif/else was truthy:
            if (scratchpad.parent.element.if) {
                return "";
            }

            // Mark the if as handled:
            scratchpad.parent.element.if = true;
        }
    },


    // Each: <ul><li each="items as item">{{item.value}}<li></ul>
    each: {
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
            array.forEach(function(value, index) {
                scratchpad.model = value;
                scratchpad.scope.index = index;
                output.push(stencil.renderElement(scratchpad)); 
            });
            
            // Since we're done iterating, remove this node from this list of inprocess items:
            delete scratchpad.scope.each;

            return output.join("");
        }
    }
};