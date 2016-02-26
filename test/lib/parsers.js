'use strict';

var expect = require('chai').expect;
var fs = require('fs');
var pr = require('path').resolve;

var parsers = require('../../lib/parsers');
var dateUtil = require('../../lib/date-util');

function responseObjectTest(fn) {
  return function () {
    expect(function () { fn() }).to.throw();
    expect(function () { fn({}) }).to.throw();
    expect(function () { fn(1234) }).to.throw();
    expect(function () { fn({ data: 'Not valid JSON' }) }).to.throw();
  }
}

describe('parsers', function () {
  describe('#station()', function () {
    var p = parsers.station;
    it('expects a { data: \'{"some JSON":"data"}\' } object', responseObjectTest(p));

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

  describe('#stationBoard', function () {
    var p = parsers.stationBoard;
    it('expects a { data: \'{"some JSON":"data"}\' } object', responseObjectTest(p));

    var berlinArrivals = {
      data: fs.readFileSync(pr(__dirname, '../data/arrivals-berlin.json')),
    };
    var berlinDepartures = {
      data: fs.readFileSync(pr(__dirname, '../data/departures-berlin.json')),
    };
    var moskvaDeparture = {
      data: fs.readFileSync(pr(__dirname, '../data/departure-moskva.json')),
    };

    it('returns an array', function () {
      expect(p(berlinDepartures)).to.be.an('array');
      expect(p(berlinArrivals)).to.be.an('array');
    });

    it('returns as many entries as there are in the input JSON', function () {
      expect(p(berlinDepartures).length).to.equal(20);
      expect(p(berlinArrivals).length).to.equal(20);
      expect(p({ data: JSON.stringify({ ArrivalBoard: { Arrival: [] } }) }).length).to.equal(0);
      expect(p({ data: JSON.stringify({ DepartureBoard: { Departure: [] } }) }).length).to.equal(0);
    });

    it('converts the "date" and "time" properties to "arrival" and "departure" Date instances as appropriate', function () {
      expect(p(berlinDepartures)[0].departure).to.be.an.instanceOf(Date);
      expect(p(berlinDepartures)[0].arrival).to.be.undefined;
      expect(p(berlinArrivals)[0].departure).to.be.undefined;
      expect(p(berlinArrivals)[0].arrival).to.be.an.instanceOf(Date);
      expect(p(berlinDepartures)[0].departure).to.deep.equal(new Date(2016, 1, 27, 12, 27));
      expect(p(berlinArrivals)[0].arrival).to.deep.equal(new Date(2016, 1, 27, 12, 9));
    });

    it('turns "stop" and "stopid" into a "station" object', function () {
      p(berlinDepartures).forEach(function (departure) {
        expect(departure.station.id).to.be.oneOf([ '8098160', '8011160' ]);
        expect(departure.station.name).to.be.oneOf([ 'Berlin Hbf', 'Berlin Hbf (tief)' ]);
        expect(departure.stop).to.be.undefined;
        expect(departure.stopid).to.be.undefined;
      });
    });

    it('has "name", "type", and "platform" properties, and "origin" or "destination" as appropriate', function () {
      p(berlinDepartures).forEach(function (departure) {
        expect(departure).to.include.keys('name', 'type', 'platform', 'destination');
      });
      p(berlinArrivals).forEach(function (arrival) {
        expect(arrival).to.include.keys('name', 'type', 'platform', 'origin');
      });
    });

    it('also works when the input "Departure" or "Arrival" is a single object rather than an array', function () {
      var parsed = p(moskvaDeparture);
      expect(parsed.length).to.equal(1);
      var dep = parsed[0];
      expect(dep.name).to.equal('EN 23');
      expect(dep.station).to.deep.equal({ name: 'Moskva Belorusskaja', id: '2000058' });
    });

    it('sets all the properties correctly', function () {
      var input = {
        name: 'ICE 1234',
        type: 'ICE',
        stopid: '01234567',
        stop: 'Earth',
        time: '13:37',
        date: '2016-02-29',
        direction: 'Jupiter',
        track: '42',
      };
      var output = p({ data: JSON.stringify({ DepartureBoard: { Departure: [input] } }) })[0];

      expect(output.name).to.equal(input.name);
      expect(output.type).to.equal(input.type);
      expect(output.station.name).to.equal(input.stop);
      expect(output.station.id).to.equal(input.stopid);
      expect(output.destination).to.equal(input.direction);
      expect(output.platform).to.equal(input.track);
      expect(output.departure).to.deep.equal(dateUtil.parse(input.date, input.time));
    });
  });
});
