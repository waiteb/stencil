var Stencil = require("./lib/stencil.js");

// Add all of the default expressions:
Stencil.defaultExpressions = require("./lib/stencil.expressions.js");
Stencil.defaultAttributes = require("./lib/stencil.attributes.js");
Stencil.defaultElements = require("./lib/stencil.elements.js");
Stencil.defaultSubstencils = {
    error: new Stencil('<!-- {{@error.title}}: {{@error.detail}} -->')
};

module.exports = Stencil;