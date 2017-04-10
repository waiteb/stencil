/* jshint esversion: 6, expr: true */

var Stencil = require("../");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;


describe("A stencil", function() {


    it("exists", function() {
        expect(Stencil).to.be.a("function");
    });


    it("has node type constants", function() {

        expect(Stencil.NodeType).to.deep.equal({
            ELEMENT: 1,
            TEXT: 3,
            PROCESSING_INSTRUCTION: 7,
            COMMENT: 8,
            DOCUMENT: 9,
            DOCUMENT_TYPE: 10,
            FRAGMENT: 11,
            EXPRESSION: 256
        });
    });


    it("has default settings", function() {
        expect(Stencil.defaultSettings).to.deep.equal({
            openExpression: "{{",
            closeExpression: "}}"
        });
    });


    it("can be constructed with just an html parameter", function() {

        var html = "<p/>",
            stencil = new Stencil(html);

            expect(stencil.html).to.equal(html);
            expect(stencil.settings).to.be.an("object");
    });


    it("can be constructed with both html and settigns parameters", function() {

        var html = "<p/>",
            settings = {openExpression: "${"},
            stencil = new Stencil(html, settings);

            expect(stencil.html).to.equal(html);
            expect(stencil.settings.openExpression).to.equal("${");
    });


    it("can define custom expression delimiters", function() {

        var html = "<p>${alpha}</p>",
            settings = {openExpression: "\\${", closeExpression: "}"},
            stencil = new Stencil(html, settings),
            output = stencil.render({alpha: "value"});

            expect(output).to.equal("<p>value</p>");
    });    


    it("can be constructed with a pre-compiled template", function() {
        
        var originalStencil = new Stencil("<p/>"),
            stencil = new Stencil(originalStencil.document);

        expect(stencil.document).to.equal(originalStencil.document);
    });


    it("complains if constructed without a template", function() {
        expect(function() {new Stencil();}).to.throw(Error);
    });


    describe("can compile", function() {
            
        it("html into a document", function() {

            var html = "<p/>",
                stencil = new Stencil(html);
                        
            // If the node type of the document is "document", that's good enough for me:
            stencil.compile();
            expect(stencil.document.nodeType).to.equal(Stencil.NodeType.DOCUMENT);
        });


        it("expressions in text nodes", function() {

            var html = "<p>{{alpha}} beta {{gamma}}</p>",
                stencil = new Stencil(html),
                p1;
                
            // Compile the document, and extract the P tag:
            stencil.compile();
            p1 = stencil.document.childNodes[0].childNodes[0];

            // The text of the P tag should have been broken into three pieces:
            expect(p1.nodeType).to.equal(Stencil.NodeType.EXPRESSION);
        });


        it("expressions in attributes", function() {
            
            var html = '<p name="{{value}}"></p>',
                stencil = new Stencil(html),
                p = stencil.document.childNodes[0],
                attribute = p.attributes.name;

            expect(attribute).to.be.an("object");
        });
    });


    describe("can render", function() {
            
        it("doctype nodes", function() {
            
            var html = "<!doctype html>",
                stencil = new Stencil(html);
                output = stencil.render();

            expect(output).to.equal(html);
        });


        it("element nodes", function() {
            
            var html = "<div><p><span></span></p></div>",
                stencil = new Stencil(html);
                output = stencil.render();

            expect(output).to.equal(html);
        });


        it("compund text nodes", function() {
            
            var html = "<div>{{alpha}} beta {{gamma}}</div>",
                stencil = new Stencil(html);
                output = stencil.render({alpha: "value", gamma: 3});

            expect(output).to.equal("<div>value beta 3</div>");
        });


        it("attributes", function() {
            
            var html = '<div id="alpha" class=""></div>',
                stencil = new Stencil(html);
                output = stencil.render();

            expect(output).to.equal(html);
        });


        it("compound expression attributes", function() {
            
            var html = '<div id="{{alpha}} beta {{gamma}}"></div>',
                stencil = new Stencil(html);
                output = stencil.render({alpha: "value", gamma: 3});

            expect(output).to.equal('<div id="value beta 3"></div>');
        });


        it("text nodes", function() {
            
            var html = "<p>alpha</p><p>beta</p>",
                stencil = new Stencil(html);
                output = stencil.render();

            expect(output).to.equal(html);
        });
    });


    describe("has expressions that", function() {

        it("have type constants", function() {

            expect(Stencil.ExpressionType).to.deep.equal({
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
            });
        });
        

        it("can be named", function() {

            var typeWithoutOperator = Stencil.expressionNameFor("alpha"),
                typeWithOperator = Stencil.expressionNameFor("alpha", "beta");

            expect(typeWithoutOperator).to.equal("alpha");
            expect(typeWithOperator).to.equal("alpha(beta)");
        });


        it("can be defined", function() {

            // Since we cannot remove expressions once they've been created, let's
            // be absolutely sure that no tests can ever use this test expression:
            function handler() {
                throw "Somehow, a test expression was invoked.";
            }

            Stencil.addExpression("TestExpression", "operator", handler);

            expect(Stencil.expression["TestExpression(operator)"]).to.equal(handler);
        });
    });


    describe("has custom attributes that", function() {

        it("can be defined", function() {

            var testAttribute = {
                name: "test-add-attribute",
                onRender: function(attribute, model, node, stencil) {}
            };

            Stencil.addAttribute(testAttribute);

            expect(Stencil.attribute["test-add-attribute"]).to.equal(testAttribute);
        });


        it("can be sorted by priority in the rendered html", function() {

            var html = '<div gamma="" beta="" alpha=""></div>',
                stencil,
                output;

            Stencil.addAttribute({name: "alpha", priority: 0, show: true});
            Stencil.addAttribute({name: "beta", priority: 1, show: true});
            Stencil.addAttribute({name: "gamma", priority: 2, show: true});

            stencil = new Stencil(html);
            output = stencil.render();

            expect(output).to.equal('<div alpha="" beta="" gamma=""></div>');
        });


        it("can be hidden by default", function() {

            var html = "<div test-hidden-attribute=''></div>",
                stencil = new Stencil(html),
                output;

            Stencil.addAttribute({
                name: "test-hidden-attribute"
            });

            output = stencil.render();

            expect(output).to.equal("<div></div>");
        });


        it("must be excplicitly shown", function() {

            var html = '<div test-hidden-attribute=""></div>',
                stencil = new Stencil(html),
                output;

            Stencil.addAttribute({
                name: "test-hidden-attribute",
                show: true
            });

            output = stencil.render();

            expect(output).to.equal(html);
        });   

        it("can override element rendering", function() {

            var html = "<div test-override=''></div>",
                stencil = new Stencil(html),
                output;

            Stencil.addAttribute({
                name: "test-override",
                onRender: function() {
                    return "overidden";
                }
            });

            output = stencil.render();

            expect(output).to.equal("overidden");
        });     

        it("use expression values by default", function() {

            Stencil.addAttribute({
                name: "test-expression",
                show: true
            });

            var html = '<div test-expression="alpha"></div>',
                stencil = new Stencil(html),
                output;

            output = stencil.render({alpha: "value"});
            expect(output).to.equal('<div test-expression="value"></div>');
        });
        

        it("must turn off expression values explicitly", function() {

            Stencil.addAttribute({
                name: "test-expression",
                escapeExpressions: true,
                show: true
            });

            var html = '<div test-expression="alpha"></div>',
                stencil = new Stencil(html),
                output;

            output = stencil.render({alpha: "value"});
            expect(output).to.equal(html);
        });
    });


    describe("has custom elements that", function() {

        it("can be defined", function() {

            var testElement = {
                tagName: "test-add-element",
                onRender: function(model, node, stencil) {}
            };

            Stencil.addElement(testElement);

            expect(Stencil.element["test-add-element"]).to.equal(testElement);
        });

        it("can override element rendering", function() {

            var html = "<test-override-element></test-override-element>",
                stencil = new Stencil(html),
                output;

            Stencil.addElement({
                tagName: "test-override-element",
                onRender: function(model, node, stencil, scratchpad) {
                    return "overridden";
                }
            });

            output = stencil.render();

            expect(output).to.equal("overridden");
        });
    });
});