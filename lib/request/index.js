'use strict';

if (typeof BROWSER !== 'undefined') module.exports = require('./browser');
else module.exports = require('./node');
