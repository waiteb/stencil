/* jshint node: true, esversion: 6, undef: true, unused: true, jasmine: true */
/* global StencilProxy */
var StencilMethod = require("./stencil.method.js");
var chai = require("chai");
var expect = chai.expect;

describe("StencilMethod", function() {

    afterEach(function() {
        StencilMethod.proxies = [];
    });


    it("exists", function() {
        expect(StencilMethod).to.be.a("function");
    });


    it ("creates a proxy method", function() {

        var context = {
            method: function(a, b, c) {
                return this.value + a + b + c;
            },
            value: "alpha"
        },
        instance = new StencilMethod(context, context.method),
        proxy = StencilMethod.proxies[instance.index];
        
        expect(proxy).to.be.a("function");
        expect(proxy(1, 2, 3)).to.equal("alpha123");
    });

    it("only adds one proxy entry per method", function() {
        
    });

});