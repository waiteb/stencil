var Stencil = require("./lib/stencil.js");

// Add all of the default expressions:
Stencil.defaultExpressions = require("./lib/stencil.expressions.js");
Stencil.defaultAttributes = require("./lib/stencil.attributes.js");
Stencil.defaultElements = require("./lib/stencil.elements.js");
Stencil.defaultSubstencils = {
    undefined: new Stencil('<!-- missing substencil: {{name}} -->')
};

module.exports = Stencil;