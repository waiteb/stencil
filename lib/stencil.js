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

    // If we've been given a pre-compiled template, use it:
    if (typeof htmlOrDocument === "object" && htmlOrDocument.nodeType !== undefined) {
        this.document = htmlOrDocument;
        this.html = null;
    }

    // Otherwise, compile the html:
    else if (typeof htmlOrDocument === "string") {
        this.html = htmlOrDocument;
    }
    
    // Otherwise, throw an error:
    else {
        throw new Error("A stencil must be contructed with either an HTML string, or a previously compiled document.");
    }

    // Combine the global default settings with the instance settings:
    this.expressions = Object.assign({}, prepareExpressions(Stencil.defaultExpressions), prepareExpressions(this.settings.expressions));
    this.attributes = Object.assign({}, Stencil.defaultAttributes, this.settings.attributes);
    this.elements = Object.assign({}, Stencil.defaultElements, this.settings.elements);
    this.filters = Object.assign({}, Stencil.defaultFilters, this.settings.filters);
    this.globals = Object.assign(Stencil.defaultGlobals, this.settings.globals);
    this.include(Stencil.defaultSubstencils);

    // Finally, compile the stencil:
    this.compile();
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
        parser = new DOMParser(),
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
    this.compileAttributeExpressions(node);
    this.compileElementExpressions(node);
};


/**
 * Compiles any expressions found in attributes.
 * 
 * @param  {object} node The node containing the attributes to compile
 * @public
 */
Stencil.prototype.compileAttributeExpressions = function(node) {
    
    Object.keys(node.attributes || []).forEach(function(key) {
        
        var value = node.attributes[key],
            processor = this.attributes[key],
            expression,
            attribute;
            
        // Transform the attribute from a key/value pair to a full object:
        attribute  = {
            name: key,
            value: {text: value}
        };
        
        // If the value contains escaped expressions, or the attribute has a 
        // processor that doesn't escape expressions, use the raw value as an expression:
        expression = this.expressionFrom(value) || processor && !processor.escapeExpressions && jsep(value);
        if (expression) {
            attribute.value.expression = expression;
        }

        // Replace the string attribute with an object:
        node.attributes[key] = attribute;

    }.bind(this));
};


/**
 * Compiles any expressions in text nodes.
 * 
 * @param  {object} node The node containing the elements to compile
 * @public
 */
Stencil.prototype.compileElementExpressions = function(node) {
    
    node.childNodes.forEach(function(childNode, index) {           

        // If the child node is a text element, transform it into an expression
        // node when it contains any wrapped expressions:
        if (childNode.nodeType === Stencil.NodeType.TEXT) {

            let expression = this.expressionFrom(childNode.nodeValue);
            
            // If the text node contained an expression, transform 
            // the node from a text node to an expression node:
            if (expression) {
                node.childNodes[index] = {nodeType: Stencil.NodeType.EXPRESSION, expression: expression};
            }
        }

        // To keep things simple, treat comment nodes like expressions:
        else if (childNode.nodeType === Stencil.NodeType.COMMENT) {

            let expression = this.expressionFrom("<!--" + childNode.nodeValue + "-->");
            node.childNodes[index] = {nodeType: Stencil.NodeType.EXPRESSION, expression: expression};
        }

        // If it's not a text node, then look for more 
        // expressions further down the documnet:
        else {
            this.compileExpressions(childNode);
        }

    }.bind(this));
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

    var itContainsExpressions = this.settings.expressionSearch.test(text),
        result;

    // If the text contains expression syntax, we need to transform it into
    // an expression.  To do this, we'll remomve the expression delimiters, 
    // and convert the string portions of the text into literals.
    // The result is a compound expression that we can easily render:
    if (itContainsExpressions) {

        let expressionParts = text.split(this.settings.expressionSearch),
            newParts = [];

        // Transform the text into a single expression:
        expressionParts.forEach(function(part) {
            
            var isExpression = this.settings.expressionSearch.test(part);

            // Unwrap any expression syntax...
            if (isExpression) {
                part = part.replace(new RegExp(this.settings.openExpression), "")
                           .replace(new RegExp(this.settings.closeExpression), "");
            }

            // ...and turn raw text into an escaped string literal:
            else if (part.length) {                    
                part = "'" + part.replace("'", "\\'").trim() + "'";
            }

            // Store the new element back into the array:
            if (part.length) {
                newParts.push(part);
            }

        }.bind(this));

        // Replace the old text node with the new text/expression nodes:
        newParts = newParts.join("");
        result = jsep(newParts);
    }

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
    
    var initialScope = Object.create(this.globals),
        scratchpad;
    
    scratchpad = new Scratchpad(node || this.document, initialScope, this);
    scratchpad.model = model;
    
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
    nodes.forEach(function(node) {
        
        if(attributes.debug) {debugger;} // jshint ignore: line

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
                scratchpad.push(node, this);
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

    }.bind(this));

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
        attributeList = this.prepareAttributes(scratchpad),
        attribute,
        attributes = [],
        element = this.elements[node.tagName],
        output;

    // Add this node to the scratchpad:
    scratchpad.element.attributes = attributeList;
            
    // Begin by rendering each attribute, and giving its 
    // processor an opportunity to do its work:
    for (let i = 0; i < attributeList.length && !output; i ++) {
        
        attribute = attributeList[i];
        
        // Render the attribute...
        if (attribute.handler.show) {
            attributes.push(attribute.name + '="' + attribute.value + '"');
        }

        // ...and give it a chance to modify the result of the rendering:
        if (attribute.handler.onRenderAttribute) {
            output = attribute.handler.onRenderAttribute(attribute, model, node, this, scratchpad);
        }
    }

    // Give custom elements a chance to customize rendering:
    if (output === undefined && element) {
        output = element.onRenderElement(scratchpad, this);
    }

    // If no customizations have overridden the render, do so now:
    if (output === undefined) {

        // Pad the result with a leading space if there are attributes:
        attributes = attributes.join(" ");
        if(attributes.length) {
            attributes = " " + attributes;
        }

        // Render the node's children recursively, and build the HTML tag:
        let children = this.renderChildren(scratchpad);
        output = "<" + node.tagName + attributes + ">" + children + "</" + node.tagName + ">";
    }
    
    return output;
};


/**
 * Renders a node's attributes and sorts them in attribute processor priority.
 * 
 * @param  {Scratchpad} scratchpad The current scratchpad
 * @return {array} A sorted array of rendered attribute objects.
 * @public
 */
Stencil.prototype.prepareAttributes = function(scratchpad) {

    var model = scratchpad.model,
        node = scratchpad.node,
        output = [];

    Object.keys(node.attributes).forEach(function(key) {
        
        var attribute = node.attributes[key],
            handler = this.attributes[key] || {show: true, priority: Number.MAX_VALUE},
            value;
        
        // Render any attribute expressions:
        if (attribute.value.expression) {
            value = this.renderExpression(model, attribute.value.expression, scratchpad);
        }
        else {
            value = attribute.value.text;
        }

        // Add the rendered attribute, plus a reference to its processor to the output:
        output.push({
            name: key,
            value: value,
            handler: handler // I do not like the name handler...
        });

    }.bind(this));

    // Sort the attributes in order of their handler's priority:
    output = output.sort(function(a, b) {
        return a.handler.priority - b.handler.priority;
    });

    // Finally, cache the attributes as named 
    // properties of the array for easy lookup:
    for(let i=0; i < output.length; i++) {
        let attribute = output[i];
        if (attribute.name) {
            output[attribute.name] = attribute;
        }
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
    scratchpad.push(node, stencil);

    return output;
};


module.exports = Stencil;