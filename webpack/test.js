'use strict';
var webpack = require('webpack');
var pr = require('path').resolve;

var definePlugin = new webpack.DefinePlugin({
  BROWSER: true,
});

module.exports = {
  entry: [
    // Most of the library modules are already tested in node.js. Only test
    // the actual API and modules with browser-specific code
    'mocha!./test/index.js', // API
    'mocha!./test/lib/request.js', // is browser-specific
  ],
  output: {
    path: pr(__dirname, '../test/browser/'),
    filename: 'test.js',
  },

  plugins: [definePlugin],
};
