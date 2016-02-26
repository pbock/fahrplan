'use strict';

var qs = require('querystring');

var request = require('lib/request');
var parsers = require('lib/parsers');
var dateUtil = require('lib/dateUtil');

var BASE = 'http://open-api.bahn.de/bin/rest.exe';

module.exports = function fahrplan(key) {
  function findStation(query) {
    return request(
      BASE + '/location.name?' + qs.stringify({
        authKey: key,
        input: query,
        format: 'json',
      })).then(parsers.station);
  }
  function getStationBoard(type, stationId, date) {
    var endpoint;
    if (type === 'departures') endpoint = '/departureBoard';
    else if (type === 'arrivals') endpoint = '/arrivalsBoard';
    else throw new Error('Type must be either "departures" or "arrivals"');

    if (!date) date = Date.now();

    return request(
      BASE + endpoint + '?' + qs.stringify({
        authKey: key,
        id: stationId,
        date: dateUtil.formatDate(date),
        time: dateUtil.formatTime(date),
        format: 'json',
      })).then(parsers.stationBoard);
  }

  return {
    station: {
      find: findStation,
    },
    departuresBoard: {
      get: function(stationId) { return getStationBoard('departures', stationId) },
    },
    arrivalsBoard: {
      get: function(stationId) { return getStationBoard('arrivals', stationId) },
    },
  };
}
