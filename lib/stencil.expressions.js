/* jshint esversion: 6 */
module.exports = function(Stencil) {

    Stencil.addExpression(Stencil.ExpressionType.THIS,  function(model, expression) {
        return model;
    });


    Stencil.addExpression(Stencil.ExpressionType.LITERAL,  function(model, expression) {
        return expression.value;
    });


    Stencil.addExpression(Stencil.ExpressionType.ARRAY,  function(model, expression, stencil) {
                    
        var output = [];

        for(let i = 0; i < expression.elements.length; i++) {
            output.push(stencil.renderExpression(model, expression.elements[i]));
        }

        return output;
    });


    Stencil.addExpression(Stencil.ExpressionType.IDENTIFIER, function(model, expression, stencil) {
        return model[expression.name];
    });


    Stencil.addExpression(Stencil.ExpressionType.COMPOUND, function(model, expression, stencil) {
        
        var output = [];

        expression.body.forEach(function(expression) {
            output.push(stencil.renderExpression(model, expression));
        }.bind(this));

        return output.join(" ");
    });


    Stencil.addExpression(Stencil.ExpressionType.CONDITIONAL, function(model, expression, stencil) {
                    
        var test = stencil.renderExpression(model, expression.test),
            consequent = stencil.renderExpression(model, expression.consequent),
            alternate = stencil.renderExpression(model, expression.alternate);
        
        return (test ? consequent : alternate);
    });


    Stencil.addExpression(Stencil.ExpressionType.MEMBER, function(model, expression, stencil) {
                    
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
    });

    Stencil.addExpression(Stencil.ExpressionType.UNARY, "!", function(model, expression, stencil) {
        return !stencil.renderExpression(model, expression.argument);
    });

    Stencil.addExpression(Stencil.ExpressionType.UNARY, "-", function(model, expression, stencil) {
        return "-" + stencil.renderExpression(model, expression.argument);
    });

    Stencil.addExpression(Stencil.ExpressionType.UNARY, "+", function(model, expression, stencil) {
        return stencil.renderExpression(model, expression.argument);
    });

    Stencil.addExpression(Stencil.ExpressionType.LOGICAL, "||", function(model, expression, stencil) {
        return expression.left || expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.LOGICAL, "&&", function(model, expression, stencil) {
        return expression.left && expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "==", function(model, expression, stencil) {
        return expression.left == expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "===", function(model, expression, stencil) {
        return expression.left === expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "!=", function(model, expression, stencil) {
        return expression.left != expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "!==", function(model, expression, stencil) {
        return expression.left !== expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, ">", function(model, expression, stencil) {
        return expression.left > expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, ">=", function(model, expression, stencil) {
        return expression.left >= expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "<", function(model, expression, stencil) {
        return expression.left < expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "<=", function(model, expression, stencil) {
        return expression.left <= expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "+", function(model, expression, stencil) {
        return expression.left + expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "-", function(model, expression, stencil) {
        return expression.left - expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "*", function(model, expression, stencil) {
        return expression.left * expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "/", function(model, expression, stencil) {
        return expression.left / expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "%", function(model, expression, stencil) {
        return expression.left % expression.right;
    });

    Stencil.addExpression(Stencil.ExpressionType.BINARY, "**", function(model, expression, stencil) {
        return Math.pow(expression.left, expression.right);
    });
};