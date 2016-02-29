'use strict';

var Promise = require('es6-promise').Promise;
var https = require('https');
var http = require('http');

module.exports = function request(url) {
  return new Promise(function (resolve, reject) {
    var protocol = url.toLowerCase().split(':').shift();
    var get;
    if (protocol === 'https') get = https.get;
    else if (protocol === 'http') get = http.get;
    else throw new Error('Unsupported protocol (' + protocol + ')');

    var req = get(url, function (res) {
      var data = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () {
        resolve({ data: data });
      });
    });

    req.on('error', reject);
  });
}
