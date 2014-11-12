var SourceMapGenerator = require('source-map').SourceMapGenerator;

var lineBreak = require('os').EOL;

function SourceMapStringifier(options, restoreCallback, inputMapTracker) {
  this.keepBreaks = options.keepBreaks;
  this.restoreCallback = restoreCallback;
  this.outputMap = new SourceMapGenerator();
  this.inputMapTracker = inputMapTracker;
}

function valueRebuilder(list, store, separator) {
  for (var i = 0, l = list.length; i < l; i++) {
    store(list[i]);
    store(i < l - 1 ? separator : '');
  }
}

function rebuild(tokens, store, keepBreaks, isFlatBlock) {
  var joinCharacter = isFlatBlock ? ';' : (keepBreaks ? lineBreak : '');

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    if (token.kind === 'text' || token.kind == 'at-rule') {
      store(token);
      continue;
    }

    // FIXME: broken due to joining/splitting
    if (token.body && (token.body.length === 0 || (token.body.length == 1 && token.body[0].value === '')))
      continue;

    if (token.kind == 'block') {
      if (token.body.length > 0) {
        valueRebuilder([{ value: token.value, metadata: token.metadata }], store, '');
        store('{');
        if (token.isFlatBlock)
          valueRebuilder(token.body, store, ';');
        else
          rebuild(token.body, store, keepBreaks, false);
        store('}');
      }
    } else {
      valueRebuilder(token.value, store, ',');
      store('{');
      valueRebuilder(token.body, store, ';');
      store('}');
    }

    store(joinCharacter);
  }
}

function track(context, value, metadata) {
  if (metadata) {
    var original = context.inputMapTracker.isTracking() ?
      context.inputMapTracker.originalPositionFor(metadata) :
      {};

    context.outputMap.addMapping({
      generated: {
        line: context.line,
        column: context.column,
      },
      source: original.source || metadata.source || '__stdin__.css',
      original: {
        line: original.line || metadata.line,
        column: original.column || metadata.column
      },
      name: value
    });
  }

  var parts = value.split('\n');
  context.line += parts.length - 1;
  context.column = parts.length > 1 ? 1 : (context.column + parts.pop().length);
}

SourceMapStringifier.prototype.toString = function (tokens) {
  var self = this;
  var output = [];
  var context = {
    column: 1,
    line: 1,
    inputMapTracker: this.inputMapTracker,
    outputMap: this.outputMap
  };

  function store(token) {
    if (typeof token == 'string') {
      track(context, token);
      output.push(token);
    } else {
      var val = self.restoreCallback(token.value);
      track(context, val, token.metadata);
      output.push(val);
    }
  }

  rebuild(tokens, store, this.keepBreaks, false);

  return {
    sourceMap: this.outputMap,
    styles: output.join('').trim()
  };
};

module.exports = SourceMapStringifier;
