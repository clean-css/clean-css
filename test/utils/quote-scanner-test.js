var vows = require('vows');
var assert = require('assert');
var QuoteScanner = require('../../lib/utils/quote-scanner');

vows.describe(QuoteScanner)
  .addBatch({
    'no quotes': {
      topic: 'text without quotes',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator() { index++; });

        assert.equal(index, 0);
      }
    },
    'one single quote': {
      topic: 'text with \'one quote\'!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal(match, '\'one quote\'');
          assert.deepEqual(tokensSoFar, ['text with ']);
          assert.equal(nextStart, 10);
        });

        assert.equal(index, 1);
      }
    },
    'one double quote': {
      topic: 'text with "one quote"!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal(match, '"one quote"');
          assert.deepEqual(tokensSoFar, ['text with ']);
          assert.equal(nextStart, 10);
        });

        assert.equal(index, 1);
      }
    },
    'mixed quotes': {
      topic: 'text with "one \'quote\'"!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal(match, '"one \'quote\'"');
          assert.deepEqual(tokensSoFar, ['text with ']);
          assert.equal(nextStart, 10);
        });

        assert.equal(index, 1);
      }
    },
    'escaped quotes': {
      topic: 'text with "one \\"quote"!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          assert.equal(match, '"one \\"quote"');
          assert.deepEqual(tokensSoFar, ['text with ']);
          assert.equal(nextStart, 10);
        });

        assert.equal(index, 1);
      }
    },
    'one open-ended quote': {
      topic: '.this-class\\\'s-got-an-apostrophe {}',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator() {
          index++;
        });

        assert.equal(index, 0);
      }
    },
    'many open-ended quotes': {
      topic: '.this-class\\\'s-got-many\\\"-apostrophes\\\' {}',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator() {
          index++;
        });

        assert.equal(index, 0);
      }
    },
    'two quotes': {
      topic: 'text with "one \\"quote" and \'another one\'!',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match, tokensSoFar, nextStart) {
          index++;

          if (index == 1) {
            assert.equal(match, '"one \\"quote"');
            assert.deepEqual(tokensSoFar, ['text with ']);
            assert.equal(nextStart, 10);
          } else {
            assert.equal(match, '\'another one\'');
            assert.deepEqual(tokensSoFar, ['text with ', ' and ']);
            assert.equal(nextStart, 28);
          }
        });

        assert.equal(index, 2);
      }
    },
    'between comments': {
      topic: '/*! comment */*{box-sizing:border-box}div:before{content:" "}/*! @comment */',
      iterator: function (topic) {
        var index = 0;
        new QuoteScanner(topic).each(function iterator(match) {
          index++;

          assert.equal(match, '" "');
        });

        assert.equal(index, 1);
      }
    },
  })
  .export(module);
