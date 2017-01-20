var vows = require('vows');
var assert = require('assert');

var restoreFromOptimizing = require('../../lib/optimizer/restore-from-optimizing');
var wrapForOptimizing = require('../../lib/optimizer/wrap-for-optimizing').all;

var shallowClone = require('../../lib/optimizer/level-2/clone').shallow;
var restoreWithComponents = require('../../lib/optimizer/level-2/restore-with-components');

var populateComponents = require('../../lib/optimizer/level-2/properties/populate-components');
var validator = require('../../lib/optimizer/validator');

var compatibilityFrom = require('../../lib/options/compatibility');

vows.describe(restoreFromOptimizing)
  .addBatch({
    'without descriptor': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '0']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);
        restoreFromOptimizing(wrapped);

        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '0']
          ]
        ]);
      }
    },
    'with changed value but without descriptor': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '0']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);
        wrapped[0].value = [['property-value', '1px']];
        wrapped[0].dirty = true;
        restoreFromOptimizing(wrapped);

        return properties;
      },
      'has right output': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '1px']
          ]
        ]);
      }
    },
    'with comment': {
      'topic': function () {
        var properties = [
          [
            'comment',
            '/* comment */'
          ],
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '0']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);
        populateComponents(wrapped, validator(compatibilityFrom()));
        restoreFromOptimizing(wrapped);

        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, [
          [
            'comment',
            '/* comment */'
          ],
          [
            'property',
            ['property-name', 'margin-top'],
            ['property-value', '0']
          ]
        ]);
      }
    },
    'shorthands': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'url(image.png)']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);
        populateComponents(wrapped, validator(compatibilityFrom()));

        wrapped[0].dirty = true;

        restoreFromOptimizing(wrapped);
        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'url(image.png)']
          ]
        ]);
      }
    },
    'shorthands in simple mode': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '1px'],
            ['property-value', '2px']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);

        wrapped[0].dirty = true;

        restoreFromOptimizing(wrapped);
        return properties;
      },
      'is same as source': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'margin'],
            ['property-value', '1px'],
            ['property-value', '2px']
          ]
        ]);
      }
    },
    'values': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'url(image.png)']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);
        populateComponents(wrapped, validator(compatibilityFrom()));

        wrapped[0].value = [];
        wrapped[0].dirty = true;

        restoreFromOptimizing(wrapped, restoreWithComponents);
        return properties;
      },
      'updates value': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'url(image.png)']
          ]
        ]);
      }
    },
    'in cloned without reference to `all` 123': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'url(image.png)']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);
        populateComponents(wrapped, validator(compatibilityFrom()));

        var cloned = shallowClone(wrapped[0]);
        cloned.components = wrapped[0].components;
        cloned.dirty = true;

        restoreFromOptimizing([cloned], restoreWithComponents);
        return cloned;
      },
      'does not fail': function (cloned) {
        assert.deepEqual(cloned.value, [['property-value', 'url(image.png)']]);
      }
    }
  })
  .addBatch({
    'important': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red!important']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);

        restoreFromOptimizing(wrapped, restoreWithComponents);
        return properties;
      },
      'restores important': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red!important']
          ]
        ]);
      }
    },
    'underscore hack': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', '_color'],
            ['property-value', 'red']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);

        restoreFromOptimizing(wrapped, restoreWithComponents);
        return properties;
      },
      'restores hack': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '_color'],
            ['property-value', 'red']
          ]
        ]);
      }
    },
    'star hack': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', '*color'],
            ['property-value', 'red']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);

        restoreFromOptimizing(wrapped, restoreWithComponents);
        return properties;
      },
      'restores hack': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', '*color'],
            ['property-value', 'red']
          ]
        ]);
      }
    },
    'suffix hack': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red\\9']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);

        restoreFromOptimizing(wrapped, restoreWithComponents);
        return properties;
      },
      'restores hack': function (properties) {
        assert.deepEqual(properties, [
          [
            'property',
            ['property-name', 'color'],
            ['property-value', 'red\\9']
          ]
        ]);
      }
    }
  })
  .export(module);
