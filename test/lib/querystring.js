'use strict';

var expect = require('chai').expect;

var qs = require('../../lib/querystring');
var nodeQs = require('querystring');

describe('querystring', function () {
  describe('#stringify()', function () {
    var stringify = qs.stringify;

    it('converts { foo: "bar", baz: "quux" } to foo=bar&baz=quux', function () {
      expect(stringify({ foo: 'bar', baz: 'quux' })).to.equal('foo=bar&baz=quux');
    });

    it('converts numbers to strings', function () {
      expect(stringify({ number: 1 })).to.equal('number=1');
    });

    it('repeats the key for arrays', function () {
      expect(stringify({ array: [ 'foo', 'bar', 42 ] })).to.equal('array=foo&array=bar&array=42');
    });

    it('can be passed a separator as its second argument', function () {
      expect(stringify({ foo: 'bar', baz: 'quux' }, ';')).to.equal('foo=bar;baz=quux');
    });

    it('can be passed an equals sign as its third argument', function () {
      expect(stringify({ foo: 'bar', baz: 'quux' }, null, ':')).to.equal('foo:bar&baz:quux');
    });

    it('encodes URI components', function () {
      expect(stringify({ "föø": 'bär båz _~!* 🍪' })).to.equal('f%C3%B6%C3%B8=b%C3%A4r%20b%C3%A5z%20_~!*%20%F0%9F%8D%AA');
    });
  });
});
