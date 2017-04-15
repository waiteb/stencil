/* jshint esversion: 6 */
var Stencil = require("./index");
var request = require('sync-request');

var html = `
    <div alpha="{{alpha.value}}" beta="{{alpha.beta.value}}">
        <div alpha="{{alpha.value}}" beta="{{alpha.beta.value}}">
            <div alpha="{{alpha.value}}" beta="{{alpha.beta.value}}">
                <div each="alpha.beta.gamma">{{this}}</div>
            </div>
        </div>
     </div>

    <div alpha="alpha.value" beta="alpha.beta.value">
        <div alpha="alpha.value" beta="alpha.beta.value">
            <div alpha="alpha.value" beta="alpha.beta.value">
            </div>
        </div>
    </div>
`;

html = request("GET", "http://google.com").body.toString();

var times = 1024 * 8;

var stencil = new Stencil(html);

var model = {
    alpha: {
        value: "alpha",
        beta: {
            value: "beta",
            gamma: [0, 2, 4, 8, 16, 32, 64, 128]
        }
    }    
};

if (console.profile) {console.profile("stencil.render");}
console.time("x" + times);
for (let i = 0, n = times; i < n; i++) {
    let html = stencil.render(model);
}
console.timeEnd("x" + times);
if (console.profile) {console.profileEnd("stencil.render");}