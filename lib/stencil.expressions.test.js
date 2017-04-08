var Stencil = require("../");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("stencil expressions", function() {

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

    it("renders UNDEFINED member expressions as empty strings", function() {

        var html = "{{alpha.beta}}",
            stencil = new Stencil(html);
            output = stencil.render({alpha: {}});

        expect(output).to.equal("");
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