var assert = require('assert');
var vows = require('vows');

var canReorder = require('../../../lib/optimizer/level-2/reorderable').canReorder;

var extractProperties = require('../../../lib/optimizer/level-2/extract-properties');
var canReorderSingle = require('../../../lib/optimizer/level-2/reorderable').canReorderSingle;

var tokenize = require('../../../lib/tokenizer/tokenize');
var inputSourceMapTracker = require('../../../lib/reader/input-source-map-tracker');

function propertiesIn(source) {
  return extractProperties(
    tokenize(
      source,
      {
        inputSourceMapTracker: inputSourceMapTracker(),
        options: {}
      }
    )[0]
  );
}

vows.describe(canReorder)
  .addBatch({
    'empty': {
      'topic': function () {
        return canReorder(propertiesIn('a{}'), propertiesIn('a{}'), {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'left empty': {
      'topic': function () {
        return canReorder(propertiesIn('a{}'), propertiesIn('a{color:red}'), {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'right empty': {
      'topic': function () {
        return canReorder(propertiesIn('a{color:red}'), propertiesIn('a{}'), {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'all reorderable': {
      'topic': function () {
        return canReorder(propertiesIn('a{color:red;width:100%}'), propertiesIn('a{display:block;height:20px}'), {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'one not reorderable on the left': {
      'topic': function () {
        return canReorder(propertiesIn('a{color:red;width:100%;display:inline}'), propertiesIn('a{display:block;height:20px}'), {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'one not reorderable on the right': {
      'topic': function () {
        return canReorder(propertiesIn('a{color:red;width:100%}'), propertiesIn('a{display:block;height:20px;width:20px}'), {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    }
  })
  .export(module);

vows.describe(canReorderSingle)
  .addBatch({
    'different properties': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{display:block}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'font and line-height': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{font:10px}')[0], propertiesIn('a{line-height:12px}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'same properties with same value': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{color:red}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'same properties with same value and different case': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{COLOR:red}')[0], propertiesIn('a{color:red}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'same properties with different value': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{color:blue}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'same properties with different value and different case': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{COLOR:blue}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different properties with same root': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{text-shadow:none}')[0], propertiesIn('a{text-decoration:underline}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different properties with same root when shorthand does not reset': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('a{border-spacing:1px}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different properties with same root - border #1': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('a{border-top-color:red}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different properties with same root - border #2': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-top:1px solid red}')[0], propertiesIn('a{border-bottom:1px solid blue}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different properties with same root - border #3': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-top-color:red}')[0], propertiesIn('a{border-bottom:1px solid blue}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different properties with same root - border #4': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-bottom:none}')[0], propertiesIn('a{border-bottom:1px solid blue}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different properties with same root - border #5': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-bottom:none}')[0], propertiesIn('a{border-bottom:none}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different properties with same root - border #6': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-radius:3px}')[0], propertiesIn('a{border:0}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different properties with same root - border #7': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-radius:3px}')[0], propertiesIn('a{border-style:solid}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different properties with same root - border #8': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border:1px solid red}')[0], propertiesIn('a{border-right-style:dotted}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different properties with same root - border #9': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-color:red}')[0], propertiesIn('a{border-right:1px dotted}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different properties with same root - border #10': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-color:red}')[0], propertiesIn('a{border-bottom-color:rgba(0,0,0,0.5)}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different properties with same root - border #11': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border-color:red}')[0], propertiesIn('a{border-bottom-color:red}')[0], {});
      },
      'must be false': function (result) {
        assert.isTrue(result);
      }
    },
    'shorhand and longhand with different value': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{margin:3px}')[0], propertiesIn('a{margin-bottom:5px}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'shorhand and longhand with same value': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{margin:3px}')[0], propertiesIn('a{margin-bottom:3px}')[0], {});
      },
      'must be false': function (result) {
        assert.isTrue(result);
      }
    },
    'two longhand with different value sharing same shorthand': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{margin-top:3px solid red}')[0], propertiesIn('a{margin-bottom:3px solid white}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'two longhand with different value when sharing same shorthand and one is vendored': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{background-image:linear-gradient()}')[0], propertiesIn('a{-webkit-background-size:20px}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different, non-overlapping simple selectors': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('div{border:1px solid #f00}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different, non-overlapping simple selectors with inheritable property': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{font:inherit}')[0], propertiesIn('div{font-family:Helvetica}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different, non-overlapping complex selectors': {
      'topic': function () {
        return canReorderSingle(propertiesIn('.one{border:none}')[0], propertiesIn('div{border:1px solid #f00}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'different, non-overlapping complex selectors with same specificity': {
      'topic': function () {
        return canReorderSingle(propertiesIn('.one{border:none}')[0], propertiesIn('.two{border:1px solid #f00}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'different, overlapping simple selectors': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('a{border:1px solid #f00}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'align-items': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('a{align-items:flex-start}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'same but one vendor prefixed': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{-moz-box-sizing:content-box}')[0], propertiesIn('a{box-sizing:content-box}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'same and both vendor prefixed': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{-moz-box-sizing:content-box}')[0], propertiesIn('a{-moz-box-sizing:content-box}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'same but value with different vendor prefixes': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{background:-webkit-linear-gradient()}')[0], propertiesIn('a{background:-o-linear-gradient()}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'same but left vendor prefixed': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{background:-webkit-linear-gradient()}')[0], propertiesIn('a{background:linear-gradient()}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'same but right vendor prefixed': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{background:linear-gradient()}')[0], propertiesIn('a{background:-webkit-linear-gradient()}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'specificity - same #1': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{background:red}')[0], propertiesIn('a{background-color:blue}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'specificity - same #2': {
      'topic': function () {
        return canReorderSingle(propertiesIn('div a{background:red}')[0], propertiesIn('body > a{background-color:blue}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'specificity - different #1': {
      'topic': function () {
        return canReorderSingle(propertiesIn('.block{background:red}')[0], propertiesIn('a{background-color:blue}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'specificity - different #2': {
      'topic': function () {
        return canReorderSingle(propertiesIn('.block{background:red}')[0], propertiesIn('#id{background-color:blue}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'specificity - different #3': {
      'topic': function () {
        return canReorderSingle(propertiesIn('.block{background:red}')[0], propertiesIn('#id{background-color:blue}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'specificity - different #4': {
      'topic': function () {
        return canReorderSingle(propertiesIn('#id div.block-1{background:red}')[0], propertiesIn('#id > div.block-1.block-2{background-color:blue}')[0], {});
      },
      'must be true': function (result) {
        assert.isTrue(result);
      }
    },
    'specificity - complex #1': {
      'topic': function () {
        return canReorderSingle(propertiesIn('div,.block{background:red}')[0], propertiesIn('.block,#id{background-color:blue}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    }
  })
  .addBatch({
    'flex #1': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{-webkit-box-align:flex-start}')[0], propertiesIn('a{align-items:flex-start}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'flex #2': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{-ms-flex-align:start}')[0], propertiesIn('a{align-items:flex-start}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'flex #3': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{flex:none}')[0], propertiesIn('a{align-items:flex-start}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'flex #4': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{justify-content:center}')[0], propertiesIn('a{–ms-flex-pack:center}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    },
    'flex #5': {
      'topic': function () {
        return canReorderSingle(propertiesIn('a{justify-content:center}')[0], propertiesIn('a{–webkit-box-pack:center}')[0], {});
      },
      'must be false': function (result) {
        assert.isFalse(result);
      }
    }
  })
  .export(module);
