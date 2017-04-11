/* jshint node: true, esversion: 6, undef: true, unused: true, jasmine: true */
var Stencil = require("../index.js");
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
            expressions: {},
            attributes: {},
            elements: {},
            openExpression: "{{",
            closeExpression: "}}"
        });
    });


    it("can assign global scope properties", function() {

        var stencil = new Stencil("<p/>"),
            firstGlobals = {alpha: "value"},
            secondGlobals = {beta: "value"};

        // Added values should be available in the stencil:
        stencil.addGlobals({firstGlobals: firstGlobals});
        expect(stencil.globals.firstGlobals).to.equal(firstGlobals);

        // New values should be added to the collection:
        stencil.addGlobals({secondGlobals: secondGlobals});
        expect(stencil.globals.firstGlobals).to.equal(firstGlobals);
        expect(stencil.globals.secondGlobals).to.equal(secondGlobals);
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


    xit("can be constructed with a pre-compiled template", function() {

        // What happens when we want to recompile a template that 
        // doesn't have a template?

        var originalStencil = new Stencil("<p/>"),
            stencil = new Stencil(originalStencil.document);

        expect(stencil.document).to.equal(originalStencil.document);
    });


    it("complains if constructed without a template", function() {
        expect(function() {new Stencil();}).to.throw(Error);
    });


    xit("can include substencils that are node modules", function() {

        var html = "<p></p>",
            rootStencil = new Stencil(html);

        rootStencil.include({alpha: "npm://stencil/lib/stencil.test.html"});

        // The substencil should be compiled:
        expect(rootStencil.substencils.alpha.document.nodeType).to.equal(Stencil.NodeType.DOCUMENT);
    });


    xit("can include substencils that are uncompiled HTML", function() {

        var html = "<p></p>",
            settings = {customSetting: true},
            rootStencil = new Stencil(html, settings);

        rootStencil.include({alpha: html});

        // The substencil should be cached, and it should have the same settings as the root stencil:
        expect(rootStencil.substencils.alpha.html).to.equal(html);
        expect(rootStencil.substencils.alpha.settings).to.deep.equal(rootStencil.settings);
    });


    it("can include substencils that are already compiled", function() {

        var html = "<p></p>",
            settings = {customSetting: true},
            rootStencil = new Stencil(html),
            substencil = new Stencil(html, settings);

        rootStencil.include({alpha: substencil});

        // The substencil should the same as the one we included:
        expect(rootStencil.substencils.alpha).to.equal(substencil);
    });


    describe("can compile", function() {

        it("html into a document", function() {

            var html = "<p/>",
                stencil = new Stencil(html);

            // The stencil should have both html and document properties:
            expect(stencil.html).to.equal(html);
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
    });


    describe("can render", function() {

        it("doctype nodes", function() {

            var html = "<!doctype html>",
                stencil = new Stencil(html),
                output = stencil.render();

            expect(output).to.equal(html);
        });


        it("element nodes", function() {

            var html = "<div><p><span></span></p></div>",
                stencil = new Stencil(html),
                output = stencil.render();

            expect(output).to.equal(html);
        });


        it("compund text expressions", function() {

            var html = "<div>{{alpha}} beta {{gamma}}</div>",
                stencil = new Stencil(html),
                output = stencil.render({alpha: "value", gamma: 3});

            expect(output).to.equal("<div>value beta 3</div>");
        });


        it("attributes", function() {

            var html = '<div id="alpha" class=""></div>',
                stencil = new Stencil(html),
                output = stencil.render();

            expect(output).to.equal(html);
        });


        it("compound attribute expressions", function() {

            var html = '<div id="{{alpha}} beta {{gamma}}"></div>',
                stencil = new Stencil(html),
                output = stencil.render({alpha: "value", gamma: 3});

            expect(output).to.equal('<div id="value beta 3"></div>');
        });


        it("text nodes", function() {

            var html = "<p>alpha</p><p>beta</p>",
                stencil = new Stencil(html),
                output = stencil.render();

            expect(output).to.equal(html);
        });


        it("comment nodes", function() {

            var html = "<!-- {{alpha}} -->",
                stencil = new Stencil(html),
                output = stencil.render({alpha: "value"});

            expect(output).to.equal("<!-- value -->");
        });


        it("root values", function() {

            var html = "<p>{{@model.alpha}}</p>",  // Model should always be available in the root scope.
                stencil = new Stencil(html),
                output = stencil.render({alpha: "value"});

            expect(output).to.equal("<p>value</p>");
        }); 


        it("default root values", function() {

            var html = "<p>{{@alpha}}</p>",
                stencil = new Stencil(html),
                output;

            stencil.addGlobals({alpha: "value"});

            output = stencil.render();

            expect(output).to.equal("<p>value</p>");
        });       

        it("conditionally renders binary expressions", function() {

            var settings = {}, 
                stencil,
                output;

            settings.expressions = {
                arrow:  {
                    type: Stencil.ExpressionType.BINARY,
                    operator: "for",
                    renderLeft: false,
                    renderRight: false,
                    onRender: function(model, expression) {
                        return expression.left.name + " " + expression.right.name;
                    }
                }
            };

            stencil = new Stencil("{{a for b}}", settings);

            output = stencil.render({a: 1, b: 2});

            expect(output).to.not.equal("1 2");
            expect(output).to.equal("a b");
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


        it("can be defined", function() {

            var settings = {},
                stencil;

            settings.expressions = {
                testExpression: {
                    type: "TestExpression", 
                    operator: "operator", 
                    callback: function() {}
                }
            };

            stencil = new Stencil("<p/>", settings);
            expect(stencil.expressions["TestExpression(operator)"]).to.equal(settings.expressions.testExpression);
        });
    });


    describe("has custom attributes that", function() {

        it("can be defined", function() {
            
            var settings = {},
                stencil;

            settings.attributes = {
                firstAttribute: {},
                secondAttribute: {}
            };

            stencil = new Stencil("<p/>", settings),
            
            expect(stencil.attributes.firstAttribute).to.equal(settings.attributes.firstAttribute);
            expect(stencil.attributes.secondAttribute).to.equal(settings.attributes.secondAttribute);
        });


        it("can be sorted by priority in the rendered html", function() {

            var html = '<div gamma="" beta="" alpha=""></div>',
                settings = {},
                stencil,
                output;
            
            // Create three attributes in a different order 
            // than they appear in the template:
            settings.attributes = {
                alpha: {name: "alpha", priority: 0, show: true},
                beta: {name: "beta", priority: 1, show: true},
                gamma: {name: "gamma", priority: 2, show: true}
            };

            stencil = new Stencil(html, settings);

            // After rendering, the attributes should be in priority order:
            output = stencil.render();
            expect(output).to.equal('<div alpha="" beta="" gamma=""></div>');
        });


        it("can be hidden by default", function() {

            var html = '<div hidden=""></div>',
                settings = {},
                stencil,
                output;

            settings.attributes = {
                hidden: {name: "hidden"}
            };

            stencil = new Stencil(html, settings);

            // Since the attribute was not explicitly 
            // shown, it won't be rendered:
            output = stencil.render();
            expect(output).to.equal("<div></div>");
        });


        it("must be excplicitly shown", function() {

            var html = '<div shown=""></div>',
                settings = {},
                stencil,
                output;

            settings.attributes = {
                shown: {name: "shown", show: true}
            };

            stencil = new Stencil(html, settings);

            // Because the aatribute is shown, it will be rendered:
            output = stencil.render();
            expect(output).to.equal(html);
        });


        it("can override element rendering", function() {

            var html = '<div override=""></div>',
                settings = {},
                stencil,
                output;

            settings.attributes = {
                override: {name: "override", onRender: function() {return "overidden";}}
            };

            stencil = new Stencil(html, settings);

            output = stencil.render();

            expect(output).to.equal("overidden");
        });


        it("use expression values by default", function() {

            var html = '<div test="alpha"></div>',
                settings = {},
                stencil,
                output;

            settings.attributes = {
                test: {name: "test-expression", show: true}
            };

            stencil = new Stencil(html, settings);

            output = stencil.render({alpha: "value"});
            expect(output).to.equal('<div test="value"></div>');
        });


        it("must turn off expression values explicitly", function() {

            var html = '<div test-expression="alpha"></div>',
                settings = {},
                stencil,
                output;

            settings.attributes = {
                testEscapedExpressions: {
                    name: "test-expression",
                    escapeExpressions: true,
                    show: true
                }
            };

            stencil = new Stencil(html, settings);

            output = stencil.render({alpha: "value"});
            expect(output).to.equal(html);
        });
    });


    describe("has custom elements that", function() {

        it("can be defined", function() {

            var stencil = new Stencil("<custom></custom>"),
                firstElement = {elementA: {onRender: function() {}}},
                secondElement = {elementB: {onRender: function() {}}};
            
            // Added values should be available in the stencil:
            stencil.addElements(firstElement);
            expect(stencil.elements.elementA).to.equal(firstElement.elementA);
            
            // New values should be added to the collection:
            stencil.addElements(secondElement);
            expect(stencil.elements.elementA).to.equal(firstElement.elementA);
            expect(stencil.elements.elementB).to.equal(secondElement.elementB);
        });

        it("can override element rendering", function() {

            var html = "<test></test>",
                stencil = new Stencil(html),
                output;

            stencil.addElements({
                test: {
                    onRender: function(model, node, stencil, scratchpad) { // jshint unused: false
                        return "overridden";
                    }
                }
            });

            output = stencil.render();

            expect(output).to.equal("overridden");
        });
    });
});