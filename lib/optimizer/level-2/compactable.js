// Contains the interpretation of CSS properties, as used by the property optimizer

var breakUp = require('./break-up');
var canOverride = require('./can-override');
var restore = require('./restore');

// Properties to process
// Extend this object in order to add support for more properties in the optimizer.
//
// Each key in this object represents a CSS property and should be an object.
// Such an object contains properties that describe how the represented CSS property should be handled.
// Possible options:
//
// * components: array (Only specify for shorthand properties.)
//   Contains the names of the granular properties this shorthand compacts.
//
// * canOverride: function (Default is canOverride.sameValue - meaning that they'll only be merged if they have the same value.)
//   Returns whether two tokens of this property can be merged with each other.
//   This property has no meaning for shorthands.
//
// * defaultValue: string
//   Specifies the default value of the property according to the CSS standard.
//   For shorthand, this is used when every component is set to its default value, therefore it should be the shortest possible default value of all the components.
//
// * shortestValue: string
//   Specifies the shortest possible value the property can possibly have.
//   (Falls back to defaultValue if unspecified.)
//
// * breakUp: function (Only specify for shorthand properties.)
//   Breaks the shorthand up to its components.
//
// * restore: function (Only specify for shorthand properties.)
//   Puts the shorthand together from its components.
//
var compactable = {
  'color': {
    canOverride: canOverride.color,
    defaultValue: 'transparent',
    shortestValue: 'red'
  },
  'background': {
    components: [
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-attachment',
      'background-origin',
      'background-clip',
      'background-color'
    ],
    breakUp: breakUp.multiplex(breakUp.background),
    defaultValue: '0 0',
    restore: restore.multiplex(restore.background),
    shortestValue: '0',
    shorthand: true
  },
  'background-clip': {
    canOverride: canOverride.always,
    componentOf: [
      'background'
    ],
    defaultValue: 'border-box',
    shortestValue: 'border-box'
  },
  'background-color': {
    canOverride: canOverride.color,
    componentOf: [
      'background'
    ],
    defaultValue: 'transparent',
    multiplexLastOnly: true,
    nonMergeableValue: 'none',
    shortestValue: 'red'
  },
  'background-image': {
    canOverride: canOverride.backgroundImage,
    componentOf: [
      'background'
    ],
    defaultValue: 'none'
  },
  'background-origin': {
    canOverride: canOverride.always,
    componentOf: [
      'background'
    ],
    defaultValue: 'padding-box',
    shortestValue: 'border-box'
  },
  'background-repeat': {
    canOverride: canOverride.always,
    componentOf: [
      'background'
    ],
    defaultValue: ['repeat'],
    doubleValues: true
  },
  'background-position': {
    canOverride: canOverride.alwaysButIntoFunction,
    componentOf: [
      'background'
    ],
    defaultValue: ['0', '0'],
    doubleValues: true,
    shortestValue: '0'
  },
  'background-size': {
    canOverride: canOverride.alwaysButIntoFunction,
    componentOf: [
      'background'
    ],
    defaultValue: ['auto'],
    doubleValues: true,
    shortestValue: '0 0'
  },
  'background-attachment': {
    canOverride: canOverride.always,
    componentOf: [
      'background'
    ],
    defaultValue: 'scroll'
  },
  'border': {
    breakUp: breakUp.border,
    canOverride: canOverride.border,
    components: [
      'border-width',
      'border-style',
      'border-color'
    ],
    defaultValue: 'none',
    overridesShorthands: [
      'border-bottom',
      'border-left',
      'border-right',
      'border-top'
    ],
    restore: restore.withoutDefaults,
    shorthand: true,
    shorthandComponents: true
  },
  'border-bottom': {
    breakUp: breakUp.border,
    canOverride: canOverride.border,
    components: [
      'border-bottom-width',
      'border-bottom-style',
      'border-bottom-color'
    ],
    defaultValue: 'none',
    restore: restore.withoutDefaults,
    shorthand: true
  },
  'border-bottom-color': {
    canOverride: canOverride.color,
    componentOf: [
      'border-bottom',
      'border-color'
    ],
    defaultValue: 'none'
  },
  'border-bottom-style': {
    canOverride: canOverride.always,
    componentOf: [
      'border-bottom',
      'border-style'
    ],
    defaultValue: 'none'
  },
  'border-bottom-width': {
    canOverride: canOverride.unit,
    componentOf: [
      'border-bottom',
      'border-width'
    ],
    defaultValue: 'medium',
    shortestValue: '0'
  },
  'border-color': {
    breakUp: breakUp.fourValues,
    canOverride: canOverride.color,
    componentOf: ['border'],
    components: [
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color'
    ],
    defaultValue: 'none',
    restore: restore.fourValues,
    shortestValue: 'red',
    shorthand: true
  },
  'border-left': {
    breakUp: breakUp.border,
    canOverride: canOverride.border,
    components: [
      'border-left-width',
      'border-left-style',
      'border-left-color'
    ],
    defaultValue: 'none',
    restore: restore.withoutDefaults,
    shorthand: true
  },
  'border-left-color': {
    canOverride: canOverride.color,
    componentOf: [
      'border-color',
      'border-left'
    ],
    defaultValue: 'none'
  },
  'border-left-style': {
    canOverride: canOverride.always,
    componentOf: [
      'border-left',
      'border-style'
    ],
    defaultValue: 'none'
  },
  'border-left-width': {
    canOverride: canOverride.unit,
    componentOf: [
      'border-left',
      'border-width'
    ],
    defaultValue: 'medium',
    shortestValue: '0'
  },
  'border-right': {
    breakUp: breakUp.border,
    canOverride: canOverride.border,
    components: [
      'border-right-width',
      'border-right-style',
      'border-right-color'
    ],
    defaultValue: 'none',
    restore: restore.withoutDefaults,
    shorthand: true
  },
  'border-right-color': {
    canOverride: canOverride.color,
    componentOf: [
      'border-color',
      'border-right'
    ],
    defaultValue: 'none'
  },
  'border-right-style': {
    canOverride: canOverride.always,
    componentOf: [
      'border-right',
      'border-style'
    ],
    defaultValue: 'none'
  },
  'border-right-width': {
    canOverride: canOverride.unit,
    componentOf: [
      'border-right',
      'border-width'
    ],
    defaultValue: 'medium',
    shortestValue: '0'
  },
  'border-style': {
    breakUp: breakUp.fourValues,
    canOverride: canOverride.always,
    componentOf: [
      'border'
    ],
    components: [
      'border-top-style',
      'border-right-style',
      'border-bottom-style',
      'border-left-style'
    ],
    defaultValue: 'none',
    restore: restore.fourValues,
    shorthand: true
  },
  'border-top': {
    breakUp: breakUp.border,
    canOverride: canOverride.border,
    components: [
      'border-top-width',
      'border-top-style',
      'border-top-color'
    ],
    defaultValue: 'none',
    restore: restore.withoutDefaults,
    shorthand: true
  },
  'border-top-color': {
    canOverride: canOverride.color,
    componentOf: [
      'border-color',
      'border-top'
    ],
    defaultValue: 'none'
  },
  'border-top-style': {
    canOverride: canOverride.always,
    componentOf: [
      'border-style',
      'border-top'
    ],
    defaultValue: 'none'
  },
  'border-top-width': {
    canOverride: canOverride.unit,
    componentOf: [
      'border-top',
      'border-width'
    ],
    defaultValue: 'medium',
    shortestValue: '0'
  },
  'border-width': {
    breakUp: breakUp.fourValues,
    canOverride: canOverride.unit,
    components: [
      'border-top-width',
      'border-right-width',
      'border-bottom-width',
      'border-left-width'
    ],
    defaultValue: 'medium',
    restore: restore.fourValues,
    shortestValue: '0',
    shorthand: true
  },
  'font-size': {
    canOverride: canOverride.unit,
    defaultValue: 'medium',
    shortestValue: '0'
  },
  'height': {
    canOverride: canOverride.unit,
    defaultValue: 'auto',
    shortestValue: '0'
  },
  'list-style': {
    components: [
      'list-style-type',
      'list-style-position',
      'list-style-image'
    ],
    canOverride: canOverride.always,
    breakUp: breakUp.listStyle,
    restore: restore.withoutDefaults,
    defaultValue: 'outside', // can't use 'disc' because that'd override default 'decimal' for <ol>
    shortestValue: 'none',
    shorthand: true
  },
  'list-style-type' : {
    canOverride: canOverride.always,
    componentOf: [
      'list-style'
    ],
    defaultValue: '__hack',
    // NOTE: we can't tell the real default value here, it's 'disc' for <ul> and 'decimal' for <ol>
    //       -- this is a hack, but it doesn't matter because this value will be either overridden or it will disappear at the final step anyway
    shortestValue: 'none'
  },
  'list-style-position' : {
    canOverride: canOverride.always,
    componentOf: [
      'list-style'
    ],
    defaultValue: 'outside',
    shortestValue: 'inside'
  },
  'list-style-image' : {
    canOverride: canOverride.always,
    componentOf: [
      'list-style'
    ],
    defaultValue: 'none'
  },
  'outline': {
    components: [
      'outline-color',
      'outline-style',
      'outline-width'
    ],
    breakUp: breakUp.outline,
    restore: restore.withoutDefaults,
    defaultValue: '0',
    shorthand: true
  },
  'outline-color': {
    canOverride: canOverride.color,
    componentOf: [
      'outline'
    ],
    defaultValue: 'invert',
    shortestValue: 'red'
  },
  'outline-style': {
    canOverride: canOverride.always,
    componentOf: [
      'outline'
    ],
    defaultValue: 'none'
  },
  'outline-width': {
    canOverride: canOverride.unit,
    componentOf: [
      'outline'
    ],
    defaultValue: 'medium',
    shortestValue: '0'
  },
  '-moz-transform': {
    canOverride: canOverride.sameFunctionOrValue
  },
  '-ms-transform': {
    canOverride: canOverride.sameFunctionOrValue
  },
  '-webkit-transform': {
    canOverride: canOverride.sameFunctionOrValue
  },
  'transform': {
    canOverride: canOverride.sameFunctionOrValue
  },
  'width': {
    canOverride: canOverride.unit,
    defaultValue: 'auto',
    shortestValue: '0'
  }
};

var addFourValueShorthand = function (prop, components, options) {
  options = options || {};
  compactable[prop] = {
    canOverride: options.canOverride,
    components: components,
    breakUp: options.breakUp || breakUp.fourValues,
    defaultValue: options.defaultValue || '0',
    restore: options.restore || restore.fourValues,
    shortestValue: options.shortestValue,
    shorthand: true
  };
  for (var i = 0; i < components.length; i++) {
    compactable[components[i]] = {
      breakUp: options.breakUp || breakUp.fourValues,
      canOverride: options.canOverride || canOverride.unit,
      componentOf: options.componentOf,
      defaultValue: options.defaultValue || '0',
      shortestValue: options.shortestValue
    };
  }
};

['', '-moz-', '-o-', '-webkit-'].forEach(function (prefix) {
  addFourValueShorthand(prefix + 'border-radius', [
    prefix + 'border-top-left-radius',
    prefix + 'border-top-right-radius',
    prefix + 'border-bottom-right-radius',
    prefix + 'border-bottom-left-radius'
  ], {
    breakUp: breakUp.borderRadius,
    componentOf: [
      prefix + 'border-radius'
    ],
    restore: restore.borderRadius
  });
});

addFourValueShorthand('padding', [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left'
], {
  componentOf: [
    'padding'
  ]
});

addFourValueShorthand('margin', [
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left'
], {
  componentOf: [
    'margin'
  ]
});

module.exports = compactable;
