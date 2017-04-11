/* jshint node: true, esversion: 6, undef: true, unused: true, jasmine: true */
var Stencil = require("../index.js");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("stencil attribute", function() {

    describe("if", function() {

        it("will render an element if its value is truthy", function() {

            var html = '<div if="true"></div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("<div></div>");
        });


        it("will not render an element if its value is falsey", function() {

            var html = '<div if="false"></div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("");
        });

    });


    describe("elseif", function() {

        it("will not render an element when the previous 'if' was truthy", function() {

            var html = '<div if="true">alpha</div> <div elseif="true">beta</div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("<div>alpha</div>");
        });
        

        it("will not render an element if its value is falsey", function() {

            var html = '<div if="false">alpha</div> <div elseif="false">beta</div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("");
        });


        it("will render an element if its value is truthy", function() {

            var html = '<div if="false">alpha</div> <div elseif="true">beta</div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("<div>beta</div>");
        });
    });
    

    describe("else", function() {

        it("will not render an element if the previous if was truthy", function() {

            var html = '<div if="true">alpha</div><div else="">beta</div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("<div>alpha</div>");
        });


        it("will not render an element if the previous elseif was truthy", function() {

            var html = '<div if="false">alpha</div><div elseif="true">beta</div><div else="">gamma</div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("<div>beta</div>");
        });
        

        it("will render an element when the previous if was falsey", function() {

            var html = '<div if="false">alpha</div><div else="">gamma</div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("<div>gamma</div>");
        });


        it("is gracious in handling elseif/else out of order", function() {

            var html = '<div else="">alpha</div><div elseif="true">gamma</div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("<div>alpha</div>");
        });        
    });


    describe("each", function() {

        it("repeats elements", function() {

            var html = '<div each="items">{{this}}</div>',
                stencil = new Stencil(html),
                output = stencil.render({items: [0, 1, 2]});

            expect(output).to.equal('<div>0</div><div>1</div><div>2</div>');
        });


        it("repeats elements recursively", function() {

            // If this works the first time, I will be very impressed with myself...
            var html = '<div each="items"><p each="items">{{this}}</p></div>',
                stencil = new Stencil(html),
                output = stencil.render({items: [{items:[0, 1, 2]},{items:[3, 4, 5]}]});

            expect(output).to.equal('<div><p>0</p><p>1</p><p>2</p></div><div><p>3</p><p>4</p><p>5</p></div>');
        });


        it("adds an index to the scope", function() {
            
            var html = '<div each="items">{{@index}}</div>',
                stencil = new Stencil(html),
                output = stencil.render({items: [0, 1, 2]});

            expect(output).to.equal('<div>0</div><div>1</div><div>2</div>');
        });
    });


    describe("scope", function() {

        it("changes the scope in the stack", function() {
            
            var html = '<div scope="alpha">{{beta}}</div>',
                stencil = new Stencil(html),
                output = stencil.render({alpha: {beta: "beta"}});

            expect(output).to.equal('<div>beta</div>');
        });

    });
});