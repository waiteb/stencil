/* jshint node: true, esversion: 6, undef: true, unused: true, jasmine: true */
var Stencil = require("../index.js");
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

    describe("stencil", function() {

        it("renders a substencil by name", function() {

            var rootHtml = '<stencil name="{{name}}"></stencil>',
                stencil = new Stencil(rootHtml),
                html =  '<p>alpha</p>',
                substencil = new Stencil(html),
                output;

            // Add the substencil to the root:
            stencil.include({
                alpha: substencil   
            });

            // Rendering the root stencil should include the substencil:
            output = stencil.render({name: "alpha"});
            expect(output).to.equal(html);
        });

        it("finds inherited substencils", function() {
            
            var parentHtml = '<stencil name="child"></stencil>',
                childHtml = '<stencil name="grandchild"></stencil>',
                grandchildHtml = '<p></p>',
            
                parent = new Stencil(parentHtml),
                child = new Stencil(childHtml),
                grandchild = new Stencil(grandchildHtml),
                
                output;

            // Add the substencil to the root:
            parent.include({
                child: child,
                grandchild: grandchild
            });

            // The child doesn't have a grandchild stencil, but it should
            // find it from the parent:
            output = parent.render();
            expect(output).to.equal(grandchildHtml);
        });

        it("renders a missing template", function() {

            var rootHtml = '<stencil name="alpha"></stencil>',
                stencil = new Stencil(rootHtml),
                output;

            // Rendering the root stencil should include the substencil:
            output = stencil.render();
            expect(output).to.equal("<!-- missing substencil: alpha -->");
        });

    });    
});