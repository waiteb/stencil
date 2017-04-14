var Stencil = require("./index");
var html = `
    <div alpha="123" beta="123" gamma="123">
        <div alpha="123" beta="123" gamma="123">
            <div alpha="123" beta="123" gamma="123"></div>
            </div>
        </div>
`;
var times = 1024 * 8;

var stencil = new Stencil(html);

console.profile("stencil.render");
console.time("x" + times);
for (let i = 0, n = times; i < n; i++) {
    let html = stencil.render();
}
console.timeEnd("x" + times);
console.profileEnd("stencil.render");