'use strict';

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;

var Fahrplan = require('..');
var config = require('./config');

describe('Fahrplan', function () {
  it('is a function', function () {
    expect(Fahrplan).to.be.a('function');
  });

  it('expects an API key as its argument', function () {
    expect(function () { Fahrplan() }).to.throw();
    expect(function () { Fahrplan('topsecret') }).not.to.throw();
  });

  it('returns an object with "station.find", "departures.get" and "arrivals.get" methods', function () {
    var fahrplan = new Fahrplan('topsecret');
    expect(fahrplan.station.find).to.be.a('function');
    expect(fahrplan.departure.find).to.be.a('function');
    expect(fahrplan.arrival.find).to.be.a('function');
  });
});

describe('fahrplan', function () {
  var fahrplan = Fahrplan(config.key);
  var berlinId;

  describe('#station.find()', function () {
    it('resolves with an object of "stations" and "places"', function (done) {
      fahrplan.station.find('Berlin')
        .then(function (result) {
          expect(result.stations).to.be.an('array');
          expect(result.places).to.be.an('array');

          expect(result.stations[0].name).to.equal('Berlin Hbf');
          expect(result.stations[0].departure.find).to.be.a('function');
          expect(result.stations[0].arrival.find).to.be.a('function');
          done();

          berlinId = result.stations[0].id;
        })
        .catch(done);
    });
  });

  describe('#station.get()', function () {
    it('resolves with the first result of the equivalent `station.find()` query', function (done) {
      Promise.all([
        fahrplan.station.find('Berlin Hbf'),
        fahrplan.station.get('Berlin Hbf'),
      ])
      .then(function (results) {
        var find = results[0], get = results[1];
        // Can't use deep.equal because departure.find/arrival.find
        // aren't equal
        expect(find.stations[0].id).to.equal(get.id);
        expect(find.stations[0].name).to.equal(get.name);
        expect(find.stations[0].latitude).to.equal(get.latitude);
        expect(find.stations[0].longitude).to.equal(get.longitude);
        done();
      })
      .catch(done);
    });

    it('resolves with null if no station was found', function (done) {
      fahrplan.station.get('TESTINGWHATHAPPENSIFQUERYISSTUPID')
        .then(function (result) {
          expect(result).to.be.null;
          done();
        })
        .catch(done);
    });
  });

  describe('#departure.find()', function () {
    it('resolves with an array of "departures"', function (done) {
      fahrplan.departure.find(berlinId)
        .then(function (departures) {
          expect(departures).to.have.length.above(0);
          departures.forEach(function (departure) {
            expect(departure).to.contain.keys('name', 'type', 'station', 'departure', 'destination');
            expect(departure.departure).to.be.an.instanceOf(Date);
          });
          done();
        })
        .catch(done);
    });

    it('returns the same results for station IDs and station names', function (done) {
      Promise.all([
        fahrplan.station.get('B')
          .then(function (station) { return fahrplan.departure.find(station.id) }),
        fahrplan.departure.find('B'),
      ])
      .then(function (results) {
        var byName = results[0];
        var byId = results[1];
        // Can't use deep.equal because itinerary.get aren't equal
        var keys = [ 'name', 'type', 'station', 'departure', 'destination', 'platform' ];
        byName.forEach(function (station, i) {
          keys.forEach(function (key) {
            expect(byName[i][key]).to.deep.equal(byId[i][key]);
          });
        });
        done();
      })
      .catch(done);
    });

    it('accepts a date as a second argument', function (done) {
      var date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      fahrplan.departure.find(berlinId, date)
        .then(function (departures) {
          expect(departures).to.have.length.above(0);
          departures.forEach(function (departure) {
            expect(departure.departure.valueOf() >= date.valueOf()).to.be.true;
          });
          done();
        })
        .catch(done);
    });
  });

  describe('#arrival.find()', function () {
    it('resolves with an array of "arrivals"', function (done) {
      fahrplan.arrival.find(berlinId)
        .then(function (arrivals) {
          expect(arrivals).to.have.length.above(0);
          arrivals.forEach(function (arrival) {
            expect(arrival).to.contain.keys('name', 'type', 'station', 'arrival', 'origin');
            expect(arrival.arrival).to.be.an.instanceOf(Date);
          });
          done();
        })
        .catch(done);
    });

    it('returns the same results for station IDs and station names', function (done) {
      Promise.all([
        fahrplan.station.get('B')
          .then(function (station) { return fahrplan.arrival.find(station.id) }),
        fahrplan.arrival.find('B'),
      ])
      .then(function (results) {
        var byName = results[0];
        var byId = results[1];
        // Can't use deep.equal because itinerary.get aren't equal
        var keys = [ 'name', 'type', 'station', 'arrival', 'origin', 'platform' ];
        byName.forEach(function (station, i) {
          keys.forEach(function (key) {
            expect(byName[i][key]).to.deep.equal(byId[i][key]);
          });
        });
        done();
      })
      .catch(done);
    });

    it('accepts a date as a second argument', function (done) {
      var date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      fahrplan.arrival.find(berlinId, date)
        .then(function (arrivals) {
          expect(arrivals).to.have.length.above(0);
          arrivals.forEach(function (arrival) {
            expect(arrival.arrival.valueOf() >= date.valueOf()).to.be.true;
          });
          done();
        })
        .catch(done);
    });
  });

  it('returns chainable promises', function (done) {
    fahrplan.station.find('Berlin')
      .then(function (stations) { return stations.stations[0].departure.find() })
      .then(function (departures) { return departures[0].itinerary.get() })
      .then(function (itinerary) {
        expect(itinerary.stops).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});
