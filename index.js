var Stencil = require("./lib/stencil.js");

// Add all of the defaults:
// TODO: We need a better way of adding the default plugins.  Adding all of them
// is too much when you need a logicless implementation, but not including enough
// will make the default use case (is there a default?) too bulky.
Stencil.defaultExpressions = require("./lib/stencil.expressions.js");
Stencil.defaultAttributes = require("./lib/stencil.attributes.js");
Stencil.defaultElements = require("./lib/stencil.elements.js");
Stencil.defaultSubstencils = {
    error: new Stencil('<!-- {{@error.title}}: {{@error.detail}} -->')
};

module.exports = Stencil;