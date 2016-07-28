(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Fahrplan"] = factory();
	else
		root["Fahrplan"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory();
		else if(typeof define === 'function' && define.amd)
			define([], factory);
		else if(typeof exports === 'object')
			exports["Fahrplan"] = factory();
		else
			root["Fahrplan"] = factory();
	})(this, function() {
	return /******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		(function webpackUniversalModuleDefinition(root, factory) {
			if(true)
				module.exports = factory();
			else if(typeof define === 'function' && define.amd)
				define([], factory);
			else if(typeof exports === 'object')
				exports["Fahrplan"] = factory();
			else
				root["Fahrplan"] = factory();
		})(this, function() {
		return /******/ (function(modules) { // webpackBootstrap
		/******/ 	// The module cache
		/******/ 	var installedModules = {};

		/******/ 	// The require function
		/******/ 	function __webpack_require__(moduleId) {

		/******/ 		// Check if module is in cache
		/******/ 		if(installedModules[moduleId])
		/******/ 			return installedModules[moduleId].exports;

		/******/ 		// Create a new module (and put it into the cache)
		/******/ 		var module = installedModules[moduleId] = {
		/******/ 			exports: {},
		/******/ 			id: moduleId,
		/******/ 			loaded: false
		/******/ 		};

		/******/ 		// Execute the module function
		/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		/******/ 		// Flag the module as loaded
		/******/ 		module.loaded = true;

		/******/ 		// Return the exports of the module
		/******/ 		return module.exports;
		/******/ 	}


		/******/ 	// expose the modules object (__webpack_modules__)
		/******/ 	__webpack_require__.m = modules;

		/******/ 	// expose the module cache
		/******/ 	__webpack_require__.c = installedModules;

		/******/ 	// __webpack_public_path__
		/******/ 	__webpack_require__.p = "";

		/******/ 	// Load entry module and return exports
		/******/ 	return __webpack_require__(0);
		/******/ })
		/************************************************************************/
		/******/ ([
		/* 0 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			var qs = __webpack_require__(1);
			var request = __webpack_require__(2);
			var parsers = __webpack_require__(4);
			var dateUtil = __webpack_require__(5);

			var BASE = 'http://open-api.bahn.de/bin/rest.exe';

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


		/***/ },
		/* 1 */
		/***/ function(module, exports) {

			'use strict';

			// Minimalistic re-implementation of querystring.stringify

			module.exports = {
			  stringify: function (params, separator, equals) {
			    if (!separator) separator = '&';
			    if (!equals) equals = '=';

			    var output = [];

			    function serialize(key, value) {
			      return encodeURIComponent(key) + equals + encodeURIComponent(value);
			    }

			    var keys = Object.keys(params);
			    keys.forEach(function (key) {
			      var value = params[key];

			      if (Array.isArray(value)) {
			        value.forEach(function (arrayValue) {
			          output.push(serialize(key, arrayValue));
			        });
			      } else {
			        output.push(serialize(key, value));
			      }
			    });

			    return output.join(separator);
			  },
			}


		/***/ },
		/* 2 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			if (true) module.exports = __webpack_require__(3);
			else module.exports = require('./node');


		/***/ },
		/* 3 */
		/***/ function(module, exports) {

			'use strict';

			/* global Promise */

			module.exports = function request(url) {
			  return new Promise(function (resolve, reject) {
			    var req = new XMLHttpRequest();
			    var protocol = url.split(':').shift().toLowerCase();
			    if (protocol !== 'https' && protocol !== 'http') {
			      throw new Error('Unsupported protocol (' + protocol + ')');
			    }

			    req.open('GET', url, true);

			    req.onload = function () {
			      resolve({ data: req.responseText });
			    }

			    req.onerror = reject;

			    req.send();
			  });
			}


		/***/ },
		/* 4 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			var dateUtil = __webpack_require__(5);

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
			    result.departure = { find: function (date) { return api.departure.find(result.id, date) } };
			    result.arrival = { find: function (date) { return api.arrival.find(result.id, date) } };
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


		/***/ },
		/* 5 */
		/***/ function(module, exports) {

			'use strict';

			function zeroPad(number, length) {
			  if (length === undefined) length = 2;
			  number = '' + number;
			  while (number.length < length) number = '0' + number;
			  return number;
			}

			module.exports = {
			  formatDate: function (input) {
			    input = new Date(input);
			    var dd = zeroPad(input.getDate());
			    var mm = zeroPad(input.getMonth() + 1);
			    var yyyy = zeroPad(input.getFullYear(), 4);
			    return [ yyyy, mm, dd ].join('-');
			  },

			  formatTime: function (input) {
			    input = new Date(input);
			    var hh = zeroPad(input.getHours());
			    var mm = zeroPad(input.getMinutes());
			    return hh + ':' + mm;
			  },

			  parse: function (date, time) {
			    date = date.split('-');
			    time = time.split(':');

			    var year = parseInt(date[0], 10);
			    var month = parseInt(date[1], 10) - 1;
			    var day = parseInt(date[2], 10);

			    var hour = parseInt(time[0], 10);
			    var minute = parseInt(time[1], 10);

			    return new Date(year, month, day, hour, minute);
			  },
			}


		/***/ }
		/******/ ])
		});
		;

	/***/ }
	/******/ ])
	});
	;

/***/ }
/******/ ])
});
;