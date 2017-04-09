/* jshint esversion: 6 */
var jsep = require("jsep");

const DOM_JSON_SETTINGS = {
    attributes: true,
    domProperties: false,
    metadata: false
};

jsep.addBinaryOp("&lt;");
jsep.addBinaryOp("&lt;=");
jsep.addBinaryOp("**");


/**
 * 
 */
function Stencil(html, settings) {

    if (typeof html !== "string") {
        throw new Error("The html parameter must be a string.");
    }

    this.html = html;

    this.applySettings(settings);
    
    this.compile();
}


/**
 * 
 */
const NODE_TYPE = Stencil.NodeType = {
    ELEMENT: 1,
    TEXT: 3,
    PROCESSING_INSTRUCTION: 7,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    FRAGMENT: 11,
    EXPRESSION: 256
};

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
 * 
 */
const DEFAULT_SETTINGS = Stencil.defaultSettings = {
    openExpression: "{{",
    closeExpression: "}}",
    nullTagName: "x"
};


/**
 * 
 */
Stencil.expressionNameFor = function(type, operator) {
    return type + (operator ? "(" + operator + ")" : "");
};


/**
 * 
 */
Stencil.addExpression = function(type, operator, handler) {

    var key;

    // The operator argument is optional. Shift the
    // handler over if it's not provided:
    if (typeof operator === "function") {
        handler = operator;
        operator = "";
    }
    
    // Escape <'s so the DOM parser doesn't complain:
    // TODO: We need to do better than this...
    operator = operator.replace("<", "&lt;");
    
    // Give the handler a unique name, and add it to the
    // dictionary of all expressions:
    key = Stencil.expressionNameFor(type, operator);
    Stencil.expression[key] = handler;
};

// TODO: I don't like how this is being included...
Stencil.expression = {};
require("./stencil.expressions.js")(Stencil);


/**
 * 
 */
Stencil.addAttribute = function(attribute) {
    Stencil.attribute[attribute.name] = attribute;
};

Stencil.attribute = {};
require("./stencil.attributes.js")(Stencil);


/**
 * 
 */
Stencil.prototype.applySettings = function(settings) {

    // Merge the default and provided settings:
    settings = Object.assign({}, Stencil.defaultSettings, settings);

    settings.expressionSearch = new RegExp("(" + settings.openExpression + 
                                           "[^" + settings.closeExpression.charAt(0) + 
                                           "]*" + settings.closeExpression + ")");

    settings.nullTagName = settings.nullTagName.toLowerCase();
    
    this.settings = settings;
};


/**
 * 
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
    html = this.html.replace(/({{[^<}]*)<([^}]*}})/g, "$1&lt;$2");

    // Transform the HTML into JSON:
    dom = parser.parseFromString(html, "text/html");
    document = domJSON.toJSON(dom, DOM_JSON_SETTINGS);
    
    // Compile all expressions found in text nodes and attributes:
    this.compileExpressions(document);

    this.document = document;
};


/**
 * 
 */
Stencil.prototype.compileExpressions = function(node) {        
    
    // Parse any attribute that contain expressions...
    Object.keys(node.attributes || []).forEach(function(key) {
        
        var value = node.attributes[key],
            expression = this.expressionFrom(value),
            attribute = {
                name: key,
                value: {
                    text: value,
                }
            };
        
        if (expression) {
            attribute.value.expression = expression;
        }

        // Replace the string attribute with an object:
        node.attributes[key] = attribute;

    }.bind(this));

    // ...then compile any expressions in text nodes:
    node.childNodes.forEach(function(childNode, index) {           

        // If the child node is a text element, transform it into an expression
        // node if it contains any wrapped expressions:
        if (childNode.nodeType === Stencil.NodeType.TEXT) {

            let expression = this.expressionFrom(childNode.nodeValue);
            
            if (expression) {
                node.childNodes[index] = {nodeType: Stencil.NodeType.EXPRESSION, expression: expression};
            }
        }

        // If it's not a text node, then keep going:
        else {
            this.compileExpressions(childNode);
        }

    }.bind(this));
};


/**
 * 
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
        expressionParts.forEach(function(part, index) {
            
            var isExpression = this.settings.expressionSearch.test(part);

            // Unwrap any expression syntax...
            if (isExpression) {
                part = part.replace(this.settings.openExpression, "")
                           .replace(this.settings.closeExpression, "");
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
 * 
 */
Stencil.prototype.render = function(model, optionalNode, scratchpad) {

    var output = "",
        node = optionalNode || this.document,
        nodes = node.childNodes || [];

    // Create a new scratchpad if one doesn't exist:
    scratchpad = scratchpad || {};

    nodes.forEach(function(node) {
        
        switch (node.nodeType) {

            case Stencil.NodeType.DOCUMENT: {
                output += this.render(model, node, scratchpad);
                break;
            }

            case Stencil.NodeType.DOCUMENT_TYPE: {
                output += "<!doctype html>"; // Our parser doesn't handle doctype very well, so let's hard code it for now...
                break;
            }
            
            case Stencil.NodeType.ELEMENT: {
                output += this.renderElement(model, node, scratchpad);
                break;
            }

            case Stencil.NodeType.TEXT: {
                output += node.nodeValue;
                break;
            }
            
            case Stencil.NodeType.EXPRESSION: {

                let expression = this.renderExpression(model, node.expression, scratchpad);

                // Undefined or null values should be converted to an empty string:
                if (expression === undefined || expression === null) {
                    expression = "";
                }

                output += expression;
                break;
            }
        }

    }.bind(this));

    return output;
};


/**
 * 
 */
Stencil.prototype.renderElement = function(model, node, scratchpad) {

    var attributeList = this.processAttributes(model, node),
        attribute,
        attributes = [],
        output;
        
        
    while (attributeList.length && !output) {
        
        attribute = attributeList.shift();
        
        // Render the attribute...
        if (attribute.handler.show) {
            attributes.push(attribute.name + '="' + attribute.value + '"');
        }

        // ...and give it a chance to modify the result of the rendering:
        if (attribute.handler.onRender) {
            output = attribute.handler.onRender(attribute, model, node, scratchpad, this);
        }
    }

    // Pad the result with a leading space if there are attributes:
    if(attributes.length) {
        attributes.unshift("");
    }
    attributes = attributes.join(" ");

    // If no customizations have overridden the render, do so now:
    if (output === undefined) {
        let children = this.render(model, node);
        output = "<" + node.tagName + attributes + ">" + children + "</" + node.tagName + ">";
    }

    return output;
};


/**
 * 
 */
Stencil.prototype.processAttributes = function(model, node) {

    var output = [];

    Object.keys(node.attributes).forEach(function(key) {
        
        var attribute = node.attributes[key],
            handler = Stencil.attribute[key] || {show: true, order: Number.MAX_VALUE},
            value;
        
        // Render any attribute expressions:
        if (attribute.value.expression) {
            value = this.renderExpression(model, attribute.value.expression);
        }
        else {
            value = attribute.value.text;
        }

        output.push({
            name: key,
            value: value,
            handler: handler
        });

    }.bind(this));

    output = output.sort(function(a, b) {
        return a.handler.order - b.handler.order;
    });

    return output;
};


/**
 * 
 */
Stencil.prototype.renderExpression = function(model, expression) {

    var key = Stencil.expressionNameFor(expression.type, expression.operator),
        strategy = Stencil.expression[key] || function() {},
        output;
    
    // Prerender the left/right side of any binary expressions:
    expression = Object.assign({}, expression);
    expression.left = expression.left && this.renderExpression(model, expression.left);
    expression.right = expression.right && this.renderExpression(model, expression.right);

    output = strategy(model, expression, this);
    return output;
};


module.exports = Stencil;