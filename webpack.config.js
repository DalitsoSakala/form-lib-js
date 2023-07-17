
const path = require("path")

module.exports = {
  mode:'production',
  entry : {
    commonjs:"./build/commonjs/index.js",
    es6:"./build/es6/index.js",
  },
  output : {
    path: path.resolve(__dirname, "dist"),
    filename: "index-[name].js",
    libraryTarget: 'umd',
    globalObject: 'this',
  }
}
