var SourceMapGenerator = require('source-map').SourceMapGenerator;

var lineBreak = require('os').EOL;
var unknownSource = '$stdin';

function hasMoreProperties(elements, index) {
  for (var i = index, l = elements.length; i < l; i++) {
    if (typeof elements[i] != 'string')
      return true;
  }

  return false;
}

function Rebuilder(options, restoreCallback, inputMapTracker) {
  this.column = 0;
  this.line = 1;
  this.output = [];
  this.keepBreaks = options.keepBreaks;
  this.sourceMapInlineSources = options.sourceMapInlineSources;
  this.restore = restoreCallback;
  this.inputMapTracker = inputMapTracker;
  this.outputMap = new SourceMapGenerator();
}

Rebuilder.prototype.rebuildSelectors = function (elements) {
  for (var i = 0, l = elements.length; i < l; i++) {
    var element = elements[i];
    this.store(element);

    if (i < l - 1)
      this.store(',');
  }
};

Rebuilder.prototype.rebuildBody = function (elements) {
  for (var i = 0, l = elements.length; i < l; i++) {
    var element = elements[i];

    if (typeof element == 'string') {
      this.store(element);
      continue;
    }

    for (var j = 0, m = element.length; j < m; j++) {
      this.store(element[j]);

      if (j == m - 1 && element[0][1])
        this.store('!important');

      if (j === 0) {
        this.store(':');
      } else if (j < m - 1) {
        this.store(' ');
      } else if (i < l - 1 && hasMoreProperties(elements, i + 1)) {
        this.store(';');
      }
    }
  }
};

Rebuilder.prototype.store = function (element) {
  // handles defaults and values like `,` or `/` which do not have mapping
  if (Array.isArray(element) && element.length == 1)
    element = element[0];

  var fromString = typeof element == 'string';
  var value = fromString ? element : element[0];

  if (value.indexOf('_') > -1)
    value = this.restore(value);

  this.track(value, fromString ? null : element);
  this.output.push(value);
};

Rebuilder.prototype.rebuildList = function (tokens, isFlatBlock) {
  var joinCharacter = isFlatBlock ? ';' : (this.keepBreaks ? lineBreak : '');

  for (var i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];

    switch (token[0]) {
      case 'at-rule':
      case 'text':
        this.store(token[1][0]);
        break;
      case 'block':
        this.rebuildSelectors([token[1]]);
        this.store('{');
        this.rebuildList(token[2], false);
        this.store('}');
        this.store(joinCharacter);
        break;
      case 'flat-block':
        this.rebuildSelectors([token[1]]);
        this.store('{');
        this.rebuildBody(token[2]);
        this.store('}');
        this.store(joinCharacter);
        break;
      default:
        this.rebuildSelectors(token[1]);
        this.store('{');
        this.rebuildBody(token[2]);
        this.store('}');
        this.store(joinCharacter);
    }
  }
};

Rebuilder.prototype.track = function (value, element) {
  if (element)
    this.trackMetadata(element);

  var parts = value.split('\n');
  this.line += parts.length - 1;
  this.column = parts.length > 1 ? 0 : (this.column + parts.pop().length);
};

Rebuilder.prototype.trackMetadata = function (element) {
  var sourceAt = element.length - 1;
  if (typeof element[sourceAt] == 'object')
    sourceAt--;

  var source = element[sourceAt] || unknownSource;

  this.outputMap.addMapping({
    generated: {
      line: this.line,
      column: this.column
    },
    source: source,
    original: {
      line: element[sourceAt - 2],
      column: element[sourceAt - 1]
    }
  });

  if (element[sourceAt + 1])
    this.outputMap.setSourceContent(source, element[sourceAt + 1][element[sourceAt]]);
};

function SourceMapStringifier(options, restoreCallback, inputMapTracker) {
  this.rebuilder = new Rebuilder(options, restoreCallback, inputMapTracker);
}

SourceMapStringifier.prototype.toString = function (tokens) {
  this.rebuilder.rebuildList(tokens);

  return {
    sourceMap: this.rebuilder.outputMap,
    styles: this.rebuilder.output.join('').trim()
  };
};

module.exports = SourceMapStringifier;
