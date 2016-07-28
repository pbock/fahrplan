'use strict';
var webpack = require('webpack');
var pr = require('path').resolve;

module.exports = {
  entry: '.',
  output: {
    library: 'Fahrplan',
    libraryTarget: 'umd',
    path: pr(__dirname, '../dist/'),
    filename: 'fahrplan.js',
  },
  node: {
    http: false,
    https: false,
  },
  externals: {
    'es6-promise': true,
  },
  plugins: [],
};
