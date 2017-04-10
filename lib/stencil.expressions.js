/* jshint esversion: 6 */
module.exports = function(Stencil) {

    // This: {{this}} as a reference the model that is currently in scope:
    Stencil.addExpression({
        name: Stencil.ExpressionType.THIS,  
        callback: function(model, expression) {
            return model;
        }
    });


     // Literal: {{"string"}} and other primitives:
    Stencil.addExpression({
        name: Stencil.ExpressionType.LITERAL,  
        callback: function(model, expression) {
            return expression.value;
        }
    });


     // Array: {{["array", "expressions"]}}:
    Stencil.addExpression({
        name: Stencil.ExpressionType.ARRAY,  
        callback: function(model, expression, stencil) {
                        
            var output = [];

            for(let i = 0; i < expression.elements.length; i++) {
                output.push(stencil.renderExpression(model, expression.elements[i]));
            }

            return output;
        }
    });


    // Identifier: {{property}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.IDENTIFIER, 
        callback: function(model, expression, stencil) {
            return model[expression.name];
        }
    });


    // Compund Expression: {{compound expression}} and {{compund, expression}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.COMPOUND, 
        callback: function(model, expression, stencil) {
            
            var output = [];

            expression.body.forEach(function(expression) {
                output.push(stencil.renderExpression(model, expression));
            }.bind(this));

            return output.join(" ");
        }
    });


    // Ternary Condition: {{ternary ? condition : expressions}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.CONDITIONAL, 
        callback: function(model, expression, stencil) {
                        
            var test = stencil.renderExpression(model, expression.test),
                consequent = stencil.renderExpression(model, expression.consequent),
                alternate = stencil.renderExpression(model, expression.alternate);
            
            return (test ? consequent : alternate);
        }
    });


    // Member Expressions: {{member.properties}} and {{member["properties"]}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.MEMBER, 
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
                    output = object[property];
                }
            }

            return output;
        }
    });


    // NOT: {{!value}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.UNARY, 
        operator: "!", 
        callback: function(model, expression, stencil) {
            return !stencil.renderExpression(model, expression.argument);
        }
    });


    // Unary Negative: {{-value}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.UNARY, 
        operator: "-",  
        callback: function(model, expression, stencil) {
            return "-" + stencil.renderExpression(model, expression.argument);
        }
    });


    // Unary Plus: {{+value}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.UNARY,  
        operator: "+",  
        callback: function(model, expression, stencil) {
            return stencil.renderExpression(model, expression.argument);
        }
    });


    // Logical OR: {{value || anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.LOGICAL,  
        operator: "||",  
        callback: function(model, expression, stencil) {
            return expression.left || expression.right;
        }
    });


    // Logical AND: {{value && anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.LOGICAL,  
        operator: "&&",  
        callback: function(model, expression, stencil) {
            return expression.left && expression.right;
        }
    });


    // Equals: {{value == anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "==", 
        callback: function(model, expression, stencil) {
            return expression.left == expression.right;
        }
    });


    // Strict Equals: {{value === anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "===", 
        callback: function(model, expression, stencil) {
            return expression.left === expression.right;
        }
    });


    // Not Equal: {{value != anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "!=", 
        callback: function(model, expression, stencil) {
            return expression.left != expression.right;
        }
    });


    // Strict Not-Equal: {{value !== anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "!==", 
        callback: function(model, expression, stencil) {
            return expression.left !== expression.right;
        }
    });


    // Greater-Than: {{value > anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: ">", 
        callback: function(model, expression, stencil) {
            return expression.left > expression.right;
        }
    });


    // Greater-Than-Equal-To: {{value >= anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: ">=", 
        callback: function(model, expression, stencil) {
            return expression.left >= expression.right;
        }
    });


    // Less-Than: {{value < anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "<", 
        callback: function(model, expression, stencil) {
            return expression.left < expression.right;
        }
    });


    // Less-Than-Equal-To: {{value =< anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "<=", 
        callback: function(model, expression, stencil) {
            return expression.left <= expression.right;
        }
    });


    // Add: {{value + anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "+", 
        callback: function(model, expression, stencil) {
            return expression.left + expression.right;
        }
    });


    // Subtract: {{value - anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "-", 
        callback: function(model, expression, stencil) {
            return expression.left - expression.right;
        }
    });


    // Multiply: {{value * anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "*", 
        callback: function(model, expression, stencil) {
            return expression.left * expression.right;
        }
    });


    // Divide: {{value / anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "/", 
        callback: function(model, expression, stencil) {
            return expression.left / expression.right;
        }
    });


    // Remainder: {{value % anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "%", 
        callback: function(model, expression, stencil) {
            return expression.left % expression.right;
        }
    });


    // Exponentiation: {{value ** anotherValue}}
    Stencil.addExpression({
        name: Stencil.ExpressionType.BINARY,  
        operator: "**", 
        callback: function(model, expression, stencil) {
            return Math.pow(expression.left, expression.right);
        }
    });
};