var vows = require('vows');
var assert = require('assert');
var Compatibility = require('../../lib/utils/compatibility');

vows.describe(Compatibility)
  .addBatch({
    'as an empty hash': {
      'topic': function () {
        return new Compatibility({}).toOptions();
      },
      'gets default options': function(options) {
        assert.isTrue(options.colors.opacity);
        assert.isTrue(options.properties.colors);
        assert.isFalse(options.properties.backgroundSizeMerging);
        assert.isFalse(options.properties.iePrefixHack);
        assert.isFalse(options.properties.ieSuffixHack);
        assert.isTrue(options.properties.merging);
        assert.isTrue(options.properties.spaceAfterClosingBrace);
        assert.isFalse(options.properties.urlQuotes);
        assert.isTrue(options.properties.zeroUnits);
        assert.isFalse(options.selectors.adjacentSpace);
        assert.isFalse(options.selectors.ie7Hack);
        assert.deepEqual(options.selectors.special, /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:dir\([a-z-]*\)|:first(?![a-z-])|:fullscreen|:left|:read-only|:read-write|:right)/);
        assert.isTrue(options.units.rem);
      }
    },
    'not given': {
      'topic': function () {
        return new Compatibility().toOptions();
      },
      'gets default options': function(options) {
        assert.deepEqual(options, new Compatibility({}).toOptions());
      }
    },
    'as a populated hash': {
      'topic': function () {
        return new Compatibility({ units: { rem: false }, properties: { prefix: true } }).toOptions();
      },
      'gets merged options': function(options) {
        assert.isTrue(options.colors.opacity);
        assert.isFalse(options.properties.backgroundSizeMerging);
        assert.isTrue(options.properties.colors);
        assert.isFalse(options.properties.iePrefixHack);
        assert.isFalse(options.properties.ieSuffixHack);
        assert.isTrue(options.properties.merging);
        assert.isTrue(options.properties.spaceAfterClosingBrace);
        assert.isTrue(options.properties.zeroUnits);
        assert.isFalse(options.selectors.adjacentSpace);
        assert.isFalse(options.selectors.ie7Hack);
        assert.deepEqual(options.selectors.special, /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:dir\([a-z-]*\)|:first(?![a-z-])|:fullscreen|:left|:read-only|:read-write|:right)/);
        assert.isFalse(options.units.rem);
      }
    }
  })
  .addBatch({
    'as an ie8 template': {
      'topic': function () {
        return new Compatibility('ie8').toOptions();
      },
      'gets template options': function(options) {
        assert.isFalse(options.colors.opacity);
        assert.isFalse(options.properties.backgroundSizeMerging);
        assert.isTrue(options.properties.colors);
        assert.isTrue(options.properties.iePrefixHack);
        assert.isTrue(options.properties.ieSuffixHack);
        assert.isFalse(options.properties.merging);
        assert.isTrue(options.properties.spaceAfterClosingBrace);
        assert.isFalse(options.properties.urlQuotes);
        assert.isTrue(options.properties.zeroUnits);
        assert.isFalse(options.selectors.adjacentSpace);
        assert.isFalse(options.selectors.ie7Hack);
        assert.deepEqual(options.selectors.special, /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:root|:nth|:first\-of|:last|:only|:empty|:target|:checked|::selection|:enabled|:disabled|:not)/);
        assert.isFalse(options.units.rem);
      }
    },
    'as an ie7 template': {
      'topic': function () {
        return new Compatibility('ie7').toOptions();
      },
      'gets template options': function(options) {
        assert.isFalse(options.colors.opacity);
        assert.isFalse(options.properties.backgroundSizeMerging);
        assert.isTrue(options.properties.colors);
        assert.isTrue(options.properties.iePrefixHack);
        assert.isTrue(options.properties.ieSuffixHack);
        assert.isFalse(options.properties.merging);
        assert.isTrue(options.properties.spaceAfterClosingBrace);
        assert.isFalse(options.properties.urlQuotes);
        assert.isTrue(options.properties.zeroUnits);
        assert.isFalse(options.selectors.adjacentSpace);
        assert.isTrue(options.selectors.ie7Hack);
        assert.deepEqual(options.selectors.special, /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:focus|:before|:after|:root|:nth|:first\-of|:last|:only|:empty|:target|:checked|::selection|:enabled|:disabled|:not)/);
        assert.isFalse(options.units.rem);
      }
    },
    'as an unknown template': {
      'topic': function () {
        return new Compatibility('').toOptions();
      },
      'gets default options': function(options) {
        assert.deepEqual(options, new Compatibility({}).toOptions());
      }
    }
  })
  .addBatch({
    'as a complex string value with group': {
      'topic': function () {
        return new Compatibility('ie8,-properties.iePrefixHack,+colors.opacity').toOptions();
      },
      'gets calculated options': function(options) {
        assert.isTrue(options.colors.opacity);
        assert.isFalse(options.properties.backgroundSizeMerging);
        assert.isTrue(options.properties.colors);
        assert.isFalse(options.properties.iePrefixHack);
        assert.isTrue(options.properties.ieSuffixHack);
        assert.isFalse(options.properties.merging);
        assert.isTrue(options.properties.spaceAfterClosingBrace);
        assert.isFalse(options.properties.urlQuotes);
        assert.isTrue(options.properties.zeroUnits);
        assert.isFalse(options.selectors.adjacentSpace);
        assert.isFalse(options.selectors.ie7Hack);
        assert.deepEqual(options.selectors.special, /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:root|:nth|:first\-of|:last|:only|:empty|:target|:checked|::selection|:enabled|:disabled|:not)/);
        assert.isFalse(options.units.rem);
      }
    },
    'as a single string value without group': {
      'topic': function () {
        return new Compatibility('+properties.iePrefixHack').toOptions();
      },
      'gets calculated options': function(options) {
        assert.isTrue(options.colors.opacity);
        assert.isTrue(options.properties.colors);
        assert.isFalse(options.properties.backgroundSizeMerging);
        assert.isTrue(options.properties.iePrefixHack);
        assert.isFalse(options.properties.ieSuffixHack);
        assert.isTrue(options.properties.merging);
        assert.isTrue(options.properties.spaceAfterClosingBrace);
        assert.isFalse(options.properties.urlQuotes);
        assert.isTrue(options.properties.zeroUnits);
        assert.isFalse(options.selectors.adjacentSpace);
        assert.isFalse(options.selectors.ie7Hack);
        assert.deepEqual(options.selectors.special, /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:dir\([a-z-]*\)|:first(?![a-z-])|:fullscreen|:left|:read-only|:read-write|:right)/);
        assert.isTrue(options.units.rem);      }
    },
    'as a complex string value without group': {
      'topic': function () {
        return new Compatibility('+properties.iePrefixHack,-units.rem').toOptions();
      },
      'gets calculated options': function(options) {
        assert.isTrue(options.colors.opacity);
        assert.isTrue(options.properties.colors);
        assert.isFalse(options.properties.backgroundSizeMerging);
        assert.isTrue(options.properties.iePrefixHack);
        assert.isFalse(options.properties.ieSuffixHack);
        assert.isTrue(options.properties.merging);
        assert.isTrue(options.properties.spaceAfterClosingBrace);
        assert.isFalse(options.properties.urlQuotes);
        assert.isTrue(options.properties.zeroUnits);
        assert.isFalse(options.selectors.adjacentSpace);
        assert.isFalse(options.selectors.ie7Hack);
        assert.deepEqual(options.selectors.special, /(\-moz\-|\-ms\-|\-o\-|\-webkit\-|:dir\([a-z-]*\)|:first(?![a-z-])|:fullscreen|:left|:read-only|:read-write|:right)/);
        assert.isFalse(options.units.rem);
      }
    }
  })
  .export(module);
