'use strict';

var qs = require('./lib/querystring');
var request = require('./lib/request');
var parsers = require('./lib/parsers');
var dateUtil = require('./lib/date-util');

var BASE = 'https://open-api.bahn.de/bin/rest.exe';

var RE_STATION_ID = /^\d{9}$/;

function fahrplan(key) {
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
    // In addition, we also support passing station objects (any object with an
    // `id` or `name` property and Promises that resolve to them
    var station;
    if (query.id && RE_STATION_ID.test(query.id)) {
      // An object with an `id` property that looks like a station ID
      station = query;
    } else if (RE_STATION_ID.test(query)) {
      // A string that looks like a station ID
      station = { id: query };
    } else if (typeof query.then === 'function') {
      // A Promise, let's hope it resolves to a station
      station = query;
    } else if (query.name) {
      // An object with a `name` property,
      // let's use that to look up a station id
      station = getStation(query.name);
    } else {
      // Last resort, let's make sure it's a string and look it up
      station = getStation('' + query);
    }

    // Whatever we have now is either something that has an id property
    // or will (hopefully) resolve to something that has an id property.
    // Resolve it if it needs resolving, then look up a timetable for it.
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

module.exports = fahrplan;
