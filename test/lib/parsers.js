'use strict';

var expect = require('chai').expect;
var fs = require('fs');
var pr = require('path').resolve;

var parsers = require('../../lib/parsers');

describe('parsers', function () {
  describe('#station()', function () {
    var p = parsers.station;
    it('expects a { data: \'{"some JSON":"data"}\' } object', function () {
      expect(function () { p() }).to.throw();
      expect(function () { p({}) }).to.throw();
      expect(function () { p(1234) }).to.throw();
      expect(function () { p({ data: 'Not valid JSON' }) }).to.throw();
    });

    var berlinData = {
      data: fs.readFileSync(pr(__dirname, '../data/station-berlin.json')).toString(),
    };
    var searchByIdData = {
      data: fs.readFileSync(pr(__dirname, '../data/station-008011160.json')).toString(),
    };
    var testData = {
      data: JSON.stringify({
        LocationList: {
          StopLocation: [
            { name: 'Test station 1', lat: '3.141592', lon: '-42.2', id: '01234567' },
          ],
          CoordLocation: [],
        },
      }),
    };

    it('returns an object with "stops" and "places" arrays', function () {
      var parsed = p(berlinData);
      expect(parsed).to.include.keys('stops', 'places');
      expect(parsed.stops).to.be.an('array');
      expect(parsed.places).to.be.an('array');
    });

    it('returns as many stations and coordinates as passed in the JSON', function () {
      var parsed = p(berlinData);
      expect(parsed.stops.length).to.equal(9);
      expect(parsed.places.length).to.equal(41);
    });

    it('converts { lat <String>, lon <String> } to { latitude <Number>, longitude <Number> }', function () {
      var parsed = p(testData);
      var stop = parsed.stops[0];
      expect(stop.latitude).to.be.a('number');
      expect(stop.longitude).to.be.a('number');
      expect(stop.latitude).to.equal(3.141592);
      expect(stop.longitude).to.equal(-42.2);
    });

    it('leaves the "name", "type" and "id" properties intact', function () {
      var parsed = p(testData);
      var stop = parsed.stops[0];
      expect(stop.name).to.equal('Test station 1');
      expect(stop.id).to.equal('01234567')
      expect(stop.type).to.be.undefined;
    });

    it('also works when the input "StopLocation"/"CoordLocation" is a single object rather than an array', function () {
      // These are returned when searching for a station ID rather than a string
      var parsed = p(searchByIdData);
      expect(parsed.stops).to.be.an('array');
      expect(parsed.places).to.be.an('array');
      expect(parsed.stops[0].name).to.equal('Berlin Hbf');
    });

    it('also works when the input "StopLocation"/"CoordLocation" is undefined', function () {
      var parsed = p({ data: JSON.stringify({ LocationList: {} })});
      expect(parsed.stops).to.deep.equal([]);
      expect(parsed.places).to.deep.equal([]);
    });
  });
});
