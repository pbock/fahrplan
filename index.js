'use strict';

var qs = require('querystring');

var request = require('./lib/request');
var parsers = require('./lib/parsers');
var dateUtil = require('./lib/date-util');

var BASE = 'http://open-api.bahn.de/bin/rest.exe';

var RE_STATION_ID = /^\d{9}$/;

module.exports = function fahrplan(key) {
  if (!key) throw new Error('No API key provided');

  function findStation(query) {
    return request(
      BASE + '/location.name?' + qs.stringify({
        authKey: key,
        input: query,
        format: 'json',
      }))
      .then(function (res) { res.api = api; return res; })
      .then(parsers.station);
  }
  function getStation(query) {
    return findStation(query)
      .then(function (result) {
        if (result.stations.length) return result.stations[0];
        return null;
      });
  }
  function findServices(type, query, date) {
    var endpoint;
    if (type === 'departures') endpoint = '/departureBoard';
    else if (type === 'arrivals') endpoint = '/arrivalBoard';
    else throw new Error('Type must be either "departures" or "arrivals"');

    if (!date) date = Date.now();

    // We want to support station names as well as IDs, but the API only
    // officially supports IDs.
    // The API supports querying for things that aren't IDs, but the behaviour
    // is not documented and surprising (e.g. searching for "B") only returns
    // results for Berlin Südkreuz, not Berlin Hbf.
    // For predictable behaviour, we'll pass anything that doesn't look like an
    // ID through getStation() first.
    var station;
    if (RE_STATION_ID.test(query)) {
      station = { id: query };
    } else {
      station = getStation(query);
    }

    return Promise.resolve(station)
      .then(function (station) {
        return request(
          BASE + endpoint + '?' + qs.stringify({
            authKey: key,
            id: station.id,
            date: dateUtil.formatDate(date),
            time: dateUtil.formatTime(date),
            format: 'json',
          })
        )
      })
      .then(function (res) { res.api = api; return res; })
      .then(parsers.stationBoard);
  }
  function getItinerary(url) {
    return request(url)
      .then(function (res) { res.api = api; return res; })
      .then(parsers.itinerary);
  }

  var api = {
    station: {
      find: findStation,
      get: getStation,
    },
    departure: {
      find: function(stationId, date) { return findServices('departures', stationId, date) },
    },
    arrival: {
      find: function(stationId, date) { return findServices('arrivals', stationId, date) },
    },
    itinerary: {
      get: getItinerary,
    },
  };
  return api;
}
