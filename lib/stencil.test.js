/* jshint esversion: 6, expr: true */

var Stencil = require("../");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;


describe("stencil", function() {


    it("exists", function() {
        expect(Stencil).to.be.defined;
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
            expect(stencil.settings).to.be.defined;
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

        expect(p1.childNodes[1].expression).to.be.defined;

        expect(p2.childNodes.length).to.equal(3);
        expect(p2.childNodes[0].nodeType).to.equal(Stencil.NodeType.EXPRESSION);
        expect(p2.childNodes[1].nodeType).to.equal(Stencil.NodeType.TEXT);
        expect(p2.childNodes[2].nodeType).to.equal(Stencil.NodeType.EXPRESSION);

        expect(p2.childNodes[0].expression).to.be.defined;
        expect(p2.childNodes[2].expression).to.be.defined;
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


    it("renders THIS expressions", function() {

        var html = "{{this}}",
            stencil = new Stencil(html);
            output = stencil.render("alpha");

        expect(output).to.equal("alpha");
    });


    it("renders LITERAL expressions", function() {

        var html = "{{'literal'}}",
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal("literal");
    });


    it("renders ARRAY expressions", function() {

        var html = "{{[1, 2, 3]}}",
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal("1,2,3");
    });

    it("treats ARRAY expressions as arrays instead of strings", function() {

        var html = "{{([1, 2, 3])[0]}}",
            stencil = new Stencil(html);
            output = stencil.render();

        expect(output).to.equal("1");
    });

    
    it("renders IDENTIFIER expressions", function() {

        var html = "{{identifier}}",
            stencil = new Stencil(html);
            output = stencil.render({identifier: "alpha"});

        expect(output).to.equal("alpha");
    });


    it("renders DOT-NOTATION member expressions", function() {

        var html = "{{alpha.beta.gamma}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: {beta: {gamma: "value"}}});

        expect(output).to.equal("value");
    });


    it("renders BRACKET-NOTAION member expressions", function() {

        var html = "{{alpha[0][0]}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: [["value"]]});

        expect(output).to.equal("value");
    });


    it("renders COMPUND expressions", function() {

        var html = "{{alpha beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: "a", beta: "b"});

        expect(output).to.equal("a b");
    });


    it("renders EQUALS expressions", function() {

        var html = "{{alpha == beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: true});

        expect(output).to.equal("true");
    });


    it("renders STRICT EQUALS expressions", function() {

        var html = "{{alpha === beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: true});

        expect(output).to.equal("false");
    });

    it("renders NOT EQUALS expressions", function() {

        var html = "{{alpha != beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: true});

        expect(output).to.equal("false");
    });


    it("renders STRICT NOT EQUALS expressions", function() {

        var html = "{{alpha !== beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: true});

        expect(output).to.equal("true");
    });


    it("renders NOT expressions", function() {

        var html = "{{!alpha.beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: {beta: true}});

        expect(output).to.equal("false");
    });


    it("renders OR expressions", function() {

        var html = "{{alpha || beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: "", beta: "value"});

        expect(output).to.equal("value");
    });


    it("renders AND expressions", function() {

        var html = "{{alpha && beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: "alpha", beta: "beta"});

        expect(output).to.equal("beta");
    }); 


    it("renders GT expressions", function() {

        var html = "{{alpha > beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: 2});

        expect(output).to.equal("false");
    });


    it("renders GTE expressions", function() {

        var html = "{{alpha >= beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: 1});

        expect(output).to.equal("true");
    });


    it("renders LT expressions", function() {

        var html = "{{alpha < beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: 2});

        expect(output).to.equal("true");
    });


    it("renders LTE expressions", function() {

        var html = "{{alpha <= beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 2, beta: 2});

        expect(output).to.equal("true");
    });


    it("renders CONDITIONAL expressions", function() {

        var html = "{{alpha ? beta : gamma}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: false, beta: "beta", gamma: "gamma"});

        expect(output).to.equal("gamma");
    });


    it("renders UNARY NEGAION expressions", function() {

        var html = "{{-alpha}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1});

        expect(output).to.equal("-1");
    });


    it("renders UNARY PLUS expressions", function() {

        var html = "{{+alpha}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1});

        expect(output).to.equal("1");
    });
    

    it("renders ADD expressions", function() {

        var html = "{{alpha + beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: 2});

        expect(output).to.equal("3");
    });


    it("renders SUBTRACT expressions", function() {

        var html = "{{alpha - beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: 2});

        expect(output).to.equal("-1");
    });


    it("renders MULTIPLY expressions", function() {

        var html = "{{alpha * beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: 2});

        expect(output).to.equal("2");
    });


    it("renders DIVIDE expressions", function() {

        var html = "{{alpha / beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 1, beta: 2});

        expect(output).to.equal("0.5");
    });


    it("renders EXPONENTIATION expressions", function() {

        var html = "{{alpha ** beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 2, beta: 8});

        expect(output).to.equal("256");
    });


    it("renders REMAINDER expressions", function() {

        var html = "{{alpha % beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: 3, beta: 2});

        expect(output).to.equal("1");
    });

});
