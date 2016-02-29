'use strict';

/* global Promise */

module.exports = function request(url) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    var protocol = url.split(':').shift().toLowerCase();
    if (protocol !== 'https' && protocol !== 'http') {
      throw new Error('Unsupported protocol (' + protocol + ')');
    }

    req.open('GET', url, true);

    req.onload = function () {
      resolve({ data: req.responseText });
    }

    req.onerror = reject;

    req.send();
  });
}
