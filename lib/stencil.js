/* jshint node: true, esversion: 6, undef: true, unused: true */
var Scratchpad = require("./scratchpad.js");
var jsep = require("jsep");

/**
 * @param  {string} html
 * @param  {object} settings
 */
function Stencil(htmlOrDocument, settings) {

    this.applySettings(settings);

    this.expressions = {};
    this.attributes = {};
    this.elements = {};
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

    this.addExpressions(Stencil.defaultExpressions);
    this.addAttributes(Stencil.defaultAttributes);
    this.addElements(Stencil.defaultElements);
    this.include(Stencil.defaultSubstencils);
}

/**
 * Default stencil customizations
 */
Stencil.defaultExpressions = {};
Stencil.defaultAttributes = {};
Stencil.defaultElements = {};
Stencil.defaultSubstencils = {};

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
 * Adds a custom expression that can be used in a template.
 * 
 * @param  {string} name        The name of the expression
 * @param  {string} operator    The operator that identifies the expression in a template
 * @param  {function} callback  The function that will be called when the expression is encountered
 */
Stencil.prototype.addExpressions = function(expressions) {

    Object.keys(expressions).forEach(function (key) {

        var expression = expressions[key],
            operator = expression.operator || "";
            
        // Escape <'s so the DOM parser doesn't complain:
        // TODO: We need to do better than this...
        operator = operator.replace("<", "&lt;");   
        
        // If we're adding an operator, be sure that the expression
        // parser knows about it:
        if (expression.type === Stencil.ExpressionType.UNARY) {
            jsep.addUnaryOp(operator);
        }
        if (expression.type === Stencil.ExpressionType.BINARY) {
            jsep.addBinaryOp(operator);
        }

        // Give the handler a unique name, and add it to the
        // dictionary of all expressions:
        key = expressionNameFor(expression.type, operator);
        this.expressions[key] = expression;

    }.bind(this));
};


/**
 * Adds custom attribute processors.
 * 
 * @param {object} attributes The attribute to add
 */
Stencil.prototype.addAttributes = function(attributes) {

    this.attributes = Object.assign({}, this.attributes, attributes);

    // There may be uncompipled attributes, so the document is invalid:
    this.document = undefined;
};


/**
 * Adds a custom element processor.
 * 
 * @param  {object} element The custom element processor to add
 */
Stencil.prototype.addElements = function(elements) {
    this.elements = Object.assign({}, this.elements, elements);
};


/**
 * Adds a custom element processor.
 * 
 * @param  {object} element The custom element processor to add
 */
Stencil.prototype.addElements = function(elements) {
    this.elements = Object.assign({}, this.elements, elements);
};


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
 * Includes a substencil
 * 
 * @param  {name} name The name used to identify the substencil
 * @param  {html|object} substencil The html, or stencil
 */
Stencil.prototype.include = function(substencils) {
    
    Object.keys(substencils).forEach(function(key) {

        var substencil = substencils[key];
        substencil.parent = this;
        this.substencils[key] = substencil;

    }.bind(this));
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
 */
Stencil.prototype.render = function(model, node, scratchpad) {

    var output = "",
        nodes;

    // If the stencil hasn't been 
    // compiled, do so now:
    if (!this.document) {
        this.compile();
    }

    node = node || this.document;
    nodes = node.childNodes || [];       
    scratchpad = scratchpad || new Scratchpad(node);
    
    // Render each node in the document:
    nodes.forEach(function(node) {
        
        switch (node.nodeType) {

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
 * @param  {object} model The model that will be used to compute expressions
 * @param  {object} node The element node to render
 * @return {string} The rendered HTML
 */
Stencil.prototype.renderElement = function(model, node, scratchpad) {

    var attributeList = this.prepareAttributes(model, node, scratchpad),
        attribute,
        attributes = [],
        element = this.elements[node.tagName],
        output;

    // Add this node to the scratchpad:
    scratchpad.push(node);
    scratchpad.stack.attributes = attributeList;
            
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

    // Give custom elements a chance to customize rendering:
    if (output === undefined && element) {
        output = element.onRender(model, node, this, scratchpad);
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
Stencil.prototype.prepareAttributes = function(model, node, scratchpad) {

    var output = [];

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
 * @return {string} The rendered expression.
 */
Stencil.prototype.renderExpression = function(model, expression, scratchpad) {

    if (!expression) return;

    var key = expressionNameFor(expression.type, expression.operator),
        strategy = this.expressions[key].callback || function() {},
        output;
    
    // Prerender the left/right side of any binary expressions:
    expression = Object.assign({}, expression);
    expression.left = expression.left && this.renderExpression(model, expression.left);
    expression.right = expression.right && this.renderExpression(model, expression.right);

    output = strategy(model, expression, this, scratchpad);
    return output;
};


module.exports = Stencil;