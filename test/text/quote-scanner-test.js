var vows = require('vows');
var assert = require('assert');
var QuoteScanner = require('../../lib/text/quote-scanner');

vows.describe(QuoteScanner)
  .addBatch({
    'no quotes': {
      topic: 'text without quotes',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator() { index++; });

        assert.equal(0, index);
      }
    },
    'one single quote': {
      topic: 'text with \'one quote\'!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal('\'one quote\'', match);
          assert.deepEqual(['text with '], tokensSoFar);
          assert.equal(10, nextStart);
        });

        assert.equal(1, index);
      }
    },
    'one double quote': {
      topic: 'text with "one quote"!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal('"one quote"', match);
          assert.deepEqual(['text with '], tokensSoFar);
          assert.equal(10, nextStart);
        });

        assert.equal(1, index);
      }
    },
    'mixed quotes': {
      topic: 'text with "one \'quote\'"!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal('"one \'quote\'"', match);
          assert.deepEqual(['text with '], tokensSoFar);
          assert.equal(10, nextStart);
        });

        assert.equal(1, index);
      }
    },
    'escaped quotes': {
      topic: 'text with "one \\"quote"!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal('"one \\"quote"', match);
          assert.deepEqual(['text with '], tokensSoFar);
          assert.equal(10, nextStart);
        });

        assert.equal(1, index);
      }
    },
    'two quotes': {
      topic: 'text with "one \\"quote" and \'another one\'!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          if (index == 1) {
            assert.equal('"one \\"quote"', match);
            assert.deepEqual(['text with '], tokensSoFar);
            assert.equal(10, nextStart);
          } else {
            assert.equal('\'another one\'', match);
            assert.deepEqual(['text with ', ' and '], tokensSoFar);
            assert.equal(28, nextStart);
          }
        });

        assert.equal(2, index);
      }
    }
  })
  .export(module);
