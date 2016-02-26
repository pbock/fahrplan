'use strict';

var dateUtil = require('./date-util');

var ARRIVAL = 'ARRIVAL';
var DEPARTURE = 'DEPARTURE';

function parseLocation(location, api) {
  var result = {};
  result.name = location.name;
  result.latitude = parseFloat(location.lat);
  result.longitude = parseFloat(location.lon);
  if (location.id) result.id = location.id;
  if (location.type) result.type = location.type;

  if (api && typeof api !== 'number') {
    result.departures = { get: function (date) { return api.departures.get(result.id, date) } };
    result.arrivals = { get: function (date) { return api.arrivals.get(result.id, date) } };
  }
  return result;
}
function parseBoardEntry(entry, type) {
  var result = {};
  result.name = entry.name;
  result.type = entry.type;
  result.station = { name: entry.stop, id: entry.stopid };
  if (type === ARRIVAL) result.arrival = dateUtil.parse(entry.date, entry.time);
  if (type === DEPARTURE) result.departure = dateUtil.parse(entry.date, entry.time);
  if (entry.origin) result.origin = entry.origin;
  if (entry.direction) result.destination = entry.direction;
  result.platform = entry.track;
  return result;
}
function parseItineraryMetadata(input) {
  var result = {};
  Object.keys(input).forEach(function (key) {
    if (!input.hasOwnProperty(key)) return;
    var value = input[key];

    if (key === 'routeIdxFrom') result.fromIndex = parseInt(value, 10);
    else if (key === 'routeIdxTo') result.toIndex = parseInt(value, 10);
    else if (key === 'priority') result.priority = parseInt(value, 10);
    else if (key === '$') result.description = value;
    else result[key] = value;
  });
  return result;
}

module.exports = {
  station: function (res) {
    if (!res.hasOwnProperty('data')) throw new Error('Expected a response object with a data property');
    var data = JSON.parse(res.data);

    var stops = data.LocationList.StopLocation || [];
    var places = data.LocationList.CoordLocation || [];
    if (!stops.hasOwnProperty('length')) stops = [ stops ];
    if (!places.hasOwnProperty('length')) places = [ places ];

    var result = {
      stations: stops.map(function (stop) { return parseLocation(stop, res.api) }),
      places: places.map(parseLocation),
    };
    return result;
  },

  stationBoard: function (res) {
    if (!res.hasOwnProperty('data')) throw new Error('Expected a response object with a data property');
    var data = JSON.parse(res.data);

    var trains, type, error;
    if (data.ArrivalBoard) {
      trains = data.ArrivalBoard.Arrival;
      type = ARRIVAL;
    } else if (data.DepartureBoard) {
      trains = data.DepartureBoard.Departure;
      type = DEPARTURE;
    } else if (data.Error) {
      error = new Error('API Error (' + data.Error.code + ')');
      error.code = data.Error.code;
      error.data = data.Error;
    } else {
      throw new Error('Expected an ArrivalBoard or DepartureBoard, got ' + data);
    }

    if (!trains) trains = [];
    if (!trains.hasOwnProperty('length')) trains = [ trains ];

    return trains.map(function (train) {
      var parsed = parseBoardEntry(train, type);
      if (res.api && train.JourneyDetailRef) {
        parsed.itinerary = { get: function () { return res.api.itinerary.get(train.JourneyDetailRef.ref) } };
      }
      return parsed;
    });
  },

  itinerary: function (res) {
    if (!res.hasOwnProperty('data')) throw new Error('Expected a response object with a data property');
    var data = JSON.parse(res.data);

    var stops, names, types, operators, notes;
    try { stops = data.JourneyDetail.Stops.Stop; } catch (e) { stops = []; }
    try { names = data.JourneyDetail.Names.Name; } catch (e) { names = []; }
    try { types = data.JourneyDetail.Types.Type; } catch (e) { types = []; }
    try { operators = data.JourneyDetail.Operators.Operator; } catch (e) { operators = []; }
    try { notes = data.JourneyDetail.Notes.Note; } catch (e) { notes = []; }
    if (!stops.hasOwnProperty('length')) stops = [ stops ];
    if (!names.hasOwnProperty('length')) names = [ names ];
    if (!types.hasOwnProperty('length')) types = [ types ];
    if (!operators.hasOwnProperty('length')) operators = [ operators ];
    if (!notes.hasOwnProperty('length')) notes = [ notes ];

    stops = stops.map(function (stop) {
      var result = {
        station: parseLocation(stop, res.api),
        index: parseInt(stop.routeIdx),
        platform: stop.track,
      };
      if (stop.depTime) result.departure = dateUtil.parse(stop.depDate, stop.depTime);
      if (stop.arrTime) result.arrival = dateUtil.parse(stop.arrDate, stop.arrTime);

      return result;
    });

    return {
      stops: stops,
      names: names.map(parseItineraryMetadata),
      types: types.map(parseItineraryMetadata),
      operators: operators.map(parseItineraryMetadata),
      notes: notes.map(parseItineraryMetadata),
    };
  },
}
