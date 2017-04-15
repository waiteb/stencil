/* jshint node: true, esversion: 6, undef: true, jasmine: true */

var Stencil = require("./stencil.js");

module.exports = {

    // This: {{this}} as a reference the model that is currently in scope:
    this: {
        type: Stencil.ExpressionType.THIS,  
        onRender: function(model, expression) {
            return model;
        }
    },


     // Literal: {{"string"}} and other primitives:
    literal: {
        type: Stencil.ExpressionType.LITERAL,  
        onRender: function(model, expression) {
            return expression.value;
        }
    },


     // Array: {{["array", "expressions"]}}:
    array: {
        type: Stencil.ExpressionType.ARRAY,  
        onRender: function(model, expression, stencil, scratchpad) {
                        
            var output = [];

            for(let i = 0; i < expression.elements.length; i++) {
                output.push(stencil.renderExpression(model, expression.elements[i], scratchpad));
            }

            return output;
        }
    },


    // Identifier: {{property}}
    identifier: {
        type: Stencil.ExpressionType.IDENTIFIER, 
        onRender: function(model, expression, stencil) {
            return model && model[expression.name];
        }
    },


    // Compound Expression: {{compound expression}} and {{compund, expression}}
    compound: {
        type: Stencil.ExpressionType.COMPOUND, 
        onRender: function(model, expression, stencil, scratchpad) {
            
            var output = "";

            for(let i = 0, length = expression.body.length; i < length; i++) {
                output += stencil.renderExpression(model, expression.body[i], scratchpad);
            }

            return output;
        }
    },


    // Ternary Condition: {{ternary ? condition : expressions}}
    ternary: {
        type: Stencil.ExpressionType.CONDITIONAL, 
        onRender: function(model, expression, stencil, scratchpad) {
                        
            var test = stencil.renderExpression(model, expression.test),
                consequent = stencil.renderExpression(model, expression.consequent, scratchpad),
                alternate = stencil.renderExpression(model, expression.alternate, scratchpad);
            
            return (test ? consequent : alternate);
        }
    },


    // Member Expressions: {{member.properties}} and {{member["properties"]}}
    member: {
        type: Stencil.ExpressionType.MEMBER, 
        onRender: function(model, expression, stencil, scratchpad) {
                        
            var object = stencil.renderExpression(model, expression.object, scratchpad),
                property = stencil.renderExpression(object, expression.property, scratchpad),
                output;

            switch (expression.property.type) {

                case Stencil.ExpressionType.IDENTIFIER: {
                    output = property;
                    break;
                }
                case Stencil.ExpressionType.LITERAL: {
                    output = object && object[property];
                }
            }

            return output;
        }
    },


    // NOT: {{!value}}
    not: {
        type: Stencil.ExpressionType.UNARY, 
        operator: "!", 
        onRender: function(model, expression, stencil, scratchpad) {
            return !stencil.renderExpression(model, expression.argument, scratchpad);
        }
    },


    // Unary Negative: {{-value}}
    unaryNegative: {
        type: Stencil.ExpressionType.UNARY, 
        operator: "-",  
        onRender: function(model, expression, stencil, scratchpad) {
            return "-" + stencil.renderExpression(model, expression.argument, scratchpad);
        }
    },


    // Unary Plus: {{+value}}
    unaryPlus: {
        type: Stencil.ExpressionType.UNARY,  
        operator: "+",  
        onRender: function(model, expression, stencil, scratchpad) {
            return stencil.renderExpression(model, expression.argument, scratchpad);
        }
    },


    // Logical OR: {{value || anotherValue}}
    or: {
        type: Stencil.ExpressionType.LOGICAL,  
        operator: "||",  
        onRender: function(model, expression, stencil) {
            return expression.left || expression.right;
        }
    },


    // Logical AND: {{value && anotherValue}}
    and: {
        type: Stencil.ExpressionType.LOGICAL,  
        operator: "&&",  
        onRender: function(model, expression, stencil) {
            return expression.left && expression.right;
        }
    },


    // Equals: {{value == anotherValue}}
    equals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "==", 
        onRender: function(model, expression, stencil) {
            return expression.left == expression.right;
        }
    },


    // Strict Equals: {{value === anotherValue}}
    strictEquals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "===", 
        onRender: function(model, expression, stencil) {
            return expression.left === expression.right;
        }
    },


    // Not Equal: {{value != anotherValue}}
    notEquals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "!=", 
        onRender: function(model, expression, stencil) {
            return expression.left != expression.right;
        }
    },


    // Strict Not-Equal: {{value !== anotherValue}}
    strictNotEquals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "!==", 
        onRender: function(model, expression, stencil) {
            return expression.left !== expression.right;
        }
    },


    // Greater-Than: {{value > anotherValue}}
    greaterThan: {
        type: Stencil.ExpressionType.BINARY,  
        operator: ">", 
        onRender: function(model, expression, stencil) {
            return expression.left > expression.right;
        }
    },


    // Greater-Than-Equal-To: {{value >= anotherValue}}
    greaterThanEqualTo: {
        type: Stencil.ExpressionType.BINARY,  
        operator: ">=", 
        onRender: function(model, expression, stencil) {
            return expression.left >= expression.right;
        }
    },


    // Less-Than: {{value < anotherValue}}
    lessThan: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "<", 
        onRender: function(model, expression, stencil) {
            return expression.left < expression.right;
        }
    },


    // Less-Than-Equal-To: {{value =< anotherValue}}
    lessThanEqualTo: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "<=", 
        onRender: function(model, expression, stencil) {
            return expression.left <= expression.right;
        }
    },


    // Add: {{value + anotherValue}}
    add: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "+", 
        onRender: function(model, expression, stencil) {
            return expression.left + expression.right;
        }
    },


    // Subtract: {{value - anotherValue}}
    subtract: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "-", 
        onRender: function(model, expression, stencil) {
            return expression.left - expression.right;
        }
    },


    // Multiply: {{value * anotherValue}}
    multiply: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "*", 
        onRender: function(model, expression, stencil) {
            return expression.left * expression.right;
        }
    },


    // Divide: {{value / anotherValue}}
    divide: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "/", 
        onRender: function(model, expression, stencil) {
            return expression.left / expression.right;
        }
    },


    // Remainder: {{value % anotherValue}}
    remainder: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "%", 
        onRender: function(model, expression, stencil) {
            return expression.left % expression.right;
        }
    },


    // Exponentiation: {{value ** anotherValue}}
    exponentiation: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "**", 
        onRender: function(model, expression, stencil) {
            return Math.pow(expression.left, expression.right);
        }
    },

    rootScope: {
        type: Stencil.ExpressionType.UNARY, 
        operator: "@",  
        onRender: function(model, expression, stencil, scratchpad) {
            return stencil.renderExpression(scratchpad.scope, expression.argument);
        }
    },

    as: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "as", 
        renderRight: false,
        onRender: function(model, expression, stencil, scratchpad) {
            scratchpad.scope[expression.right.name] = expression.left;
            return expression.left;
        }
    },

    filter: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "|", 
        precedence: 9,
        renderRight: false,
        onRender: function(model, expression, stencil, scratchpad) {
            
            var filter = stencil.filters[expression.right.name],
                output = "";

            if (typeof filter === "function") {
                output = filter(expression.left, scratchpad);
            }

            return output;
        }
    }
};