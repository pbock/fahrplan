# Fahrplan

A JavaScript client for Deutsche Bahn's [timetable API](http://data.deutschebahn.com/apis/fahrplan/).

```js
const fahrplan = require('fahrplan')('TopSecretAPIKey');

fahrplan.station.find('Berlin')
  .then(result => {
    console.log('Found %d stations, looking up departures for %s', result.stations.length, result.stations[0].name);
    return result.stations[0].departuresBoard.get();
  })
  .then(departures => {
    console.log('The next train is %s to %s', departures[0].name, departures[0].destination);
    return departures[0].itinerary.get();
  })
  .then(itinerary => {
    console.log('It calls at:');
    itinerary.stops.forEach(stop => console.log(stop.station.name));
  });

fahrplan.arrivalsBoard.get('8098160', new Date(2016, 0, 1))
  .then(arrivals => console.log('The first train of the year was %s from %s', arrivals[0].name, arrivals[0].origin));
```

It currently only works in node.js but will be coming to a browser near you as soon as Deutsche Bahn adds a `Access-Control-Allow-Origin` header.

## Installing

```sh
npm install fahrplan
```

## Usage

Create a new instance of the client with your API key:

```js
const fahrplan = require('fahrplan')(/* Your API Key goes here */);
```

Just [send an email to dbopendata@deutschebahn.com](mailto:dbopendata@deutschebahn.com) to get an API key. There have been reports of the key being leaked, but we couldn't possibly comment.

There are currently only three things the API lets you do:

* `station.find()`:
  Search for a station by name (similar to the booking form on [bahn.de](http://www.bahn.de/p/view/index.shtml))
* `departuresBoard.get()`/`arrivalsBoard.get()`:
  Find all trains leaving from/arriving at a station at a given time
* `itinerary.get()`:
  Find out at which stations a service calls and additional information

### `station.find(name)`

Starts a full-text search for the given `name`.

Example:
```js
fahrplan.station.find('Hamburg').then(doSomethingWithTheResult);
fahrplan.station.find('KA').then(doSomethingWithTheResult);
fahrplan.station.find('008010255').then(doSomethingWithTheResult);
```

**Returns** a Promise that resolves with an object like this:

```js
{
  stations: [
    {
      name: 'Berlin Hbf',
      latitude: 52.525589,
      longitude: 13.369548,
      id: '008011160',
      departuresBoard: { get: function () { /* … */ } },
      arrivalsBoard: { get: function () { /* … */ } }
    },
    // …
  ],
  places: [
    {
      name: 'Berlin,  Lido Kultur- + Veranstaltungs GmbH (Kultu',
      latitude: 52.499169
      longitude: 13.444968,
      type: 'POI'
    },
    // …
  ]
}
```

### `departuresBoard.get(stationId, [date])`

Looks up all trains leaving from the station `stationId` at the given `date` (defaults to now).

Example:

```js
// All trains leaving from Berlin Ostbahnhof right now
fahrplan.departuresBoard.get('008010255').then(doSomethingWithTheResult);
// Find the first train that left from Berlin Hbf in 2016
fahrplan.departuresBoard.get('008011160', new Date(2016, 0, 1)).then(departures => departures[0]);
```

**Returns** a Promise that resolves with an array like this:
```js
[
  {
    name: 'ICE 1586',
    type: 'ICE',
    station: { name: 'Berlin Hbf (tief)', id: '8098160' },
    departure: new Date('Fri Feb 26 2016 19:42:00 GMT+0100 (CET)'),
    destination: 'Hamburg-Altona',
    platform: '7',
    itinerary: { get: function () { /* … */ } }
  },
  // …
]
```

Because you'll often need to look up a station ID before you can fetch the departures board, you can also look it up right from the result of `fahrplan.station.find()`. Each of the `stations` has a `departuresBoard.get([ date ])` method that works just the same.

Example:

```js
fahrplan.station.find('Köln')
  .then(result => result.stations[0].departuresBoard.get())
  .then(doSomethingWithTheDeparturesBoard);
```

### `arrivalsBoard.get(stationId, [date])`

Looks up all trains leaving from the station `stationId` at the given `date` (defaults to now).

Example:

```js
// All trains arriving in Berlin Ostbahnhof right now
fahrplan.arrivalsBoard.get('008010255').then(doSomethingWithTheResult);
// Find the first train that arrived in Berlin Hbf in 2016
fahrplan.arrivalsBoard.get('008011160', new Date(2016, 0, 1)).then(arrivals => arrivals[0]);
```

**Returns** a Promise that resolves with an array just like the one in `departuresBoard.get()`, except that `destination` and `departure` are replaced with `origin` and `arrival`, respectively.

Because you'll often need to look up a station ID before you can fetch the arrivals board, you can also look it up right from the result of `fahrplan.station.find()`. Each of the `stations` has an `arrivalsBoard.get([ date ])` method that works just the same.

### `itinerary.get(url)`

Gets the itinerary and additional information for a given service. Because the URLs involved are stateful (so much for being a REST API), it doesn't make sense to call this method directly. Instead, you can call it from the result of `departuresBoard.get()` or `arrivalsBoard.get()`.

Example:
```js
fahrplan.arrivalsBoard.get('008010255')
  .then(arrivals => arrivals[0].itinerary.get())
  .then(doSomethingWithTheItinerary);
```

**Returns** a Promise that resolves with an array like this:

```js
{
  stops: [
    {
      station: {
        name: 'Hamburg-Altona',
        latitude: 53.552696,
        longitude: 9.935174,
        id: '8002553',
        departuresBoard: { get: function () { /* … */ }},
        arrivalsBoard: { get: function () { /* … */ }}
      },
      index: 0,
      platform: '10',
      departure: new Date('2016-02-26T17:19:00.000Z'),
    },
    // … (8 more)
  ],
  names: [
    { name: 'ICE 903', fromIndex: 0, toIndex: 8 }
  ],
  types: [
    { type: 'ICE', fromIndex: 0, toIndex: 8 }
  ],
  operators: [
    { name: 'DPN', fromIndex: 0, toIndex: 8 }
  ],
  notes: [
    { key: 'BR', priority: 450, fromIndex: 0, toIndex: 8, description: 'Bordrestaurant' }
  ]
}
```

### To Do

* Improve error handling (the client doesn't throw on all API errors yet, you may sometimes get an empty result when you should get an error)
