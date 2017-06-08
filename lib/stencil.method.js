
function StencilMethod(context, method) {
    
    // Create a proxy method that will call the
    // original in the correct context:
    StencilMethod.proxies.push(function() {
        return method.apply(context, arguments);
    });

    this.index = StencilMethod.proxies.length - 1;
    this.script = "StencilProxy[" + this.index  + "](event);";
}


StencilMethod.prototype.toString = function() {
    return this.script;
};

StencilMethod.proxies = [];


// Publish the proxies globally in the browser:
if (typeof window === "object") {
    window.StencilProxy = StencilMethod.proxies;
}

module.exports = StencilMethod;