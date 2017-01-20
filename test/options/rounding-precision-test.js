var assert = require('assert');

var vows = require('vows');

var roundingPrecisionFrom = require('../../lib/options/rounding-precision').roundingPrecisionFrom;

vows.describe(roundingPrecisionFrom)
  .addBatch({
    'default': {
      'topic': function () {
        return roundingPrecisionFrom(null);
      },
      'is disabled for all units': function (precision) {
        assert.equal(precision.ch, 'off');
        assert.equal(precision.cm, 'off');
        assert.equal(precision.em, 'off');
        assert.equal(precision.ex, 'off');
        assert.equal(precision.in, 'off');
        assert.equal(precision.mm, 'off');
        assert.equal(precision.pc, 'off');
        assert.equal(precision.pt, 'off');
        assert.equal(precision.px, 'off');
        assert.equal(precision.q, 'off');
        assert.equal(precision.rem, 'off');
        assert.equal(precision.vh, 'off');
        assert.equal(precision.vmax, 'off');
        assert.equal(precision.vmin, 'off');
        assert.equal(precision.vw, 'off');
        assert.equal(precision['%'], 'off');
      }
    },
    'shortcut': {
      'topic': function () {
        return roundingPrecisionFrom(2);
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 2);
        assert.equal(precision.cm, 2);
        assert.equal(precision.em, 2);
        assert.equal(precision.ex, 2);
        assert.equal(precision.in, 2);
        assert.equal(precision.mm, 2);
        assert.equal(precision.pc, 2);
        assert.equal(precision.pt, 2);
        assert.equal(precision.px, 2);
        assert.equal(precision.q, 2);
        assert.equal(precision.rem, 2);
        assert.equal(precision.vh, 2);
        assert.equal(precision.vmax, 2);
        assert.equal(precision.vmin, 2);
        assert.equal(precision.vw, 2);
        assert.equal(precision['%'], 2);
      }
    },
    'string': {
      'topic': function () {
        return roundingPrecisionFrom('6');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 6);
        assert.equal(precision.cm, 6);
        assert.equal(precision.em, 6);
        assert.equal(precision.ex, 6);
        assert.equal(precision.in, 6);
        assert.equal(precision.mm, 6);
        assert.equal(precision.pc, 6);
        assert.equal(precision.pt, 6);
        assert.equal(precision.px, 6);
        assert.equal(precision.q, 6);
        assert.equal(precision.rem, 6);
        assert.equal(precision.vh, 6);
        assert.equal(precision.vmax, 6);
        assert.equal(precision.vmin, 6);
        assert.equal(precision.vw, 6);
        assert.equal(precision['%'], 6);
      }
    },
    'hash': {
      'topic': function () {
        return roundingPrecisionFrom({ px: 5, q: 7 });
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 'off');
        assert.equal(precision.cm, 'off');
        assert.equal(precision.em, 'off');
        assert.equal(precision.ex, 'off');
        assert.equal(precision.in, 'off');
        assert.equal(precision.mm, 'off');
        assert.equal(precision.pc, 'off');
        assert.equal(precision.pt, 'off');
        assert.equal(precision.px, 5);
        assert.equal(precision.q, 7);
        assert.equal(precision.rem, 'off');
        assert.equal(precision.vh, 'off');
        assert.equal(precision.vmax, 'off');
        assert.equal(precision.vmin, 'off');
        assert.equal(precision.vw, 'off');
        assert.equal(precision['%'], 'off');
      }
    },
    'keyword': {
      'topic': function () {
        return roundingPrecisionFrom('off');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 'off');
        assert.equal(precision.cm, 'off');
        assert.equal(precision.em, 'off');
        assert.equal(precision.ex, 'off');
        assert.equal(precision.in, 'off');
        assert.equal(precision.mm, 'off');
        assert.equal(precision.pc, 'off');
        assert.equal(precision.pt, 'off');
        assert.equal(precision.px, 'off');
        assert.equal(precision.q, 'off');
        assert.equal(precision.rem, 'off');
        assert.equal(precision.vh, 'off');
        assert.equal(precision.vmax, 'off');
        assert.equal(precision.vmin, 'off');
        assert.equal(precision.vw, 'off');
        assert.equal(precision['%'], 'off');
      }
    }
  })
  .addBatch({
    'all': {
      'topic': function () {
        return roundingPrecisionFrom('all=6');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 6);
        assert.equal(precision.cm, 6);
        assert.equal(precision.em, 6);
        assert.equal(precision.ex, 6);
        assert.equal(precision.in, 6);
        assert.equal(precision.mm, 6);
        assert.equal(precision.pc, 6);
        assert.equal(precision.pt, 6);
        assert.equal(precision.px, 6);
        assert.equal(precision.q, 6);
        assert.equal(precision.rem, 6);
        assert.equal(precision.vh, 6);
        assert.equal(precision.vmax, 6);
        assert.equal(precision.vmin, 6);
        assert.equal(precision.vw, 6);
        assert.equal(precision['%'], 6);
      }
    },
    'all via star': {
      'topic': function () {
        return roundingPrecisionFrom('*=3');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 3);
        assert.equal(precision.cm, 3);
        assert.equal(precision.em, 3);
        assert.equal(precision.ex, 3);
        assert.equal(precision.in, 3);
        assert.equal(precision.mm, 3);
        assert.equal(precision.pc, 3);
        assert.equal(precision.pt, 3);
        assert.equal(precision.px, 3);
        assert.equal(precision.q, 3);
        assert.equal(precision.rem, 3);
        assert.equal(precision.vh, 3);
        assert.equal(precision.vmax, 3);
        assert.equal(precision.vmin, 3);
        assert.equal(precision.vw, 3);
        assert.equal(precision['%'], 3);
      }
    },
    'all with overriden values': {
      'topic': function () {
        return roundingPrecisionFrom('all=3,ch=1,rem=-1,px=6');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 1);
        assert.equal(precision.cm, 3);
        assert.equal(precision.em, 3);
        assert.equal(precision.ex, 3);
        assert.equal(precision.in, 3);
        assert.equal(precision.mm, 3);
        assert.equal(precision.pc, 3);
        assert.equal(precision.pt, 3);
        assert.equal(precision.px, 6);
        assert.equal(precision.q, 3);
        assert.equal(precision.rem, 'off');
        assert.equal(precision.vh, 3);
        assert.equal(precision.vmax, 3);
        assert.equal(precision.vmin, 3);
        assert.equal(precision.vw, 3);
        assert.equal(precision['%'], 3);
      }
    },
    'overriden values': {
      'topic': function () {
        return roundingPrecisionFrom('ch=1,rem=-1,px=6');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 1);
        assert.equal(precision.cm, 'off');
        assert.equal(precision.em, 'off');
        assert.equal(precision.ex, 'off');
        assert.equal(precision.in, 'off');
        assert.equal(precision.mm, 'off');
        assert.equal(precision.pc, 'off');
        assert.equal(precision.pt, 'off');
        assert.equal(precision.px, 6);
        assert.equal(precision.q, 'off');
        assert.equal(precision.rem, 'off');
        assert.equal(precision.vh, 'off');
        assert.equal(precision.vmax, 'off');
        assert.equal(precision.vmin, 'off');
        assert.equal(precision.vw, 'off');
        assert.equal(precision['%'], 'off');
      }
    },
    'overriden values via keyword': {
      'topic': function () {
        return roundingPrecisionFrom('ch=1,rem=off,px=6');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 1);
        assert.equal(precision.cm, 'off');
        assert.equal(precision.em, 'off');
        assert.equal(precision.ex, 'off');
        assert.equal(precision.in, 'off');
        assert.equal(precision.mm, 'off');
        assert.equal(precision.pc, 'off');
        assert.equal(precision.pt, 'off');
        assert.equal(precision.px, 6);
        assert.equal(precision.q, 'off');
        assert.equal(precision.rem, 'off');
        assert.equal(precision.vh, 'off');
        assert.equal(precision.vmax, 'off');
        assert.equal(precision.vmin, 'off');
        assert.equal(precision.vw, 'off');
        assert.equal(precision['%'], 'off');
      }
    },
    'non numeric value': {
      'topic': function () {
        return roundingPrecisionFrom('ch=a,rem=2,px=c');
      },
      'is set for all units': function (precision) {
        assert.equal(precision.ch, 'off');
        assert.equal(precision.cm, 'off');
        assert.equal(precision.em, 'off');
        assert.equal(precision.ex, 'off');
        assert.equal(precision.in, 'off');
        assert.equal(precision.mm, 'off');
        assert.equal(precision.pc, 'off');
        assert.equal(precision.pt, 'off');
        assert.equal(precision.px, 'off');
        assert.equal(precision.q, 'off');
        assert.equal(precision.rem, 2);
        assert.equal(precision.vh, 'off');
        assert.equal(precision.vmax, 'off');
        assert.equal(precision.vmin, 'off');
        assert.equal(precision.vw, 'off');
        assert.equal(precision['%'], 'off');
      }
    }
  })
  .export(module);
