var Scratchpad = require("./scratchpad.js");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("scratchpad", function() {

    it("exists", function() {
        expect(Scratchpad).to.be.a("function");
    });

    it("should be constructed with a root node", function() {

        var document = {},
            scratchpad = new Scratchpad(document);

        expect(scratchpad.node).to.equal(document);

    });

    it("has follows an api", function() {

        var scratchpad = new Scratchpad();

        expect(scratchpad.globals).to.be.an("object");
        expect(scratchpad.scope).to.be.an("object");
        expect(scratchpad.stack).to.be.an("object");
        expect(scratchpad.push).to.be.a("function");
        expect(scratchpad.pop).to.be.a("function");

    });

    it("can reference the current node in the stack", function() {

        var document = {document: true},
            node = {node: true},
            scratchpad = new Scratchpad(document);
        
        // Adding a new node to the stack should 
        // change the current node:
        scratchpad.push(node);
        expect(scratchpad.node).to.equal(node);

        // Poppping the stack should restore the previous node:
        scratchpad.pop();
        expect(scratchpad.node).to.equal(document);
    });


    it("can reference the parent node in the stack", function() {

        var document = {document: true},
            node = {node: true},
            scratchpad = new Scratchpad(document);

        // Initially we should have no parent:
        expect(scratchpad.parent).to.equal(undefined);

        // Adding a new node to the stack should 
        // change the parent node:
        scratchpad.push(node);
        expect(scratchpad.parent.node).to.equal(document);

        // Poppping the stack should restore the previous parent:
        scratchpad.pop();
        expect(scratchpad.parent).to.equal(undefined);
    });

    it("can store values in the stack", function() {

        var document = {},
            node,
            scratchpad = new Scratchpad(document);
        
        // Put a value onto the stack, and 
        // push a new node onto the stack:
        scratchpad.stack.alpha = "one";
        scratchpad.push(node);

        // Since we're on a new node, the stack should be empty:
        expect(scratchpad.stack).to.deep.equal({});

        // After adding a new property, and popping the stack...
        scratchpad.stack.alpha = "two";
        scratchpad.pop();

        // We should be back to our original value:
        expect(scratchpad.stack.alpha).to.equal("one");
    });


    it("can store values in the active scope", function() {

        var scratchpad = new Scratchpad();

        // Put a value onto the scope, and 
        // push a new node onto the stack:
        scratchpad.scope.alpha = "one";
        scratchpad.push();

        // The previous node should still be in scope:
        expect(scratchpad.scope).to.deep.equal({alpha: "one"});

        // After modifying the first value, adding a new value, 
        // then popping the stack...
        scratchpad.scope.alpha = "two";
        scratchpad.scope.beta = "one";
        scratchpad.pop();

        // The second value should be gone, and the 
        // first value should be unchanged:
        expect(scratchpad.scope).to.deep.equal({alpha: "one"});
    });

});