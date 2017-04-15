/* jshint esversion: 6 */
var Stencil = require("./index");
var request = require('sync-request');

var variables = `
    <div alpha="{{alpha.value}}" beta="{{alpha.beta.value}}">
        <div alpha="{{alpha.value}}" beta="{{alpha.beta.value}}">
            <div alpha="{{alpha.value}}" beta="{{alpha.beta.value}}">
                <div each="alpha.beta.gamma">{{this}}</div>
            </div>
        </div>
     </div>
`;

var simpleHtml = `
    <div alpha="alpha.value" beta="alpha.beta.value">
        <div alpha="alpha.value" beta="alpha.beta.value">
            <div alpha="alpha.value" beta="alpha.beta.value">
            </div>
        </div>
    </div>`;

var google = request("GET", "http://google.com").body.toString();
var wikipedia = request("GET", "https://en.wikipedia.org/wiki/Main_Page").body.toString();

var times = 1024;

var model = {
    alpha: {
        value: "alpha",
        beta: {
            value: "beta",
            gamma: [0, 2, 4, 8, 16, 32, 64, 128]
        }
    }    
};

function pad(n) {
  n = "" + n;
  while(n.length < 16) {
      n = " " + n;
  }

  return n;
}


function render(html, model, title) {

    var stencil = new Stencil(html);
    var start = Date.now();
    var totalBytes = 0;

    if (console.profile) {console.profile(title);}
    for (let i = 0, n = times; i < n; i++) {
        totalBytes += stencil.render(model).length;
    }
    if (console.profile) {console.profileEnd(title);}

    var time = Date.now() - start;
    var totalMB = totalBytes / 1000000;
        totalMB = pad(Math.round(totalMB * 10) / 10 + "MB");
    var mbPerMs = (time / totalBytes) * 1000000;
        mbPerMs = pad(Math.round(mbPerMs * 1) / 1 + "ms/MB");
    time = pad(time) + "ms";

    console.log(title, time, totalMB, mbPerMs);
}

render(simpleHtml, model, "simple   ");
render(google, model,     "google   ");
render(wikipedia, model,  "wikipedia");
render(variables, model,  "variables");
