'use strict';
var webpack = require('webpack');
var pr = require('path').resolve;

var definePlugin = new webpack.DefinePlugin({
  BROWSER: true,
});

module.exports = {
  entry: '.',
  output: {
    library: 'Fahrplan',
    libraryTarget: 'umd',
    path: pr(__dirname, 'dist/'),
    filename: 'fahrplan.js',
  },

  plugins: [definePlugin],
};
