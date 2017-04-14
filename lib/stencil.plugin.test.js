/* jshint node: true, esversion: 6, undef: true, unused: true, jasmine: true */
var Plugin = require("./stencil.plugin.js");
var chai = require("chai");
var spies = require("chai-spies"); chai.use(spies);
var expect = chai.expect;

describe("Plugin", function() {

    it("exists", function() {
        expect(Plugin).to.be.a("function");
    });


    it("can be constructed with a name", function() {
       var plugin = new Plugin("alpha");
       expect(plugin.name).to.equal("alpha");
    });


    it("can be constructed with additional properties", function() {
        var plugin = new Plugin("alpha", {beta: "value"});
        expect(plugin.beta).to.equal("value");
    });


    it("follows an API", function() {
        var plugin = new Plugin("alpha");
        expect(plugin.onRenderAttribute).to.be.a("function");
        expect(plugin.onRenderElement).to.be.a("function");
    });

});