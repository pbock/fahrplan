'use strict';
function parseLocation(location) {
  var result = {};
  result.name = location.name;
  result.latitude = parseFloat(location.lat);
  result.longitude = parseFloat(location.lon);
  if (location.id) result.id = location.id;
  if (location.type) result.type = location.type;
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

    return {
      stops: stops.map(parseLocation),
      places: places.map(parseLocation),
    };
  },
}
