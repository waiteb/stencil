#!/bin/sh
mkdir -p dist
browserify index.js -o ./dist/stencil.js -r ./lib/stencil.js:stencil
browserify --debug index.js -o ./dist/stencil.dev.js -r ./lib/stencil.js:stencil
