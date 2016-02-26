'use strict';

var expect = require('chai').expect;
var moment = require('moment');

var dateUtil = require('../../lib/date-util');

describe('dateUtil', function () {
  describe('#formatDate', function () {
    var fd = dateUtil.formatDate;
    it('converts a Date object to a string in YYYY-MM-DD notation', function () {
      expect(fd(new Date())).to.be.a('string');
      expect(fd(new Date(2015, 0, 1))).to.equal('2015-01-01');
      expect(fd(new Date(2016, 11, 24))).to.equal('2016-12-24');
    });

    it('works with timestamps too', function () {
      var timestamp = new Date(1850, 5, 21).valueOf();
      expect(fd(timestamp)).to.equal('1850-06-21');
    });

    it('works with moment objects too', function () {
      expect(fd(moment({ year: 2020, month: 3, day: 15 }))).to.equal('2020-04-15');
    });
  });

  describe('#formatTime', function () {
    var ft = dateUtil.formatTime;
    it('converts a Date object to a string in HH:MM notation', function () {
      expect(ft(new Date(2016, 1, 25, 18, 0))).to.equal('18:00');
      expect(ft(new Date(2017, 0, 1))).to.equal('00:00');
    });

    it('works with timestamps too', function () {
      var timestamp = new Date(2017, 0, 1, 13, 37).valueOf();
      expect(ft(timestamp)).to.equal('13:37');
    });

    it('works with moment objects too', function () {
      expect(ft(moment({ hour: 23, minute: 42 }))).to.equal('23:42');
    });
  })
});
