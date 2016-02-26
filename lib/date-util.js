'use strict';

function zeroPad(number, length) {
  if (length === undefined) length = 2;
  number = '' + number;
  while (number.length < length) number = '0' + number;
  return number;
}

module.exports = {
  formatDate: function (input) {
    input = new Date(input);
    var dd = zeroPad(input.getDate());
    var mm = zeroPad(input.getMonth() + 1);
    var yyyy = zeroPad(input.getFullYear(), 4);
    return [ yyyy, mm, dd ].join('-');
  },

  formatTime: function (input) {
    input = new Date(input);
    var hh = zeroPad(input.getHours());
    var mm = zeroPad(input.getMinutes());
    return hh + ':' + mm;
  },

  parse: function (date, time) {
    date = date.split('-');
    time = time.split(':');

    var year = parseInt(date[0], 10);
    var month = parseInt(date[1], 10) - 1;
    var day = parseInt(date[2], 10);

    var hour = parseInt(time[0], 10);
    var minute = parseInt(time[1], 10);

    return new Date(year, month, day, hour, minute);
  },
}
