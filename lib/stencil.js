/* jshint node: true, esversion: 6, undef: true, unused: true */
var Scratchpad = require("./scratchpad.js");
var jsep = require("jsep");

/**
 * @param  {string|object} htmlOrDocument  Either an HTML string, or a previously compiled document.
 * @param  {object} settings An object containing the custom expressions, attributes, etc. to use when rendering.
 */
function Stencil(htmlOrDocument, settings) {

    applySettings(this, settings);

    this.expressions = {};
    this.attributes = {};
    this.elements = {};
    this.filters = {};
    this.substencils = {};

    // Combine the global default settings with the instance settings:
    this.expressions = Object.assign({}, prepareExpressions(Stencil.defaultExpressions), prepareExpressions(this.settings.expressions));
    this.attributes = Object.assign({}, Stencil.defaultAttributes, this.settings.attributes);
    this.elements = Object.assign({}, Stencil.defaultElements, this.settings.elements);
    this.filters = Object.assign({}, Stencil.defaultFilters, this.settings.filters);
    this.globals = Object.assign(Stencil.defaultGlobals, this.settings.globals);
    this.include(Stencil.defaultSubstencils);

    // If we've been given a pre-compiled template, use it:
    if (typeof htmlOrDocument === "object" && htmlOrDocument.nodeType !== undefined) {
        this.document = htmlOrDocument;
        this.html = null;
    }

    // Otherwise, compile the html:
    else if (typeof htmlOrDocument === "string") {
        this.html = htmlOrDocument;
        this.compile();
    }
    
    // Otherwise, throw an error:
    else {
        throw new Error("A stencil must be contructed with either an HTML string, or a previously compiled document.");
    }    
}


/**
 * Default stencil customizations
 */
Stencil.defaultExpressions = {};
Stencil.defaultAttributes = {};
Stencil.defaultElements = {};
Stencil.defaultFilters = {};
Stencil.defaultGlobals = {};
Stencil.defaultSubstencils = {};

const SINGLE_QUOTE = "&#39;";


/**
 * Settings used when parsing a DOM
 * @private
 */
const DOM_PARSER_SETTINGS = {
    errorHandler:{
        warning: function(){},
    }
};


/**
 * Settings used when parsing HTML
 * @private
 */
const DOM_JSON_SETTINGS = {
    attributes: true,
    domProperties: false,
    metadata: false
};


/**
 * HTML node types
 * 
 * @public
 */
const NODE_TYPE = Stencil.NodeType = { // jshint unused: false
    ELEMENT: 1,
    TEXT: 3,
    PROCESSING_INSTRUCTION: 7,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    FRAGMENT: 11,
    EXPRESSION: 256
};


/**
 * Expression types
 * 
 * @public
 */
const EXPRESSION_TYPE = Stencil.ExpressionType = {
    THIS: "ThisExpression",
    LITERAL: "Literal",
    ARRAY: "ArrayExpression",
    IDENTIFIER: "Identifier",
    COMPOUND: "Compound",
    CONDITIONAL: "ConditionalExpression",
    LOGICAL: "LogicalExpression",
    MEMBER: "MemberExpression",
    UNARY: "UnaryExpression",
    BINARY: "BinaryExpression"
};


/**
 * Default settings for a stencil.  These can be modified
 * if you want all stencils to have the same settings.
 * 
 * @public
 */
const DEFAULT_SETTINGS = Stencil.defaultSettings = {
    expressions: {},
    attributes: {},
    elements: {},
    openExpression: "{{",
    closeExpression: "}}"
};


/**
 * Creates a name for an expression that will be used as
 * the key for its entry into the expression dictionary.
 *
 * @private
 * @param  {string} type The expression type
 * @param  {string} operator An operator, if expression type alone won't be unique
 * @return {string} The computed name
 */
function expressionNameFor(type, operator) {
    return type + (operator ? "(" + operator + ")" : "");
}


/**
 * Expressions need very specific names so they can be found when rendering.
 * This method adds expressions to the stencil in the correct format.
 * 
 * @private
 */
function prepareExpressions(expressions) {

    var output = {};

    Object.keys(expressions).forEach(function (key) {

        var expression = expressions[key],
            operator = expression.operator || "";
            
        // Escape <'s so the DOM parser doesn't complain:
        // TODO: We need to do better than this...
        operator = operator.replace("<", "&lt;");   
        
        // If we're adding an operator, be sure that the expression
        // parser knows about it:
        if (expression.type === Stencil.ExpressionType.UNARY) {
            jsep.addUnaryOp(operator, expression.precedence);
        }
        if (expression.type === Stencil.ExpressionType.BINARY) {
            jsep.addBinaryOp(operator, expression.precedence);
        }

        // Give the handler a unique name, and add it to the
        // dictionary of all expressions:
        key = expressionNameFor(expression.type, operator);
        output[key] = expression;
    });

    return output;
}


/**
 * Adds settings to a stencil, along with any default settings.
 * 
 * @param  {object} settings The user-supplied settings that should augment the default settings.
 * @private
 */
function applySettings(stencil, settings) {

    // Merge the default and provided settings:
    settings = Object.assign({}, Stencil.defaultSettings, settings);

    // Build the regular expression that will identify expressions in a template:
    settings.expressionSearch = new RegExp("(" + settings.openExpression + 
                                           "[^" + settings.closeExpression.charAt(0) + 
                                           "]*" + settings.closeExpression + ")");
    stencil.settings = settings;
}


/**
 * Includes a substencil.
 * 
 * @param  {name} name The name used to identify the substencil
 * @param  {html|object} substencil The html, or stencil
 * @public
 */
Stencil.prototype.include = function(substencils) {
    
    Object.keys(substencils).forEach(function(key) {

        var substencil = substencils[key];
        this.substencils[key] = substencil;

    }.bind(this));
};


/**
 * Compiles (or recompiles) the stencil's html into a JSON document.
 * @public
 */
Stencil.prototype.compile = function() {

    var DOMParser = require("xmldom").DOMParser,
        domJSON = require("./domJSON.js"),
        parser = new DOMParser(DOM_PARSER_SETTINGS),
        html,
        dom,
        document;
        
    // Escape HTML entities in expressions:
    // TODO: We need to do this better:
    let ltSearch = new RegExp("(" + this.settings.openExpression + 
                              "[^<" + this.settings.closeExpression.charAt(0) + 
                              "]*)<([^" + this.settings.closeExpression.charAt(0) + 
                              "]*" + this.settings.closeExpression + ")", "g");
                              
    html = this.html.replace(ltSearch, "$1&lt;$2");
                           
    // Transform the HTML into JSON:
    // TODO: XMLDom isn't going to cut it.  It's too agressive 
    //       with whitespace and attribute normalization.
    dom = parser.parseFromString(html, "text/html");
    document = domJSON.toJSON(dom, DOM_JSON_SETTINGS);
    
    // Compile all expressions found in text nodes and attributes:
    this.compileExpressions(document);

    this.document = document;
};


/**
 * Compiles expressions found in text elements and attributes.
 * This changes the nodeType to "expression".
 * 
 * @param {object} node A text or comment node to compile.
 * @public
 */
Stencil.prototype.compileExpressions = function(node) {

    var prerenderAttributes;

    this.compileAttributeExpressions(node);
    this.compileElementExpressions(node);

    // If there are no attribute plugins, and the attributes are 
    // all literals, then we can prerender them:
    prerenderAttributes = !node.attributePlugins.length &&
                          (!node.attributesExpression || 
                          node.attributesExpression.type === EXPRESSION_TYPE.LITERAL);

    // If both the node's attributes and its body are plain text, 
    // then we can pre-render the node:
    if (node.prerendered && prerenderAttributes) {

        let stencil = new Stencil({
            nodeType: NODE_TYPE.DOCUMENT,
            childNodes: [node]
        });

        node.nodeValue = stencil.render();
        node.nodeType = NODE_TYPE.TEXT;
        delete node.tagName;
        delete node.attributesExpression;
    }
};


/**
 * Compiles any expressions found in attributes.
 * 
 * @param  {object} node The node containing the attributes to compile
 * @public
 */
Stencil.prototype.compileAttributeExpressions = function(node) {

    var renderableAttributes = [];

    node.attributePlugins = [];

    // Compile each attribute:
    let allAttributes = Object.keys(node.attributes || []);
    for(let i = 0, length = allAttributes.length; i < length; i++) {

        // Build an attribute object:
        let key = allAttributes[i],
            value = node.attributes[key],
            include = true,
            plugin = this.attributes[key],
            attribute = {
                name: key,
                raw: value,
                expression: false
            };

        if (plugin) {

            // Transform the raw attribute value into an expression:
            if (plugin && plugin.escapeExpressions) {
                attribute.expression = this.expressionFrom(attribute.raw);
            }
            else {
                attribute.expression = jsep(attribute.raw);
                attribute.raw = "{{" + attribute.raw + "}}";
            }

            // Remove the attribute from the node if it shouldn't be rendered:
            if (!plugin.show) {
                include = false;
            }

            // Finally, add the plugin to the list:
            node.attributePlugins.push(attribute);
        }
        else {
            attribute.expression = this.expressionFrom(attribute.raw);
        }

        // If the attribute should be rendered, include it in the output:
        if (include) {
            renderableAttributes.push(attribute.name + '="' + attribute.raw + '"');
        }

        node.attributes[key] = attribute;
    }

    // Sort the plugins by priority:
    node.attributePlugins = node.attributePlugins.sort(function(a, b) {
        return this.attributes[a.name].priority - this.attributes[b.name].priority;
    }.bind(this));

    // Transform any remaining attributes into a single expression:
    renderableAttributes = renderableAttributes.join(" ");
    if (renderableAttributes) {
        node.attributesExpression = this.expressionFrom(renderableAttributes);
    }
};


/**
 * Compiles any expressions in text nodes.
 * 
 * @param  {object} node The node containing the elements to compile
 * @public
 */
Stencil.prototype.compileElementExpressions = function(node) {
    
    // Let's assume that we can prerender 
    // this node until we learn otherwise:
    var prerendered = true;

    for (let i = 0, length = node.childNodes.length; i < length; i++) {
    
        let childNode = node.childNodes[i];

        // If the child node is a text element, transform it into an expression
        // node when it contains any wrapped expressions:
        if (childNode.nodeType === Stencil.NodeType.TEXT) {

            let expression = this.expressionFrom(childNode.nodeValue);
            
            // If the text node contained an expression, transform 
            // the node from a text node to an expression node:
            if (expression) {
                node.childNodes[i] = {nodeType: Stencil.NodeType.EXPRESSION, expression: expression};
                prerendered = false;
            }
        }

        // To keep things simple, treat comment nodes like expressions:
        else if (childNode.nodeType === Stencil.NodeType.COMMENT) {

            let expression = this.expressionFrom("<!--" + childNode.nodeValue + "-->");
            node.childNodes[i] = {nodeType: Stencil.NodeType.EXPRESSION, expression: expression};
            prerendered = false;
        }

        // If it's not a text node, then look for more 
        // expressions further down the documnet:
        else {
            this.compileExpressions(childNode);
            prerendered = childNode.prerendered && prerendered;
        }
    }

    // If the node doesn't have a plugin, and only contains 
    // nodes that are prerendered, then we can prerender it:
    node.prerendered = node.nodeType !== NODE_TYPE.DOCUMENT &&
                       !this.elements[node.tagName] && 
                       prerendered;
};


/**
 * Looks for expressions in a string.
 * 
 * @param {string} text We'll check for expressions in this string.
 * @returns {object} When expressions are found.
 * @returns {undefined} When no expressions are found.
 * @public
 */
Stencil.prototype.expressionFrom = function(text) {

    var result;

    text = text || "";

    // If the text contains expression syntax, we need to transform it into
    // an expression.  To do this, we'll remomve the expression delimiters, 
    // and convert the string portions of the text into literals.
    // The result is a compound expression that we can easily render:
    let expressionParts = text.split(this.settings.expressionSearch),
        newParts = [],
        delimiter = "";

    // Transform the text into a single expression:
    for (let i = 0, length = expressionParts.length; i < length; i++) {
    
        let part = expressionParts[i],
            isExpression = this.settings.expressionSearch.test(part);

        // Unwrap any expression syntax...
        if (isExpression) {
            part = part.replace(new RegExp(this.settings.openExpression), "")
                       .replace(new RegExp(this.settings.closeExpression), "");
        }

        // ...and turn raw text into an escaped string literal:
        else if (part.length) {                    
           part = "'" + part.replace(/'/g, SINGLE_QUOTE) + "'";
        }

        // Store the new element back into the array:
        if (part.length) {
            newParts.push(part);
        }
    }

    // Replace the old text node with the new text/expression nodes:
    newParts = newParts.join("");
    result = jsep(newParts);

    return result;
};


/**
 * Recursively renders the children of node by replacing expressions 
 * within it with their computed value.
 * 
 * @param {object} model The model that will be used to compute expressions.
 * @param {object} node The node to start rendering from.  If not provided, the entire document will be rendered.
 * @return {string} The rendered HTML
 * @public
 */
Stencil.prototype.render = function(model, node) {
    
    var scratchpad;
    
    scratchpad = new Scratchpad(this.globals);
    scratchpad.push(this.document, model, this);
    
    return this.renderChildren(scratchpad);
};


/**
 * Recursively renders the children of node by replacing expressions 
 * within it with their computed value.
 * 
 * @param  {Scratchpad} scratchpad The current scratchpad
 * @return {string} The rendered HTML
 * @public
 */
Stencil.prototype.renderChildren = function(scratchpad) {

    var output = "",
        model = scratchpad.model,
        node = scratchpad.node,
        attributes = node.attributes || {},
        nodes = node.childNodes || [];

    // Render each node in the document:
    for(let i = 0, length = nodes.length; i < length; i++) {
        
        // Stop execution if we encounter a debug attribute (like so, <div debug>):
        if(attributes.debug) {(function() {debugger}());} // jshint ignore: line

        node = nodes[i];
        switch (node.nodeType) {

            case Stencil.NodeType.DOCUMENT: {
                output += this.renderChildren(scratchpad);
                break;
            }

            // Our parser doesn't handle doctype very well, so let's hard code it for now...
            case Stencil.NodeType.DOCUMENT_TYPE: {
                output += "<!doctype html>"; 
                break;
            }
            
            case Stencil.NodeType.ELEMENT: {
                scratchpad.push(node, model, this);
                output += this.renderElement(scratchpad);
                scratchpad.pop();
                break;
            }
            
            case Stencil.NodeType.COMMENT:
            case Stencil.NodeType.TEXT: {
                output += node.nodeValue;
                break;
            }
            
            case Stencil.NodeType.EXPRESSION: {

                let expression = this.renderExpression(model, node.expression, scratchpad);

                // If the expression is undefined or null, use an empty string instead:
                if (expression === undefined || expression === null) {
                    expression = "";
                }

                output += expression;
                break;
            }
        }
    }

    // All done!
    return output;
};


/**
 * Renders a element node.
 * 
 * @param  {Scratchpad} scratchpad The current scratchpad
 * @return {string} The rendered HTML
 * @public
 */
Stencil.prototype.renderElement = function(scratchpad) {

    var model = scratchpad.model,
        node = scratchpad.node,
        element = this.elements[node.tagName],
        output;
            
    // Begin by rendering each attribute, and giving its 
    // processor an opportunity to do its work:
    for (let i = 0, length = node.attributePlugins.length; i < length && !output; i ++) {

        let attribute = node.attributePlugins[i],
            plugin = this.attributes[attribute.name],
            value = this.renderExpression(scratchpad.model, attribute.expression);

        output = plugin.onRenderAttribute(value, model, node, this, scratchpad);
    }

    // Give custom elements a chance to customize rendering:
    if (output === undefined && element) {
        output = element.onRenderElement(scratchpad, this);
    }

    // If no customizations have overridden the render, do so now:
    if (output === undefined) {

        let attributes = this.renderExpression(scratchpad.model, node.attributesExpression);
        attributes = attributes  ? " " + attributes : "";

        // Render the node's children recursively, and build the HTML tag:
        let children = this.renderChildren(scratchpad);
        output = "<" + node.tagName + attributes + ">" + children + "</" + node.tagName + ">";
    }
    
    return output;
};


/**
 * Renders an expression. 
 * 
 * The work for computing the expression is delegated to custom expression 
 * plug-ins that need to be added via Stencil.addExpression.
 * 
 * @param  {object} model The model that will be used to compute expressions.
 * @param  {object} expression The expression to compute.
 * @param  {object} scratchpad The current scratchpad
 * @return {string} The rendered expression.
 * @public
 */
Stencil.prototype.renderExpression = function(model, expression, scratchpad) {

    if (!expression) return;

    var key = expressionNameFor(expression.type, expression.operator),
        strategy = this.expressions[key],
        output;
    
    // Prerender the left/right side of any binary/logical expressions:
    if (expression.type === Stencil.ExpressionType.BINARY || expression.type === Stencil.ExpressionType.LOGICAL) {
        
        // We don't want to mutate the compiled expression, so create a new object
        // so we can keep it from changing:
        expression = Object.assign({}, expression);

        // We usually want to compile the left/right side of the expression, but some expressions
        // only need one side or the other compiled.  For example, with {{value as alias}} we
        // want the value to be rendered, but expect alias to be treated as a literal:
        if (strategy.renderLeft === undefined || strategy.renderLeft) {
            expression.left = expression.left && this.renderExpression(model, expression.left);
        }
        if (strategy.renderRight === undefined || strategy.renderRight) {
            expression.right = expression.right && this.renderExpression(model, expression.right);
        }
    }

    output = strategy.onRender(model, expression, this, scratchpad);
    return output;
};


/**
 * Branch replaces the current node with a new one. 
 * 
 * @param  {Stencil} stencil The stencil that will replace the current one
 * @param  {Scratchpad} scratchpad The current state of the rendering process
 * @public
 */
Stencil.prototype.branch = function(stencil, scratchpad) {

    var output,
        node;

    // We aren't going to render the current item, 
    // so we need to get rid of it:
    node = scratchpad.pop();
    
    // Render the branch:
    scratchpad.node = stencil.document;
    output = stencil.renderChildren(scratchpad);

    // Before we return, we should return 
    // the stack to the way we found it:
    scratchpad.push(node, scratchpad.model, stencil);

    return output;
};


module.exports = Stencil;