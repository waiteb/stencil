/* jshint node: true, esversion: 6, undef: true, jasmine: true */

var Stencil = require("./stencil.js");

module.exports = {

    // This: {{this}} as a reference the model that is currently in scope:
    this: {
        type: Stencil.ExpressionType.THIS,  
        callback: function(model, expression) {
            return model;
        }
    },


     // Literal: {{"string"}} and other primitives:
    literal: {
        type: Stencil.ExpressionType.LITERAL,  
        callback: function(model, expression) {
            return expression.value;
        }
    },


     // Array: {{["array", "expressions"]}}:
    array: {
        type: Stencil.ExpressionType.ARRAY,  
        callback: function(model, expression, stencil) {
                        
            var output = [];

            for(let i = 0; i < expression.elements.length; i++) {
                output.push(stencil.renderExpression(model, expression.elements[i]));
            }

            return output;
        }
    },


    // Identifier: {{property}}
    identifier: {
        type: Stencil.ExpressionType.IDENTIFIER, 
        callback: function(model, expression, stencil) {
            return model && model[expression.name];
        }
    },


    // Compound Expression: {{compound expression}} and {{compund, expression}}
    compound: {
        type: Stencil.ExpressionType.COMPOUND, 
        callback: function(model, expression, stencil) {
            
            var output = [];

            expression.body.forEach(function(expression) {
                output.push(stencil.renderExpression(model, expression));
            }.bind(this));

            return output.join(" ");
        }
    },


    // Ternary Condition: {{ternary ? condition : expressions}}
    ternary: {
        type: Stencil.ExpressionType.CONDITIONAL, 
        callback: function(model, expression, stencil) {
                        
            var test = stencil.renderExpression(model, expression.test),
                consequent = stencil.renderExpression(model, expression.consequent),
                alternate = stencil.renderExpression(model, expression.alternate);
            
            return (test ? consequent : alternate);
        }
    },


    // Member Expressions: {{member.properties}} and {{member["properties"]}}
    member: {
        type: Stencil.ExpressionType.MEMBER, 
        callback: function(model, expression, stencil) {
                        
            var object = stencil.renderExpression(model, expression.object),
                property = stencil.renderExpression(object, expression.property),
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
        callback: function(model, expression, stencil) {
            return !stencil.renderExpression(model, expression.argument);
        }
    },


    // Unary Negative: {{-value}}
    unaryNegative: {
        type: Stencil.ExpressionType.UNARY, 
        operator: "-",  
        callback: function(model, expression, stencil) {
            return "-" + stencil.renderExpression(model, expression.argument);
        }
    },


    // Unary Plus: {{+value}}
    unaryPlus: {
        type: Stencil.ExpressionType.UNARY,  
        operator: "+",  
        callback: function(model, expression, stencil) {
            return stencil.renderExpression(model, expression.argument);
        }
    },


    // Logical OR: {{value || anotherValue}}
    or: {
        type: Stencil.ExpressionType.LOGICAL,  
        operator: "||",  
        callback: function(model, expression, stencil) {
            return expression.left || expression.right;
        }
    },


    // Logical AND: {{value && anotherValue}}
    and: {
        type: Stencil.ExpressionType.LOGICAL,  
        operator: "&&",  
        callback: function(model, expression, stencil) {
            return expression.left && expression.right;
        }
    },


    // Equals: {{value == anotherValue}}
    equals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "==", 
        callback: function(model, expression, stencil) {
            return expression.left == expression.right;
        }
    },


    // Strict Equals: {{value === anotherValue}}
    strictEquals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "===", 
        callback: function(model, expression, stencil) {
            return expression.left === expression.right;
        }
    },


    // Not Equal: {{value != anotherValue}}
    notEquals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "!=", 
        callback: function(model, expression, stencil) {
            return expression.left != expression.right;
        }
    },


    // Strict Not-Equal: {{value !== anotherValue}}
    strictNotEquals: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "!==", 
        callback: function(model, expression, stencil) {
            return expression.left !== expression.right;
        }
    },


    // Greater-Than: {{value > anotherValue}}
    greaterThan: {
        type: Stencil.ExpressionType.BINARY,  
        operator: ">", 
        callback: function(model, expression, stencil) {
            return expression.left > expression.right;
        }
    },


    // Greater-Than-Equal-To: {{value >= anotherValue}}
    greaterThanEqualTo: {
        type: Stencil.ExpressionType.BINARY,  
        operator: ">=", 
        callback: function(model, expression, stencil) {
            return expression.left >= expression.right;
        }
    },


    // Less-Than: {{value < anotherValue}}
    lessThan: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "<", 
        callback: function(model, expression, stencil) {
            return expression.left < expression.right;
        }
    },


    // Less-Than-Equal-To: {{value =< anotherValue}}
    lessThanEqualTo: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "<=", 
        callback: function(model, expression, stencil) {
            return expression.left <= expression.right;
        }
    },


    // Add: {{value + anotherValue}}
    add: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "+", 
        callback: function(model, expression, stencil) {
            return expression.left + expression.right;
        }
    },


    // Subtract: {{value - anotherValue}}
    subtract: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "-", 
        callback: function(model, expression, stencil) {
            return expression.left - expression.right;
        }
    },


    // Multiply: {{value * anotherValue}}
    multiply: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "*", 
        callback: function(model, expression, stencil) {
            return expression.left * expression.right;
        }
    },


    // Divide: {{value / anotherValue}}
    divide: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "/", 
        callback: function(model, expression, stencil) {
            return expression.left / expression.right;
        }
    },


    // Remainder: {{value % anotherValue}}
    remainder: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "%", 
        callback: function(model, expression, stencil) {
            return expression.left % expression.right;
        }
    },


    // Exponentiation: {{value ** anotherValue}}
    exponentiation: {
        type: Stencil.ExpressionType.BINARY,  
        operator: "**", 
        callback: function(model, expression, stencil) {
            return Math.pow(expression.left, expression.right);
        }
    },

    rootScope: {
        type: Stencil.ExpressionType.UNARY, 
        operator: "@",  
        callback: function(model, expression, stencil) {

            var output = stencil.renderExpression(model, expression.argument.property);
            return output;
        }
    }
};