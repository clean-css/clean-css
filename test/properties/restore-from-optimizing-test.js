var vows = require('vows');
var assert = require('assert');

var wrapForOptimizing = require('../../lib/properties/wrap-for-optimizing').all;
var populateComponents = require('../../lib/properties/populate-components');
var shallowClone = require('../../lib/properties/clone').shallow;

var restoreFromOptimizing = require('../../lib/properties/restore-from-optimizing');

var compatibility = require('../../lib/utils/compatibility');
var Validator = require('../../lib/properties/validator');

var validator = new Validator(compatibility());

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
        populateComponents(wrapped, validator);
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
        populateComponents(wrapped, validator);

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

        restoreFromOptimizing(wrapped, true);
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
        populateComponents(wrapped, validator);

        wrapped[0].value = [];
        wrapped[0].dirty = true;

        restoreFromOptimizing(wrapped);
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
    'in cloned without reference to `all`': {
      'topic': function () {
        var properties = [
          [
            'property',
            ['property-name', 'background'],
            ['property-value', 'url(image.png)']
          ]
        ];
        var wrapped = wrapForOptimizing(properties);
        populateComponents(wrapped, validator);

        var cloned = shallowClone(wrapped[0]);
        cloned.components = wrapped[0].components;
        cloned.dirty = true;

        restoreFromOptimizing([cloned]);
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

        restoreFromOptimizing(wrapped, true);
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

        restoreFromOptimizing(wrapped, true);
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

        restoreFromOptimizing(wrapped, true);
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

        restoreFromOptimizing(wrapped, true);
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
