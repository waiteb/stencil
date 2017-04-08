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
    
    var newChildren;
    
    node.childNodes.forEach(function(childNode, index) {

        var isTextNode = childNode.nodeType === Stencil.NodeType.TEXT,
            itContainsExpressions = childNode.nodeValue && this.settings.expressionSearch.test(childNode.nodeValue);

        // If the child node is a text element that contains an expression,
        // then replace the one element with a combination of text and expression nodes:
        if (isTextNode && itContainsExpressions) {

            // Split the node's text into both text and expression nodes:
            // Can we fix the regex so the blank entries don't happen?
            newChildren = childNode.nodeValue.split(this.settings.expressionSearch).filter(function(item) {
                return !!item;
            });

            // Create nodes for each of the new text/expression elements:
            newChildren.forEach(function(newChild, index) {
                
                var isExpression = this.settings.expressionSearch.test(newChild),
                    expression;

                // Create an expressions...
                if (isExpression) {
                    expression = jsep(newChild.replace(this.settings.openExpression, "")
                                              .replace(this.settings.closeExpression, ""));
                    newChild = {nodeType: Stencil.NodeType.EXPRESSION, nodeValue: newChild, expression: expression};
                }

                // ...or text node:
                else {                    
                    newChild = {nodeType: Stencil.NodeType.TEXT, nodeValue: newChild};
                }

                // Store the new element back into the array:
                newChildren[index] = newChild;

            }.bind(this));

            // Replace the old text node with the new text/expression nodes:
            node.childNodes = node.childNodes.slice(0, index)
                                             .concat(newChildren)
                                             .concat(node.childNodes.slice(index + newChildren.length));
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
Stencil.prototype.render = function(model, optionalNode) {

    var output = "",
        node = optionalNode || this.document,
        nodes = node.childNodes || [];

    nodes.forEach(function(node) {
        
        switch (node.nodeType) {

            case Stencil.NodeType.DOCUMENT: {
                output += this.render(model, node);
                break;
            }

            case Stencil.NodeType.DOCUMENT_TYPE: {
                output += "<!doctype html>"; // Our parser doesn't handle doctype very well, so let's hard code it for now...
                break;
            }
            
            case Stencil.NodeType.ELEMENT: {
                output += this.renderElement(model, node);
                break;
            }

            case Stencil.NodeType.TEXT: {
                output += node.nodeValue;
                break;
            }
            
            case Stencil.NodeType.EXPRESSION: {

                let expression = this.renderExpression(model, node.expression);

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
Stencil.prototype.renderElement = function(model, node) {

    var attributes,
        output = this.render(model, node);
        
    // Only render the start/end tag if this is NOT a null tag:
    if (node.tagName.toLowerCase() !== this.settings.nullTagName) {
        attributes = this.renderAttributes(model, node);
        output = "<" + node.tagName + attributes + ">" + output + "</" + node.tagName + ">";
    }

    return output;
};


Stencil.prototype.renderAttributes = function(mode, node) {

    var output = "";

    Object.keys(node.attributes).forEach(function(key) {
        output += key + '="' + node.attributes[key] + '" ';
    });

    if (output) {
        output = " " + output.trim();
    }

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