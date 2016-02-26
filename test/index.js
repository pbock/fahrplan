'use strict';

var expect = require('chai').expect;
var Promise = require('es6-promise');

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
    expect(fahrplan.departures.get).to.be.a('function');
    expect(fahrplan.arrivals.get).to.be.a('function');
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
          expect(result.stations[0].departures.get).to.be.a('function');
          expect(result.stations[0].arrivals.get).to.be.a('function');
          done();

          berlinId = result.stations[0].id;
        })
        .catch(done);
    });
  });

  describe('#departures.get()', function () {
    it('resolves with an array of "departures"', function (done) {
      fahrplan.departures.get(berlinId)
        .then(function (departures) {
          departures.forEach(function (departure) {
            expect(departure).to.contain.keys('name', 'type', 'station', 'departure', 'destination');
            expect(departure.departure).to.be.an.instanceOf(Date);
          });
          done();
        })
        .catch(done);
    });
  });

  describe('#arrivals.get()', function (done) {
    it('resolves with an array of "arrivals"', function (done) {
      fahrplan.arrivals.get(berlinId)
        .then(function (arrivals) {
          arrivals.forEach(function (arrival) {
            expect(arrival).to.contain.keys('name', 'type', 'station', 'arrival', 'origin');
            expect(arrival.arrival).to.be.an.instanceOf(Date);
          });
          done();
        })
        .catch(done);
    });
  });

  it('returns chainable promises', function (done) {
    fahrplan.station.find('Berlin')
      .then(function (stations) { return stations.stations[0].departures.get() })
      .then(function (departures) { return departures[0].itinerary.get() })
      .then(function (itinerary) {
        expect(itinerary.stops).to.have.length.above(0);
        done();
      })
      .catch(done);
  });
});