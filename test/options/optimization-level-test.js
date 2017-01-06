var assert = require('assert');

var vows = require('vows');

var roundingPrecisionFrom = require('../../lib/utils/rounding-precision').roundingPrecisionFrom;
var optimizationLevelFrom = require('../../lib/options/optimization-level').optimizationLevelFrom;

vows.describe(optimizationLevelFrom)
  .addBatch({
    'undefined': {
      'topic': function () {
        return optimizationLevelFrom(undefined);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: true,
          restructuring: true,
          semanticMerging: false,
          shorthandCompacting: true
        });
      }
    },
    'number - level 0': {
      'topic': function () {
        return optimizationLevelFrom(0);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      }
    },
    'number - level 1': {
      'topic': function () {
        return optimizationLevelFrom(1);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      }
    },
    'number - level 2': {
      'topic': function () {
        return optimizationLevelFrom(2);
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: true,
          restructuring: true,
          semanticMerging: false,
          shorthandCompacting: true
        });
      }
    },
    'string with value': {
      'topic': function () {
        return optimizationLevelFrom('0');
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      }
    },
    'a hash': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { specialComments: 0 }, 2: true });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 0
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: true,
          restructuring: true,
          semanticMerging: false,
          shorthandCompacting: true
        });
      }
    },
    'a hash with all keyword': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { specialComments: 0 }, 2: { all: false, mediaMerging: true } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 0
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: true,
          restructuring: false,
          semanticMerging: false,
          shorthandCompacting: false
        });
      }
    },
    'a hash with * keyword': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { specialComments: 0 }, 2: { '*': false, mediaMerging: true } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 0
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: true,
          restructuring: false,
          semanticMerging: false,
          shorthandCompacting: false
        });
      }
    },
    'a hash with options as strings': {
      'topic': function () {
        return optimizationLevelFrom({ 1: 'roundingPrecision:3;specialComments:0' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(3),
          specialComments: 0
        });
      }
    },
    'a hash with options as strings with boolean values': {
      'topic': function () {
        return optimizationLevelFrom({ 2: 'mediaMerging:false;semanticMerging:true' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: false,
          restructuring: true,
          semanticMerging: true,
          shorthandCompacting: true
        });
      }
    },
    'a hash with options as strings with boolean values as on/off': {
      'topic': function () {
        return optimizationLevelFrom({ 2: 'mediaMerging:off;semanticMerging:on' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: false,
          restructuring: true,
          semanticMerging: true,
          shorthandCompacting: true
        });
      }
    },
    'a hash with options as strings with all keyword': {
      'topic': function () {
        return optimizationLevelFrom({ 2: 'all:false;mediaMerging:true;semanticMerging:true' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: true,
          restructuring: false,
          semanticMerging: true,
          shorthandCompacting: false
        });
      }
    },
    'a hash with options as strings with * keyword': {
      'topic': function () {
        return optimizationLevelFrom({ 2: '*:false;mediaMerging:true;semanticMerging:true' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1', '2']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      },
      'has level 2 options': function (levelOptions) {
        assert.deepEqual(levelOptions['2'], {
          mediaMerging: true,
          restructuring: false,
          semanticMerging: true,
          shorthandCompacting: false
        });
      }
    },
    'a hash with options as undefined/boolean': {
      'topic': function () {
        return optimizationLevelFrom({ 0: undefined, 1: true, 2: undefined });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: roundingPrecisionFrom(undefined),
          specialComments: 'all'
        });
      }
    },
    'a hash with roundingPrecision as number': {
      'topic': function () {
        return optimizationLevelFrom({ 1: { roundingPrecision: 4 } });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: {
            'ch': 4,
            'cm': 4,
            'em': 4,
            'ex': 4,
            'in': 4,
            'mm': 4,
            'pc': 4,
            'pt': 4,
            'px': 4,
            'q': 4,
            'rem': 4,
            'vh': 4,
            'vmax': 4,
            'vmin': 4,
            'vw': 4,
            '%': 4
          },
          specialComments: 'all'
        });
      }
    },
    'a hash with complex roundingPrecision': {
      'topic': function () {
        return optimizationLevelFrom({ 1: 'roundingPrecision:all=5,rem=off,%=1' });
      },
      'has all options': function (levelOptions) {
        assert.deepEqual(Object.keys(levelOptions), ['0', '1']);
      },
      'has level 0 options': function (levelOptions) {
        assert.deepEqual(levelOptions['0'], {});
      },
      'has level 1 options': function (levelOptions) {
        assert.deepEqual(levelOptions['1'], {
          roundingPrecision: {
            'ch': 5,
            'cm': 5,
            'em': 5,
            'ex': 5,
            'in': 5,
            'mm': 5,
            'pc': 5,
            'pt': 5,
            'px': 5,
            'q': 5,
            'rem': 'off',
            'vh': 5,
            'vmax': 5,
            'vmin': 5,
            'vw': 5,
            '%': 1
          },
          specialComments: 'all'
        });
      }
    }
  })
  .export(module);
