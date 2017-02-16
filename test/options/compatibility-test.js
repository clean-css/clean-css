var vows = require('vows');
var assert = require('assert');
var compatibilityFrom = require('../../lib/options/compatibility');

vows.describe(compatibilityFrom)
  .addBatch({
    'as an empty hash': {
      'topic': function () {
        return compatibilityFrom({});
      },
      'gets default compatibility': function (compat) {
        assert.isTrue(compat.colors.opacity);
        assert.isTrue(compat.properties.colors);
        assert.isTrue(compat.properties.backgroundClipMerging);
        assert.isTrue(compat.properties.backgroundOriginMerging);
        assert.isTrue(compat.properties.backgroundSizeMerging);
        assert.isFalse(compat.properties.ieBangHack);
        assert.isFalse(compat.properties.ieFilters);
        assert.isFalse(compat.properties.iePrefixHack);
        assert.isFalse(compat.properties.ieSuffixHack);
        assert.isTrue(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isFalse(compat.properties.urlQuotes);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isFalse(compat.selectors.ie7Hack);
        assert.isTrue(compat.selectors.multiplePseudoMerging);
        assert.isTrue(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isTrue(compat.units.rem);
        assert.isTrue(compat.units.vh);
        assert.isTrue(compat.units.vm);
        assert.isTrue(compat.units.vmax);
        assert.isTrue(compat.units.vmin);
        assert.isTrue(compat.units.vw);
      }
    },
    'not given': {
      'topic': function () {
        return compatibilityFrom();
      },
      'gets default compatibility': function (compat) {
        assert.deepEqual(compat, compatibilityFrom({}));
      }
    },
    'as a populated hash': {
      'topic': function () {
        return compatibilityFrom({ units: { rem: false, vmax: false }, properties: { prefix: true } });
      },
      'gets merged compatibility': function (compat) {
        assert.isTrue(compat.colors.opacity);
        assert.isTrue(compat.properties.backgroundClipMerging);
        assert.isTrue(compat.properties.backgroundOriginMerging);
        assert.isTrue(compat.properties.backgroundSizeMerging);
        assert.isTrue(compat.properties.colors);
        assert.isFalse(compat.properties.ieBangHack);
        assert.isFalse(compat.properties.ieFilters);
        assert.isFalse(compat.properties.iePrefixHack);
        assert.isFalse(compat.properties.ieSuffixHack);
        assert.isTrue(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isFalse(compat.selectors.ie7Hack);
        assert.isTrue(compat.selectors.multiplePseudoMerging);
        assert.isTrue(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isFalse(compat.units.rem);
        assert.isTrue(compat.units.vh);
        assert.isTrue(compat.units.vm);
        assert.isFalse(compat.units.vmax);
        assert.isTrue(compat.units.vmin);
        assert.isTrue(compat.units.vw);
      }
    }
  })
  .addBatch({
    'as an ie9 template': {
      'topic': function () {
        return compatibilityFrom('ie9');
      },
      'gets template compatibility': function (compat) {
        assert.isTrue(compat.colors.opacity);
        assert.isTrue(compat.properties.backgroundClipMerging);
        assert.isTrue(compat.properties.backgroundOriginMerging);
        assert.isTrue(compat.properties.backgroundSizeMerging);
        assert.isTrue(compat.properties.colors);
        assert.isFalse(compat.properties.ieBangHack);
        assert.isTrue(compat.properties.ieFilters);
        assert.isFalse(compat.properties.iePrefixHack);
        assert.isTrue(compat.properties.ieSuffixHack);
        assert.isTrue(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isFalse(compat.properties.urlQuotes);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isFalse(compat.selectors.ie7Hack);
        assert.isTrue(compat.selectors.multiplePseudoMerging);
        assert.isTrue(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isTrue(compat.units.rem);
        assert.isTrue(compat.units.vh);
        assert.isTrue(compat.units.vm);
        assert.isTrue(compat.units.vmax);
        assert.isTrue(compat.units.vmin);
        assert.isTrue(compat.units.vw);
      }
    },
    'as an ie8 template': {
      'topic': function () {
        return compatibilityFrom('ie8');
      },
      'gets template compatibility': function (compat) {
        assert.isFalse(compat.colors.opacity);
        assert.isFalse(compat.properties.backgroundClipMerging);
        assert.isFalse(compat.properties.backgroundOriginMerging);
        assert.isFalse(compat.properties.backgroundSizeMerging);
        assert.isTrue(compat.properties.colors);
        assert.isFalse(compat.properties.ieBangHack);
        assert.isTrue(compat.properties.ieFilters);
        assert.isTrue(compat.properties.iePrefixHack);
        assert.isTrue(compat.properties.ieSuffixHack);
        assert.isFalse(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isFalse(compat.properties.urlQuotes);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isFalse(compat.selectors.ie7Hack);
        assert.isTrue(compat.selectors.multiplePseudoMerging);
        assert.isFalse(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isFalse(compat.units.rem);
        assert.isFalse(compat.units.vh);
        assert.isFalse(compat.units.vm);
        assert.isFalse(compat.units.vmax);
        assert.isFalse(compat.units.vmin);
        assert.isFalse(compat.units.vw);
      }
    },
    'as an ie7 template': {
      'topic': function () {
        return compatibilityFrom('ie7');
      },
      'gets template compatibility': function (compat) {
        assert.isFalse(compat.colors.opacity);
        assert.isFalse(compat.properties.backgroundClipMerging);
        assert.isFalse(compat.properties.backgroundOriginMerging);
        assert.isFalse(compat.properties.backgroundSizeMerging);
        assert.isTrue(compat.properties.colors);
        assert.isTrue(compat.properties.ieBangHack);
        assert.isTrue(compat.properties.ieFilters);
        assert.isTrue(compat.properties.iePrefixHack);
        assert.isTrue(compat.properties.ieSuffixHack);
        assert.isFalse(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isFalse(compat.properties.urlQuotes);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isTrue(compat.selectors.ie7Hack);
        assert.isFalse(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isFalse(compat.units.rem);
        assert.isFalse(compat.units.vh);
        assert.isFalse(compat.units.vm);
        assert.isFalse(compat.units.vmax);
        assert.isFalse(compat.units.vmin);
        assert.isFalse(compat.units.vw);
      }
    },
    'as an unknown template': {
      'topic': function () {
        return compatibilityFrom('');
      },
      'gets default compatibility': function (compat) {
        assert.deepEqual(compat, compatibilityFrom({}));
      }
    }
  })
  .addBatch({
    'as a complex string value with group': {
      'topic': function () {
        return compatibilityFrom('ie8,-properties.iePrefixHack,+colors.opacity');
      },
      'gets calculated compatibility': function (compat) {
        assert.isTrue(compat.colors.opacity);
        assert.isFalse(compat.properties.backgroundClipMerging);
        assert.isFalse(compat.properties.backgroundOriginMerging);
        assert.isFalse(compat.properties.backgroundSizeMerging);
        assert.isTrue(compat.properties.colors);
        assert.isFalse(compat.properties.ieBangHack);
        assert.isTrue(compat.properties.ieFilters);
        assert.isFalse(compat.properties.iePrefixHack);
        assert.isTrue(compat.properties.ieSuffixHack);
        assert.isFalse(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isFalse(compat.properties.urlQuotes);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isFalse(compat.selectors.ie7Hack);
        assert.isTrue(compat.selectors.multiplePseudoMerging);
        assert.isFalse(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isFalse(compat.units.rem);
        assert.isFalse(compat.units.vh);
        assert.isFalse(compat.units.vm);
        assert.isFalse(compat.units.vmax);
        assert.isFalse(compat.units.vmin);
        assert.isFalse(compat.units.vw);
      }
    },
    'as a single string value without group': {
      'topic': function () {
        return compatibilityFrom('+properties.iePrefixHack');
      },
      'gets calculated compatibility': function (compat) {
        assert.isTrue(compat.colors.opacity);
        assert.isTrue(compat.properties.colors);
        assert.isTrue(compat.properties.backgroundClipMerging);
        assert.isTrue(compat.properties.backgroundOriginMerging);
        assert.isTrue(compat.properties.backgroundSizeMerging);
        assert.isFalse(compat.properties.ieBangHack);
        assert.isFalse(compat.properties.ieFilters);
        assert.isTrue(compat.properties.iePrefixHack);
        assert.isFalse(compat.properties.ieSuffixHack);
        assert.isTrue(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isFalse(compat.properties.urlQuotes);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isFalse(compat.selectors.ie7Hack);
        assert.isTrue(compat.selectors.multiplePseudoMerging);
        assert.isTrue(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isTrue(compat.units.rem);
        assert.isTrue(compat.units.vh);
        assert.isTrue(compat.units.vm);
        assert.isTrue(compat.units.vmax);
        assert.isTrue(compat.units.vmin);
        assert.isTrue(compat.units.vw);
      }
    },
    'as a complex string value without group': {
      'topic': function () {
        return compatibilityFrom('+properties.iePrefixHack,-units.rem');
      },
      'gets calculated compatibility': function (compat) {
        assert.isTrue(compat.colors.opacity);
        assert.isTrue(compat.properties.colors);
        assert.isTrue(compat.properties.backgroundClipMerging);
        assert.isTrue(compat.properties.backgroundOriginMerging);
        assert.isTrue(compat.properties.backgroundSizeMerging);
        assert.isFalse(compat.properties.ieBangHack);
        assert.isFalse(compat.properties.ieFilters);
        assert.isTrue(compat.properties.iePrefixHack);
        assert.isFalse(compat.properties.ieSuffixHack);
        assert.isTrue(compat.properties.merging);
        assert.isFalse(compat.properties.shorterLengthUnits);
        assert.isTrue(compat.properties.spaceAfterClosingBrace);
        assert.isFalse(compat.properties.urlQuotes);
        assert.isTrue(compat.properties.zeroUnits);
        assert.isFalse(compat.selectors.adjacentSpace);
        assert.isFalse(compat.selectors.ie7Hack);
        assert.isTrue(compat.selectors.multiplePseudoMerging);
        assert.isTrue(compat.units.ch);
        assert.isTrue(compat.units.in);
        assert.isTrue(compat.units.pc);
        assert.isTrue(compat.units.pt);
        assert.isFalse(compat.units.rem);
        assert.isTrue(compat.units.vh);
        assert.isTrue(compat.units.vm);
        assert.isTrue(compat.units.vmax);
        assert.isTrue(compat.units.vmin);
        assert.isTrue(compat.units.vw);
      }
    }
  })
  .export(module);
