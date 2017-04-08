/* jshint esversion: 6, expr: true */

var Stencil = require("../");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;


describe("stencil", function() {


    it("exists", function() {
        expect(Stencil).to.be.a("function");
    });


    it("exposes node type constants", function() {

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
            closeExpression: "}}",
            nullTagName: "x"
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


    it("can compile html into a document", function() {

        var html = "<p/>",
            stencil = new Stencil(html);
                    
        // If the node type of the document is "document", that's good enough for me:
        stencil.compile();
        expect(stencil.document.nodeType).to.equal(Stencil.NodeType.DOCUMENT);
    });


    it("compiles expressions in text nodes recursively", function() {

        var html = "<p>alpha {{beta}} gamma</p> <p>{{alpha}} beta {{gamma}}</p>",
            stencil = new Stencil(html),
            p1, 
            p2;
            
        // Compile the document, and extract the P tag:
        stencil.compile();
        p1 = stencil.document.childNodes[0];
        p2 = stencil.document.childNodes[1];

        // The text of the P tag should have been broken into three pieces:
        expect(p1.childNodes.length).to.equal(3);
        expect(p1.childNodes[0].nodeType).to.equal(Stencil.NodeType.TEXT);
        expect(p1.childNodes[1].nodeType).to.equal(Stencil.NodeType.EXPRESSION);
        expect(p1.childNodes[2].nodeType).to.equal(Stencil.NodeType.TEXT);

        expect(p1.childNodes[1].expression).to.be.an("object");

        expect(p2.childNodes.length).to.equal(3);
        expect(p2.childNodes[0].nodeType).to.equal(Stencil.NodeType.EXPRESSION);
        expect(p2.childNodes[1].nodeType).to.equal(Stencil.NodeType.TEXT);
        expect(p2.childNodes[2].nodeType).to.equal(Stencil.NodeType.EXPRESSION);

        expect(p2.childNodes[0].expression).to.be.an("object")
        expect(p2.childNodes[2].expression).to.be.an("object")
    });


    it("renders doctype nodes", function() {
        
        var html = "<!doctype html>",
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal(html);
    });


    it("renders element nodes", function() {
        
        var html = "<div><p><span></span></p></div>",
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal(html);
    });

    it("renders element attributes", function() {
        
        var html = '<div id="alpha" class=""></div>',
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal(html);
    });


    it("renders NULL element attributes", function() {
        
        var html = '<div><x>alpha</x></div>',
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal("<div>alpha</div>");
    });
    

    it("renders text nodes", function() {
        
        var html = "<p>alpha</p><p>beta</p>",
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal(html);
    });


    it("exposes expression type constants", function() {

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
    

    it("can name an expression", function() {

        var typeWithoutOperator = Stencil.expressionNameFor("alpha"),
            typeWithOperator = Stencil.expressionNameFor("alpha", "beta");

        expect(typeWithoutOperator).to.equal("alpha");
        expect(typeWithOperator).to.equal("alpha(beta)");
    });


    it("can add expressions", function() {

        // Since we cannot remove expressions once they've been created, let's
        // be absolutely sure that no tests can ever use this test expression:
        function testExpression() {
            throw "Somehow, a test expression was invoked.";
        }

        Stencil.addExpression("TestExpression", "operator", testExpression);

        expect(Stencil.expression["TestExpression(operator)"]).to.equal(testExpression);
    });

});