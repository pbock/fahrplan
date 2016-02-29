# Fahrplan.js

A JavaScript client for Deutsche Bahn's [timetable API](http://data.deutschebahn.com/apis/fahrplan/).

```js
const fahrplan = require('fahrplan')('TopSecretAPIKey');

fahrplan.station.get('Berlin')
  .then(berlin => berlin.departure.find())
  .then(departures => {
    console.log('The next train is %s to %s', departures[0].name, departures[0].destination);
    return departures[0].itinerary.get();
  })
  .then(itinerary => {
    console.log('It calls at:');
    itinerary.stops.forEach(stop => console.log(stop.station.name));
  });

fahrplan.arrival.find('Berlin Hbf', new Date(2016, 0, 1))
  .then(arrivals => console.log('The first train of the year was %s from %s', arrivals[0].name, arrivals[0].origin));
```

It runs in node.js and the browser (well, sort of).

## Installing

### node.js

```sh
npm install fahrplan
```

### Browser

You can use Fahrplan.js with a bundler like [Webpack](http://webpack.github.io) or [Browserify](http://browserify.org) (`npm install fahrplan`) or by downloading and including [fahrplan.js](https://raw.githubusercontent.com/pbock/fahrplan/master/dist/fahrplan.js) or [fahrplan.min.js](https://raw.githubusercontent.com/pbock/fahrplan/master/dist/fahrplan.min.js) directly.

In the latter case, you will need a polyfill for Promises unless you can live [without support for Internet Explorer](http://caniuse.com/#feat=promises). [es6-promise](https://github.com/stefanpenner/es6-promise) is a good one.

Fahrplan.js works in the browser, but you can't use it yet because DB's server doesn't send an `Access-Control-Allow-Origin` header. This will hopefully be sorted soon, in the meantime, you can test it in Chrome by starting it with the ominously named `--disable-web-security` flag.

## Usage

Create a new instance of the client with your API key:

```js
const fahrplan = require('fahrplan')(/* Your API Key goes here */);
// Or in the browser, if you're not using a bundler:
var fahrplan = Fahrplan(/* Your API Key goes here */);
```

Just [send an email to dbopendata@deutschebahn.com](mailto:dbopendata@deutschebahn.com) to get an API key. There have been reports of the key being leaked, but we couldn't possibly comment.

There are currently only three things the API lets you do:

* `station.find()`/`station.get()`:
  Search for a station by name (similar to the booking form on [bahn.de](http://www.bahn.de/p/view/index.shtml))
* `departure.find()`/`arrival.find()`:
  Find all trains leaving from/arriving at a station at a given time
* `itinerary.get()`:
  Find out at which stations a service calls and additional information

### `station.find(name)`

Starts a full-text search for the given `name` and resolves with a list of matching stations and places.

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
      departure: { find: function () { /* … */ } },
      arrival: { find: function () { /* … */ } }
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

### `station.get(name)`

Starts a full-text search for the given name and resolves with only the first matched station, or `null` if no station was found.

Behaves like `station.find()`, but only resolves with the first match or `null`.

Example:
```js
fahrplan.station.get('München Hbf').then(doSomethingWithMunich);
```

**Returns** a Promise that resolves with a `station` object like this:

```js
{
  name: 'München Hbf',
  latitude: 48.140228,
  longitude: 11.558338,
  id: '008000261',
  departure: { find: function () { /* … */ } },
  arrival: { find: function () { /* … */ } }
}
```

### `departure.find(station, [date])`

Looks up all trains leaving from the station `station` at the given `date` (defaults to now).

`station` can be:

- a Station ID (recommended),
- a `station` object from `station.find()` or `station.get()`,
- a Promise that resolves to a station,
- or anything that `station.get()` understands.

IDs will be passed straight through to the API, Promises will be resolved. Station names will go through `station.get()`, causing an additional HTTP request. For faster results and lower traffic, it's best to use an ID if you know it.

```js
// All trains leaving from Berlin Ostbahnhof right now
fahrplan.departure.find('008010255').then(doSomethingWithTheResult);
// Find the first train that left from Berlin Hbf in 2016
fahrplan.departure.find('Berlin Hbf', new Date(2016, 0, 1)).then(departures => departures[0]);
// You can also use a Promise as the first parameter.
fahrplan.departure.find(fahrplan.station.get('Münster')).then(doSomethingWithTheResult);
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

Because you'll often look up a station before you can fetch the departures board, you can also fetch the departures right from the result of `station.find()` or `station.get()`. Station objects come with a `departure.find([ date ])` method that works just the same.

Example:

```js
fahrplan.station.get('Köln')
  .then(cologne => cologne.departure.find())
  .then(doSomethingWithTheDeparturesBoard);
```

### `arrival.find(station, [date])`

Looks up all trains leaving from the station `stationId` at the given `date` (defaults to now).

`station` can be:

- a Station ID (recommended),
- a `station` object from `station.find()` or `station.get()`,
- a Promise that resolves to a station,
- or anything that `station.get()` understands.

IDs will be passed straight through to the API, Promises will be resolved. Station names will go through `station.get()`, causing an additional HTTP request. For faster results and lower traffic, it's best to use an ID if you know it.

Example:

```js
// All trains arriving in Berlin Ostbahnhof right now
fahrplan.arrival.find('Berlin Ostbahnhof').then(doSomethingWithTheResult);
// Find the first train that arrived in Berlin Hbf in 2016
fahrplan.arrival.find('008011160', new Date(2016, 0, 1)).then(arrivals => arrivals[0]);
// You can also use a Promise as the first parameter.
fahrplan.arrival.find(fahrplan.station.get('Duisburg')).then(doSomethingWithTheResult);
```

**Returns** a Promise that resolves with an array just like the one in `departure.find()`, except that `destination` and `departure` are replaced with `origin` and `arrival`, respectively.

Because you'll often look up a station before you can fetch the arrivals board, you can also fetch the arrivals right from the result of `station.find()` or `station.get()`. Station objects come with a `arrival.find([ date ])` method that works just the same.

### `itinerary.get(url)`

Gets the itinerary and additional information for a given service. Because the URLs involved are stateful (so much for being a REST API), it doesn't make sense to call this method directly. Instead, you can call it from the result of `departure.find()` or `arrival.find()`.

Example:
```js
fahrplan.arrival.find('008010255')
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
        departure: { find: function () { /* … */ }},
        arrival: { find: function () { /* … */ }}
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

### Known issues

#### Error handling

The client doesn't throw on all API errors yet, you may sometimes get an empty result when you should get an error.

#### Timezone support

All dates and times are assumed to be in the timezone of your machine. This is fine for most of the queries you will want to do, but it means that you can run into trouble if your computer is not in Central European Time.

There's no easy fix for this, partly because JavaScript's timezone handling is atrocious, but mainly because the API doesn't return unambiguous times anyway – **all API results are in local time** which needn't always be CET/CEST.

The API currently only returns trains that run in/through Germany, but that's enough to cause issues: The EN 23 Москва́-Белору́сская—Strasbourg runs through Germany and is therefore included in the results. It leaves Moscow at 19:15 UTC – but the API doesn't tell you that, it tells you that it leaves at 22:15 and lets you guess the timezone.

One *could* guess the timezone by abusing the `latitude`/`longitude` information, but that seems overkill for something that *should* be fixed by sending all the necessary data.

Timezones really aren't a problem that hasn't been solved yet, and as soon as Deutsche Bahn includes timezones in its API results, this client will support them too.
