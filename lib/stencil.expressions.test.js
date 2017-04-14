/* jshint node: true, esversion: 6, undef: true, unused: true, jasmine: true */
var Stencil = require("../index.js");
var Plugin = require("./stencil.plugin.js");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("stencil expressions", function() {

    describe("can render", function() {

        it("THIS expressions", function() {

            var html = "{{this}}",
                stencil = new Stencil(html),
                output = stencil.render("alpha");

            expect(output).to.equal("alpha");
        });


        it("LITERAL expressions", function() {

            var html = "{{'literal'}}",
                stencil = new Stencil(html),
                output = stencil.render();

            expect(output).to.equal("literal");
        });


        it("ARRAY expressions", function() {

            var html = "{{[1, 2, 3]}}",
                stencil = new Stencil(html),
                output = stencil.render();

            expect(output).to.equal("1,2,3");
        });


        it("ARRAY expressions as arrays instead of strings", function() {

            var html = "{{([1, 2, 3])[0]}}",
                stencil = new Stencil(html),
                output = stencil.render();

            expect(output).to.equal("1");
        });

        
        it("IDENTIFIER expressions", function() {

            var html = "{{identifier}}",
                stencil = new Stencil(html),
                output = stencil.render({identifier: "alpha"});

            expect(output).to.equal("alpha");
        });


        it("DOT-NOTATION member expressions", function() {

            var html = "{{alpha.beta.gamma}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: {beta: {gamma: "value"}}});

            expect(output).to.equal("value");
        });


        it("undefined DOT-NOTATION member expressions", function() {

            var html = "{{alpha.beta}}",
                stencil = new Stencil(html),
                output = stencil.render({});

            expect(output).to.equal("");
        });


        it("BRACKET-NOTAION member expressions", function() {

            var html = "{{alpha[0][0]}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: [["value"]]});

            expect(output).to.equal("value");
        });

        it("undefined BRACKET-NOTAION member expressions", function() {

            var html = "{{alpha[0]}}",
                stencil = new Stencil(html),
                output = stencil.render({});

            expect(output).to.equal("");
        });


        it("UNDEFINED member expressions as empty strings", function() {

            var html = "{{alpha.beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: {}});

            expect(output).to.equal("");
        });


        it("COMPOUND expressions", function() {

            var html = "{{alpha ' ' beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: "a", beta: "b"});

            expect(output).to.equal("a b");
        });


        it("EQUALS expressions", function() {

            var html = "{{alpha == beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: true});

            expect(output).to.equal("true");
        });


        it("STRICT EQUALS expressions", function() {

            var html = "{{alpha === beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: true});

            expect(output).to.equal("false");
        });


        it("NOT EQUALS expressions", function() {

            var html = "{{alpha != beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: true});

            expect(output).to.equal("false");
        });


        it("STRICT NOT EQUALS expressions", function() {

            var html = "{{alpha !== beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: true});

            expect(output).to.equal("true");
        });


        it("NOT expressions", function() {

            var html = "{{!alpha.beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: {beta: true}});

            expect(output).to.equal("false");
        });


        it("OR expressions", function() {

            var html = "{{alpha || beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: "", beta: "value"});

            expect(output).to.equal("value");
        });


        it("AND expressions", function() {

            var html = "{{alpha && beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: "alpha", beta: "beta"});

            expect(output).to.equal("beta");
        }); 


        it("GT expressions", function() {

            var html = "{{alpha > beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: 2});

            expect(output).to.equal("false");
        });


        it("GTE expressions", function() {

            var html = "{{alpha >= beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: 1});

            expect(output).to.equal("true");
        });


        it("LT expressions", function() {

            var html = "{{alpha < beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: 2});

            expect(output).to.equal("true");
        });


        it("LTE expressions", function() {

            var html = "{{alpha <= beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 2, beta: 2});

            expect(output).to.equal("true");
        });


        it("CONDITIONAL expressions", function() {

            var html = "{{alpha ? beta : gamma}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: false, beta: "beta", gamma: "gamma"});

            expect(output).to.equal("gamma");
        });


        it("UNARY NEGAION expressions", function() {

            var html = "{{-alpha}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1});

            expect(output).to.equal("-1");
        });


        it("UNARY PLUS expressions", function() {

            var html = "{{+alpha}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1});

            expect(output).to.equal("1");
        });
        

        it("ADD expressions", function() {

            var html = "{{alpha + beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: 2});

            expect(output).to.equal("3");
        });


        it("SUBTRACT expressions", function() {

            var html = "{{alpha - beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: 2});

            expect(output).to.equal("-1");
        });


        it("MULTIPLY expressions", function() {

            var html = "{{alpha * beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: 2});

            expect(output).to.equal("2");
        });


        it("DIVIDE expressions", function() {

            var html = "{{alpha / beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 1, beta: 2});

            expect(output).to.equal("0.5");
        });


        it("EXPONENTIATION expressions", function() {

            var html = "{{alpha ** beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 2, beta: 8});

            expect(output).to.equal("256");
        });


        it("REMAINDER expressions", function() {

            var html = "{{alpha % beta}}",
                stencil = new Stencil(html),
                output = stencil.render({alpha: 3, beta: 2});

            expect(output).to.equal("1");
        });


        it("SCOPE expressions", function() {

            var html = '<div scopeSetter="">{{@alpha}}</div>',
                scopeSetter,
                stencil,
                output;

            scopeSetter = new Plugin("scopeSetter", {
                onRenderAttribute: function(value, model, node, stencil, scratchpad) {
                    scratchpad.scope.alpha = "value";
                }
            });

            stencil = new Stencil(html, {attributes: {scopeSetter}});
            output = stencil.render();

            expect(output).to.equal("<div>value</div>");
        });      


        it("AS expression", function() {

            var html = "<p>{{alpha as alias}}<p>{{@alias}}</p></p>",
                stencil = new Stencil(html),
                output = stencil.render({alpha: "value"});

            expect(output).to.equal("<p>value<p>value</p></p>");

        });
        

        it("FILTER expression", function() {

            var html = "<p>{{'value'|upper|reverse}}</p>",
                settings = {},
                stencil,
                output;

            settings.filters = {
                upper: function(value) {
                    return value.toUpperCase();
                },
                reverse: function(value) {
                    return value.split("").reverse().join("");
                }
            };

            stencil = new Stencil(html, settings);
            output = stencil.render();

            expect(output).to.equal("<p>EULAV</p>");
        });
    });
});