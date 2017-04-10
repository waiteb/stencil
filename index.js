var Stencil = require("./lib/stencil.js");

// Add all of the default expressions:
Stencil.defaultExpressions = require("./lib/stencil.expressions.js");
Stencil.defaultAttributes = require("./lib/stencil.attributes.js");

module.exports = Stencil;

