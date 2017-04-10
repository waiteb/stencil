/* jshint esversion: 6, expr: true */
var Stencil = require("../");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("stencil element", function() {

    describe("x", function() {

        it("doesn't render its tag", function() {

            var html = "<x>alpha</x>",
                stencil = new Stencil(html),
                output = stencil.render();
            
            expect(output).to.equal("alpha");
        });

    });
});