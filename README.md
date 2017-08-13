# JS13K 2017 boilerplate

* includes a pico8-like framebuffer and graphics engine [game zero](https://rybar.github.io/gamezero)

* there's a bit of ugliness involving uglify to work with es6 code in this setup; I manually replaced uglifyJS with uglify-es since the API is compatible. After running npm install, you'll have to manually copy the contents of node_modules/uglify-es and replace the contents of node_modules/grunt-contrib-uglify/node_modules/uglify-js.

* I've currently left in sonant-x as my sound creator, but it brings the zip up to around 6k.
