/* jshint esversion: 6 */
var jsep = require("jsep");
var Scratchpad = require("./scratchpad.js");

/**
 * @param  {string} html
 * @param  {object} settings
 */
function Stencil(htmlOrDocument, settings) {

    this.applySettings(settings);

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
 * 
 */
const DOM_JSON_SETTINGS = {
    attributes: true,
    domProperties: false,
    metadata: false
};


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


/**
 * 
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
 * 
 */
const DEFAULT_SETTINGS = Stencil.defaultSettings = {
    openExpression: "{{",
    closeExpression: "}}",
    nullTagName: "x"
};


/**
 * Creates a name for an expression that will be used as
 * the key for its entry into the Stencil.expression dictionary.
 *
 * @param  {string} type
 * @param  {string} operator
 */
Stencil.expressionNameFor = function(type, operator) {
    return type + (operator ? "(" + operator + ")" : "");
};


/**
 * Adds a custom expression that can be used in a template.
 * 
 * @param  {string} name        The name of the expression
 * @param  {string} operator    The operator that identifies the expression in a template
 * @param  {function} handler   The function that will be called when the expression is encountered
 */
Stencil.addExpression = function(name, operator, handler) {

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
    jsep.addBinaryOp(operator);

    // Give the handler a unique name, and add it to the
    // dictionary of all expressions:
    key = Stencil.expressionNameFor(name, operator);
    Stencil.expression[key] = handler;
};

// TODO: I don't like how this is being included...
Stencil.expression = {};
require("./stencil.expressions.js")(Stencil);


/**
 * Adds a custom attribute processor.
 * 
 * @param {object} attribute The attribute processor object to add
 */
Stencil.addAttribute = function(attribute) {
    Stencil.attribute[attribute.name] = attribute;
};

Stencil.attribute = {};
require("./stencil.attributes.js")(Stencil);


/**
 * @param  {object} settings The user-supplied settings that should augment the default settings.
 */
Stencil.prototype.applySettings = function(settings) {

    // Merge the default and provided settings:
    settings = Object.assign({}, Stencil.defaultSettings, settings);

    // Build the regular expression that will identify expressions in a template:
    settings.expressionSearch = new RegExp("(" + settings.openExpression + 
                                           "[^" + settings.closeExpression.charAt(0) + 
                                           "]*" + settings.closeExpression + ")");
    this.settings = settings;
};


/**
 * Compiles (or recompiles) the stencil's html into a JSON document.
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
                           
    //html = this.html.replace(/({{[^<}]*)<([^}]*}})/g, "$1&lt;$2");

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
 * 
 * @param {object} node
 */
Stencil.prototype.compileExpressions = function(node) {        
    
    // Compile any attribute that contain expressions...
    Object.keys(node.attributes || []).forEach(function(key) {
        
        var value = node.attributes[key],
            processor = Stencil.attribute[key],
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

    // ...then compile any expressions in text nodes:
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
 * Recursively renders a node by replacing expressions 
 * within it with their computed value.
 * 
 * @param {object} model The model that will be used to compute expressions.
 * @param {object} node The node to start rendering from.  If not provided, the entire document will be rendered.
 * @return {string} The rendered HTML
 */
Stencil.prototype.render = function(model, node, scratchpad) {

    var output = "",
        nodes;

    node = node || this.document;
    nodes = node.childNodes || [];       
    scratchpad = scratchpad || new Scratchpad(node);
    
    // Render each node in the document:
    nodes.forEach(function(node) {
        
        switch (node.nodeType) {

            // This should *never* be called, but just in case, 
            // let's be gracious with what we accept:
            case Stencil.NodeType.DOCUMENT: {
                output += this.render(model, node, scratchpad);
                break;
            }

            // Our parser doesn't handle doctype very well, so let's hard code it for now...
            case Stencil.NodeType.DOCUMENT_TYPE: {
                output += "<!doctype html>"; 
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
 * @param  {object} model The model that will be used to compute expressions
 * @param  {object} node The element node to render
 * @return {string} The rendered HTML
 */
Stencil.prototype.renderElement = function(model, node, scratchpad) {

    var attributeList = this.renderAttributes(model, node, scratchpad),
        attribute,
        attributes = [],
        output;

    // Add this node to the scratchpad:
    scratchpad.push(node);
            
    // Begin by rendering each attribute, and giving its 
    // processor an opportunity to do its work:
    for (let i = 0; i < attributeList.length && !output; i ++) {
        
        attribute = attributeList[i];
        
        // Render the attribute...
        if (attribute.handler.show) {
            attributes.push(attribute.name + '="' + attribute.value + '"');
        }

        // ...and give it a chance to modify the result of the rendering:
        if (attribute.handler.onRender) {
            output = attribute.handler.onRender(attribute, model, node, this, scratchpad);
        }
    }

    // If no customizations have overridden the render, do so now:
    if (output === undefined) {

        // Pad the result with a leading space if there are attributes:
        attributes = attributes.join(" ");
        if(attributes.length) {
            attributes = " " + attributes;
        }

        // Render the node's children recursively, and build the HTML tag:
        let children = this.render(model, node, scratchpad);
        output = "<" + node.tagName + attributes + ">" + children + "</" + node.tagName + ">";
    }
    
    // Restore the previous node in the scratchpad:
    scratchpad.pop();

    return output;
};


/**
 * Renders a node's attributes and sorts them in attribute processor priority.
 * 
 * @param  {object} model The model that will be used to compute expressions.
 * @param  {object} node The node containing the attributes that we want to render.
 * @return {array} A sorted array of rendered attribute objects.
 */
Stencil.prototype.renderAttributes = function(model, node, scratchpad) {

    var output = [];

    Object.keys(node.attributes).forEach(function(key) {
        
        var attribute = node.attributes[key],
            handler = Stencil.attribute[key] || {show: true, priority: Number.MAX_VALUE},
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
 * @return {string} The rendered expression.
 */
Stencil.prototype.renderExpression = function(model, expression, scratchpad) {

    var key = Stencil.expressionNameFor(expression.type, expression.operator),
        strategy = Stencil.expression[key] || function() {},
        output;
    
    // Prerender the left/right side of any binary expressions:
    expression = Object.assign({}, expression);
    expression.left = expression.left && this.renderExpression(model, expression.left);
    expression.right = expression.right && this.renderExpression(model, expression.right);

    output = strategy(model, expression, this, scratchpad);
    return output;
};


module.exports = Stencil;