'use strict';

var Promise = require('es6-promise').Promise;

module.exports = function request(url) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);

    req.onload = function () {
      resolve({ data: req.responseText });
    }

    req.onerror = reject;

    req.send();
  });
}
