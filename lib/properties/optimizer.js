
var processableInfo = require('./processable');
var overrideCompactor = require('./override-compactor');
var shorthandCompactor = require('./shorthand-compactor');

module.exports = function Optimizer(options, context) {
  var overridable = {
    'animation-delay': ['animation'],
    'animation-direction': ['animation'],
    'animation-duration': ['animation'],
    'animation-fill-mode': ['animation'],
    'animation-iteration-count': ['animation'],
    'animation-name': ['animation'],
    'animation-play-state': ['animation'],
    'animation-timing-function': ['animation'],
    '-moz-animation-delay': ['-moz-animation'],
    '-moz-animation-direction': ['-moz-animation'],
    '-moz-animation-duration': ['-moz-animation'],
    '-moz-animation-fill-mode': ['-moz-animation'],
    '-moz-animation-iteration-count': ['-moz-animation'],
    '-moz-animation-name': ['-moz-animation'],
    '-moz-animation-play-state': ['-moz-animation'],
    '-moz-animation-timing-function': ['-moz-animation'],
    '-o-animation-delay': ['-o-animation'],
    '-o-animation-direction': ['-o-animation'],
    '-o-animation-duration': ['-o-animation'],
    '-o-animation-fill-mode': ['-o-animation'],
    '-o-animation-iteration-count': ['-o-animation'],
    '-o-animation-name': ['-o-animation'],
    '-o-animation-play-state': ['-o-animation'],
    '-o-animation-timing-function': ['-o-animation'],
    '-webkit-animation-delay': ['-webkit-animation'],
    '-webkit-animation-direction': ['-webkit-animation'],
    '-webkit-animation-duration': ['-webkit-animation'],
    '-webkit-animation-fill-mode': ['-webkit-animation'],
    '-webkit-animation-iteration-count': ['-webkit-animation'],
    '-webkit-animation-name': ['-webkit-animation'],
    '-webkit-animation-play-state': ['-webkit-animation'],
    '-webkit-animation-timing-function': ['-webkit-animation'],
    'background-clip': ['background'],
    'background-origin': ['background'],
    'border-color': ['border'],
    'border-style': ['border'],
    'border-width': ['border'],
    'border-bottom': ['border'],
    'border-bottom-color': ['border-bottom', 'border-color', 'border'],
    'border-bottom-style': ['border-bottom', 'border-style', 'border'],
    'border-bottom-width': ['border-bottom', 'border-width', 'border'],
    'border-left': ['border'],
    'border-left-color': ['border-left', 'border-color', 'border'],
    'border-left-style': ['border-left', 'border-style', 'border'],
    'border-left-width': ['border-left', 'border-width', 'border'],
    'border-right': ['border'],
    'border-right-color': ['border-right', 'border-color', 'border'],
    'border-right-style': ['border-right', 'border-style', 'border'],
    'border-right-width': ['border-right', 'border-width', 'border'],
    'border-top': ['border'],
    'border-top-color': ['border-top', 'border-color', 'border'],
    'border-top-style': ['border-top', 'border-style', 'border'],
    'border-top-width': ['border-top', 'border-width', 'border'],
    'font-family': ['font'],
    'font-size': ['font'],
    'font-style': ['font'],
    'font-variant': ['font'],
    'font-weight': ['font'],
    'margin-bottom': ['margin'],
    'margin-left': ['margin'],
    'margin-right': ['margin'],
    'margin-top': ['margin'],
    'padding-bottom': ['padding'],
    'padding-left': ['padding'],
    'padding-right': ['padding'],
    'padding-top': ['padding'],
    'transition-delay': ['transition'],
    'transition-duration': ['transition'],
    'transition-property': ['transition'],
    'transition-timing-function': ['transition'],
    '-moz-transition-delay': ['-moz-transition'],
    '-moz-transition-duration': ['-moz-transition'],
    '-moz-transition-property': ['-moz-transition'],
    '-moz-transition-timing-function': ['-moz-transition'],
    '-o-transition-delay': ['-o-transition'],
    '-o-transition-duration': ['-o-transition'],
    '-o-transition-property': ['-o-transition'],
    '-o-transition-timing-function': ['-o-transition'],
    '-webkit-transition-delay': ['-webkit-transition'],
    '-webkit-transition-duration': ['-webkit-transition'],
    '-webkit-transition-property': ['-webkit-transition'],
    '-webkit-transition-timing-function': ['-webkit-transition']
  };

  var compatibility = options.compatibility;
  var aggressiveMerging = options.aggressiveMerging;
  var shorthandCompacting = options.shorthandCompacting;

  var IE_BACKSLASH_HACK = '\\9';
  var processable = processableInfo.processable(compatibility);

  var overrides = {};
  for (var granular in overridable) {
    for (var i = 0; i < overridable[granular].length; i++) {
      var coarse = overridable[granular][i];
      var list = overrides[coarse];

      if (list)
        list.push(granular);
      else
        overrides[coarse] = [granular];
    }
  }

  var tokenize = function(properties, selector) {
    var tokenized = [];

    for (var i = 0, l = properties.length; i < l; i++) {
      var property = properties[i];
      var firstColon = property[0].indexOf(':');
      var name = property[0].substring(0, firstColon);
      var value = property[0].substring(firstColon + 1);
      if (value === '') {
        context.warnings.push('Empty property \'' + name + '\' inside \'' + selector.join(',') + '\' selector. Ignoring.');
        continue;
      }

      tokenized.push([
        name,
        value,
        value.indexOf('!important') > -1,
        property[0].indexOf(IE_BACKSLASH_HACK, firstColon + 1) === property[0].length - IE_BACKSLASH_HACK.length,
        property.slice(1)
      ]);
    }

    return tokenized;
  };

  var optimize = function(properties, allowAdjacent) {
    var merged = [];
    var names = [];
    var lastName = null;
    var rescanTrigger = {};

    var removeOverridenBy = function(property, isImportant) {
      var overrided = overrides[property];
      for (var i = 0, l = overrided.length; i < l; i++) {
        for (var j = 0; j < names.length; j++) {
          if (names[j] != overrided[i] || (merged[j][2] && !isImportant))
            continue;

          merged.splice(j, 1);
          names.splice(j, 1);
          j -= 1;
        }
      }
    };

    var mergeablePosition = function(position) {
      if (allowAdjacent === false || allowAdjacent === true)
        return allowAdjacent;

      return allowAdjacent.indexOf(position) > -1;
    };

    propertiesLoop:
    for (var i = 0, l = properties.length; i < l; i++) {
      var property = properties[i];
      var name = property[0];
      var value = property[1];
      var isImportant = property[2];
      var isIEHack = property[3];
      var _name = (name == '-ms-filter' || name == 'filter') ?
        (lastName == 'background' || lastName == 'background-image' ? lastName : name) :
        name;
      var toOverridePosition = 0;

      if (isIEHack && !compatibility.properties.ieSuffixHack)
        continue;

      // comment is necessary - we assume that if two properties are one after another
      // then it is intentional way of redefining property which may not be widely supported
      // e.g. a{display:inline-block;display:-moz-inline-box}
      // however if `mergeablePosition` yields true then the rule does not apply
      // (e.g merging two adjacent selectors: `a{display:block}a{display:block}`)
      if (aggressiveMerging && name !== '' && _name != lastName || mergeablePosition(i)) {
        while (true) {
          toOverridePosition = names.indexOf(_name, toOverridePosition);
          if (toOverridePosition == -1)
            break;

          var lastToken = merged[toOverridePosition];
          var wasImportant = lastToken[2];
          var wasIEHack = lastToken[3];

          if (wasImportant && !isImportant)
            continue propertiesLoop;

          if (compatibility.properties.ieSuffixHack && !wasIEHack && isIEHack)
            break;

          var _info = processable[_name];
          if (!isIEHack && !wasIEHack && _info && _info.canOverride && !_info.canOverride(properties[toOverridePosition][1], value))
            break;

          merged.splice(toOverridePosition, 1);
          names.splice(toOverridePosition, 1);
        }
      }

      merged.push(property);
      names.push(_name);

      // certain properties (see values of `overridable`) should trigger removal of
      // more granular properties (see keys of `overridable`)
      if (rescanTrigger[_name])
        removeOverridenBy(_name, isImportant);

      // add rescan triggers - if certain property appears later in the list a rescan needs
      // to be triggered, e.g 'border-top' triggers a rescan after 'border-top-width' and
      // 'border-top-color' as they can be removed
      for (var j = 0, list = overridable[_name] || [], m = list.length; j < m; j++)
        rescanTrigger[list[j]] = true;

      lastName = _name;
    }

    return merged;
  };

  var rebuild = function(properties) {
    var rebuilt = [];
    var eligibleForCompacting = false;

    for (var i = 0, l = properties.length; i < l; i++) {
      if (!eligibleForCompacting && processableInfo.implementedFor.test(properties[i][0]))
        eligibleForCompacting = true;

      // FIXME: the check should be gone with #407
      var property = !properties[i][0] && properties[i][1].indexOf('__ESCAPED_') === 0 ?
        properties[i][1] :
        properties[i][0] + ':' + properties[i][1];
      var metadata = properties[i].pop();

      rebuilt.push([property].concat(metadata));
    }

    return {
      compactFurther: eligibleForCompacting,
      list: rebuilt
    };
  };

  var compact = function (input) {
    var Token = processableInfo.Token;

    var tokens = Token.tokenize(input);

    tokens = overrideCompactor.compactOverrides(tokens, processable, Token, compatibility);
    tokens = shorthandCompactor.compactShorthands(tokens, false, processable, Token);
    tokens = shorthandCompactor.compactShorthands(tokens, true, processable, Token);

    return Token.detokenize(tokens);
  };

  return {
    process: function(selector, properties, allowAdjacent, compactProperties) {
      var tokenized = tokenize(properties, selector);
      var optimized = optimize(tokenized, allowAdjacent);
      var rebuilt = rebuild(optimized);

      return shorthandCompacting && compactProperties && rebuilt.compactFurther ?
        compact(rebuilt.list) :
        rebuilt.list;
    }
  };
};
