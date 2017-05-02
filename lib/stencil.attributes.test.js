/* jshint esversion: 6, expr: true */
var Stencil = require("../");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("stencil attribute", function() {

    describe("if", function() {

        it("will prevent an element from rendering if the value is falsey", function() {

            var html = '<div if="false"></div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("");
        });


        it("will allow an element to render if the value is truthy", function() {

            var html = '<div if="false"></div>',
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("");
        });

    });


    describe("each", function() {

        it("repeats elements", function() {

            var html = '<div each="items">{{this}}</div>'
                stencil = new Stencil(html),
                output = stencil.render({items: [0, 1, 2]});

            expect(output).to.equal('<div>0</div><div>1</div><div>2</div>');
        });

        it("repeats elements recursively", function() {

            // If this works the first time, I will be very impressed with myself...
            var html = '<div each="items"><p each="items">{{this}}</p></div>'
                stencil = new Stencil(html),
                output = stencil.render({items: [{items:[0, 1, 2]},{items:[3, 4, 5]}]});

            expect(output).to.equal('<div><p>0</p><p>1</p><p>2</p></div><div><p>3</p><p>4</p><p>5</p></div>');
        });
    });
});