/* jshint node: true, esversion: 6, undef: true, unused: true, jasmine: true */
var Scratchpad = require("./scratchpad.js");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("scratchpad", function() {

    it("exists", function() {
        expect(Scratchpad).to.be.a("function");
    });


    it("may be constructed with a root scope", function() {

        var rootScope = {alpha: {}},
            scratchpad = new Scratchpad(rootScope);

        expect(scratchpad.scope.alpha).to.equal(rootScope.alpha);

    });


    it("has follows an api", function() {
        var scratchpad = new Scratchpad();
        expect(scratchpad.scope).to.be.an("object");
        expect(scratchpad.element).to.be.an("object");
        expect(scratchpad.push).to.be.a("function");
        expect(scratchpad.pop).to.be.a("function");
    });


    it("can reference the current node in the stack", function() {

        var model = {},
            document = {document: true},
            node = {node: true},
            scratchpad = new Scratchpad();
        
        // Initialize the scratchpad with its first node...
        scratchpad.push(document, model, null);
        expect(scratchpad.node).to.equal(document);

        // ...then add a new node:
        scratchpad.push(node, model, null);
        expect(scratchpad.node).to.equal(node);

        // Poppping the stack should restore the previous node:
        scratchpad.pop();
        expect(scratchpad.node).to.equal(document);
    });


    it("can reference the parent element in the stack", function() {

        var scratchpad = new Scratchpad();

        scratchpad.element.alpha = "alpha";
        scratchpad.push();
        
        expect(scratchpad.element.alpha).to.equal(undefined);
        expect(scratchpad.parent.alpha).to.equal("alpha");
    });


    it("can store values in the current element", function() {

        var document = {},
            node,
            scratchpad = new Scratchpad(document);
        
        // Put a value onto the stack, and 
        // push a new node onto the stack:
        scratchpad.element.alpha = "one";
        scratchpad.push(node);

        // Since we're on a new node, the stack should be empty:
        expect(scratchpad.element.alpha).to.equal(undefined);

        // After adding a new property, and popping the stack...
        scratchpad.element.alpha = "two";
        scratchpad.pop();

        // We should be back to our original value:
        expect(scratchpad.element.alpha).to.equal("one");
    });


    it("can store values in the active scope", function() {

        var scratchpad = new Scratchpad();

        scratchpad.push();

        // Put a value onto the scope:
        scratchpad.scope.alpha = "one";
        expect(scratchpad.scope.alpha).to.equal("one");

        // After creating a new scope, the old value 
        // should still be there:
        scratchpad.newScope();
        expect(scratchpad.scope.alpha).to.equal("one");

        // If we modify/add some new values, and then pop the stack...
        scratchpad.scope.alpha = "two";
        scratchpad.scope.beta = "one";
        scratchpad.pop();

        // The new value should be gone, and the 
        // first value should be unchanged:
        expect(scratchpad.scope.alpha).to.equal("one");
        expect(scratchpad.scope.beta).to.equal(undefined);
    });


    it("can store values in the root scope", function() {

        var scratchpad = new Scratchpad();

        // A value placed in the root scope is available to the current scope:
        scratchpad.root.alpha = "alphaValue";
        expect(scratchpad.scope.alpha).to.equal("alphaValue");

        // After creating a new state, the value should still be there:
        scratchpad.push({});
        expect(scratchpad.scope.alpha).to.equal("alphaValue");

        // A value placed in the root scope is *still* available to the current scope:
        scratchpad.root.beta = "betaValue";
        expect(scratchpad.scope.beta).to.equal("betaValue");

        // After returning to the previous state, our two value are still there:
        scratchpad.pop();
        expect(scratchpad.scope.alpha).to.equal("alphaValue");
        expect(scratchpad.scope.beta).to.equal("betaValue");
    });
});