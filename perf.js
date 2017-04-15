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



var start = Date.now();
var totalBytes = 0;

if (console.profile) {console.profile("stencil.render");}
for (let i = 0, n = times; i < n; i++) {
    totalBytes += stencil.render(model).length;
}
if (console.profile) {console.profileEnd("stencil.render");}

var end = Date.now() - start;
console.log(end + "ms", Math.floor(totalBytes / 1000000) + "MB", Math.floor((end / totalBytes) * 1000000) + "ms/MB");
