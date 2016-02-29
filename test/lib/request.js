'use strict';

var expect = require('chai').expect;

var request = require('../../lib/request');

describe('request', function () {
  it('is a function', function () {
    expect(request).to.be.a('Function');
  });

  it('returns a Promise', function () {
    var returnValue = request('http://example.com/');
    // No point testing for a specific prototype (because polyfill may not be
    // necessary everywhere and is not included in the browser version)
    expect(returnValue.then).to.be.a('function');
    expect(returnValue.catch).to.be.a('function');
  });

  it('resolves with an object with a `data` property', function (done) {
    request('http://example.com/')
      .then(function (resolvedWith) {
        expect(resolvedWith).to.be.an('object');
        expect(resolvedWith).to.include.keys('data');
        done();
      })
      .catch(done);
  })

  it('resolves with the response body of a GET request to its first argument', function (done) {
    var url = 'https://httpbin.org/get?foo=bar';
    request(url)
      .then(function (res) {
        var data = res.data;
        expect(data).to.be.a('string');
        data = JSON.parse(data);
        expect(data.url).to.equal(url);
        expect(data.args).to.deep.equal({ foo: 'bar' });
        done();
      })
      .catch(done);
  });

  it('rejects with an error when the protocol is not HTTP or HTTPS', function (done) {
    request('ftp://example.com')
      .then(function () {
        done(new Error('Expected Promise to be rejected'));
      })
      .catch(function (err) {
        try {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.toString()).to.contain('protocol');
          expect(err.toString()).to.contain('ftp');
          done();
        } catch (e) { done(e); }
      })
  })
});
