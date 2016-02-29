'use strict';

// Minimalistic re-implementation of querystring.stringify

module.exports = {
  stringify: function (params, separator, equals) {
    if (!separator) separator = '&';
    if (!equals) equals = '=';

    var output = [];

    function serialize(key, value) {
      return encodeURIComponent(key) + equals + encodeURIComponent(value);
    }

    var keys = Object.keys(params);
    keys.forEach(function (key) {
      var value = params[key];

      if (Array.isArray(value)) {
        value.forEach(function (arrayValue) {
          output.push(serialize(key, arrayValue));
        });
      } else {
        output.push(serialize(key, value));
      }
    });

    return output.join(separator);
  },
}
