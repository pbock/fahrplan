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
    var testDataWithAPI = {
      data: testData.data,
      api: {
        departure: { find: function (id, date) { return 'findDeparture' + id + date } },
        arrival: { find: function (id, date) { return 'findArrival' + id + date } },
      },
    };

    it('returns an object with "stations" and "places" arrays', function () {
      var parsed = p(berlinData);
      expect(parsed).to.include.keys('stations', 'places');
      expect(parsed.stations).to.be.an('array');
      expect(parsed.places).to.be.an('array');
    });

    it('returns as many stations and coordinates as passed in the JSON', function () {
      var parsed = p(berlinData);
      expect(parsed.stations.length).to.equal(9);
      expect(parsed.places.length).to.equal(41);
    });

    it('converts { lat <String>, lon <String> } to { latitude <Number>, longitude <Number> }', function () {
      var parsed = p(testData);
      var stop = parsed.stations[0];
      expect(stop.latitude).to.be.a('number');
      expect(stop.longitude).to.be.a('number');
      expect(stop.latitude).to.equal(3.141592);
      expect(stop.longitude).to.equal(-42.2);
    });

    it('leaves the "name", "type" and "id" properties intact', function () {
      var parsed = p(testData);
      var stop = parsed.stations[0];
      expect(stop.name).to.equal('Test station 1');
      expect(stop.id).to.equal('01234567')
      expect(stop.type).to.be.undefined;
    });

    it('also works when the input "StopLocation"/"CoordLocation" is a single object rather than an array', function () {
      // These are returned when searching for a station ID rather than a string
      var parsed = p(searchByIdData);
      expect(parsed.stations).to.be.an('array');
      expect(parsed.places).to.be.an('array');
      expect(parsed.stations[0].name).to.equal('Berlin Hbf');
    });

    it('also works when the input "StopLocation"/"CoordLocation" is undefined', function () {
      var parsed = p({ data: JSON.stringify({ LocationList: {} })});
      expect(parsed.stations).to.deep.equal([]);
      expect(parsed.places).to.deep.equal([]);
    });

    it('adds "departure.find" and "arrival.find" methods if an API reference was provided', function () {
      var parsed = p(testDataWithAPI);
      expect(parsed.stations[0].departure.find).to.be.a('function');
      expect(parsed.stations[0].arrival.find).to.be.a('function');
      expect(parsed.stations[0].departure.find('foo')).to.equal('findDeparture01234567foo');
      expect(parsed.stations[0].arrival.find('bar')).to.equal('findArrival01234567bar');
    });
  });

  describe('#stationBoard()', function () {
    var p = parsers.stationBoard;
    it('expects a { data: \'{"some JSON":"data"}\' } object', responseObjectTest(p));

    var berlinArrivals = {
      data: fs.readFileSync(pr(__dirname, '../data/arrivals-berlin.json')),
    };
    var berlinArrivalsWithAPI = {
      data: fs.readFileSync(pr(__dirname, '../data/arrivals-berlin.json')),
      api: { itinerary: { get: function (url) { return 'getItinerary' + url } } },
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

    it('adds an "itinerary.get" method if request reference was provided', function () {
      var arrivals = p(berlinArrivalsWithAPI);
      arrivals.forEach(function (arrival) {
        expect(arrival.itinerary.get).to.be.a('function');
        expect(arrival.itinerary.get()).to.match(/^getItineraryhttp/);
      });
    });
  });

  describe('#itinerary()', function () {
    var p = parsers.itinerary;
    it('expects a { data: \'{"some JSON":"data"}\' } object', responseObjectTest(p));

    var ic142 = { data: fs.readFileSync(pr(__dirname, '../data/itinerary-ic142.json')).toString() };
    var simpleItinerary = {
      Stops: {
        Stop: [
          {
            name: 'First stop',
            id: '08',
            lon: '12.34',
            lat: '-87.65',
            routeIdx: '0',
            depTime: '00:00',
            depDate: '2020-05-05',
          },
          {
            name: 'Last stop',
            id: '09',
            lon: '23.45',
            lat: '-76.54',
            routeIdx: '1',
            arrTime: '13:00',
            arrDate: '2020-05-05',
          },
        ],
      },
      Names: {
        Name: {
          name: 'IC 123',
          routeIdxFrom: '0',
          routeIdxTo: '1',
        },
      },
      Types: {
        Type: {
          type: 'IC',
          routeIdxFrom: '0',
          routeIdxTo: '1',
        },
      },
      Operators: {
        Operator: {
          name: 'NASA',
          routeIdxFrom: '0',
          routeIdxTo: '1',
        },
      },
      Notes: {
        Note: {
          mostProperties: 'will just get passed straight through',
          except: '$, which becomes',
          $: 'description',
        },
      },
    };
    var simple = { data: JSON.stringify({ JourneyDetail: simpleItinerary }) };
    var simpleWithApi = {
      data: JSON.stringify({ JourneyDetail: simpleItinerary }),
      api: {
        departure: { find: function (id, date) { return 'findDeparture' + id + date } },
        arrival: { find: function (id, date) { return 'findArrival' + id + date } },
      },
    };

    it('returns an object with "stops", "names", "types", "operators" and "notes" arrays', function () {
      var itinerary = p(ic142);
      expect(itinerary.stops).to.be.an('array');
      expect(itinerary.names).to.be.an('array');
      expect(itinerary.types).to.be.an('array');
      expect(itinerary.operators).to.be.an('array');
      expect(itinerary.notes).to.be.an('array');
    });

    it('returns as many "stops" as there are in the input', function () {
      var itinerary = p(ic142);
      expect(itinerary.stops.length).to.equal(JSON.parse(ic142.data).JourneyDetail.Stops.Stop.length);
    });

    it('converts the "stops" correctly', function () {
      var itinerary = p(simple);
      expect(itinerary.stops.length).to.equal(2);
      itinerary.stops.forEach(function (output, i) {
        var input = simpleItinerary.Stops.Stop[i];
        expect(output.station.name).to.equal(input.name);
        expect(output.station.id).to.equal(input.id);
        expect(output.station.latitude).to.equal(parseFloat(input.lat));
        expect(output.station.longitude).to.equal(parseFloat(input.lon));
        expect(output.index).to.equal(parseInt(input.routeIdx));
        if (input.arrTime) {
          expect(output.arrival).to.deep.equal(dateUtil.parse(input.arrDate, input.arrTime));
        }
        if (input.depTime) {
          expect(output.departure).to.deep.equal(dateUtil.parse(input.depDate, input.depTime));
        }
      })
    });

    it('cleans up the metadata', function () {
      var itinerary = p(simple);
      expect(itinerary.names[0]).to.deep.equal({ name: 'IC 123', fromIndex: 0, toIndex: 1 });
      expect(itinerary.types[0]).to.deep.equal({ type: 'IC', fromIndex: 0, toIndex: 1 });
      expect(itinerary.operators[0]).to.deep.equal({ name: 'NASA', fromIndex: 0, toIndex: 1 });
      expect(itinerary.notes[0]).to.deep.equal({
        mostProperties: 'will just get passed straight through',
        except: '$, which becomes',
        description: 'description',
      });
    });


    it('adds "departures.get" and "arrivals.get" methods if an API reference was provided', function () {
      var parsed = p(simpleWithApi);
      expect(parsed.stops[0].station.departure.find('foo')).to.equal('findDeparture08foo');
      expect(parsed.stops[0].station.arrival.find('bar')).to.equal('findArrival08bar');
      expect(parsed.stops[1].station.departure.find('foo')).to.equal('findDeparture09foo');
      expect(parsed.stops[1].station.arrival.find('bar')).to.equal('findArrival09bar');
    });

  });
});
