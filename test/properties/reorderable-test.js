var vows = require('vows');
var assert = require('assert');

var SelectorTokenizer = require('../../lib/selectors/tokenizer');
var extractProperties = require('../../lib/properties/extractor');
var canReorder = require('../../lib/properties/reorderable').canReorder;
var canReorderSingle = require('../../lib/properties/reorderable').canReorderSingle;

function propertiesIn(source) {
  return extractProperties(new SelectorTokenizer({ options: {} }, false).toTokens(source)[0]);
}

vows.describe(canReorder)
  .addBatch({
    'empty': {
      'topic': canReorder(propertiesIn('a{}'), propertiesIn('a{}')),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'left empty': {
      'topic': canReorder(propertiesIn('a{}'), propertiesIn('a{color:red}')),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'right empty': {
      'topic': canReorder(propertiesIn('a{color:red}'), propertiesIn('a{}')),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'all reorderable': {
      'topic': canReorder(propertiesIn('a{color:red;width:100%}'), propertiesIn('a{display:block;height:20px}')),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'one not reorderable on the left': {
      'topic': canReorder(propertiesIn('a{color:red;width:100%;display:inline}'), propertiesIn('a{display:block;height:20px}')),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'one not reorderable on the right': {
      'topic': canReorder(propertiesIn('a{color:red;width:100%}'), propertiesIn('a{display:block;height:20px;width:20px}')),
      'must be false': function (result) { assert.isFalse(result); }
    }
  })
  .export(module);

vows.describe(canReorderSingle)
  .addBatch({
    'different properties': {
      'topic': canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{display:block}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'font and line-height': {
      'topic': canReorderSingle(propertiesIn('a{font:10px}')[0], propertiesIn('a{line-height:12px}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'same properties with same value': {
      'topic': canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{color:red}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'same properties with same value and different case': {
      'topic': canReorderSingle(propertiesIn('a{COLOR:red}')[0], propertiesIn('a{color:red}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'same properties with different value': {
      'topic': canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{color:blue}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'same properties with different value and different case': {
      'topic': canReorderSingle(propertiesIn('a{color:red}')[0], propertiesIn('a{COLOR:blue}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'different properties with same root': {
      'topic': canReorderSingle(propertiesIn('a{text-shadow:none}')[0], propertiesIn('a{text-decoration:underline}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'different properties with same root when shorthand does not reset': {
      'topic': canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('a{border-spacing:1px}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'shorhand and longhand with different value': {
      'topic': canReorderSingle(propertiesIn('a{margin:3px}')[0], propertiesIn('a{margin-bottom:5px}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'shorhand and longhand with same value': {
      'topic': canReorderSingle(propertiesIn('a{margin:3px}')[0], propertiesIn('a{margin-bottom:3px}')[0]),
      'must be false': function (result) { assert.isTrue(result); }
    },
    'two longhand with different value sharing same shorthand': {
      'topic': canReorderSingle(propertiesIn('a{margin-top:3px solid red}')[0], propertiesIn('a{margin-bottom:3px solid white}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'different, non-overlapping simple selectors': {
      'topic': canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('div{border:1px solid #f00}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    },
    'different, non-overlapping complex selectors': {
      'topic': canReorderSingle(propertiesIn('.one{border:none}')[0], propertiesIn('div{border:1px solid #f00}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'different, overlapping simple selectors': {
      'topic': canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('a{border:1px solid #f00}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'align-items': {
      'topic': canReorderSingle(propertiesIn('a{border:none}')[0], propertiesIn('a{align-items:flex-start}')[0]),
      'must be true': function (result) { assert.isTrue(result); }
    }
  })
  .addBatch({
    'flex #1': {
      'topic': canReorderSingle(propertiesIn('a{-webkit-box-align:flex-start}')[0], propertiesIn('a{align-items:flex-start}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'flex #2': {
      'topic': canReorderSingle(propertiesIn('a{-ms-flex-align:start}')[0], propertiesIn('a{align-items:flex-start}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'flex #3': {
      'topic': canReorderSingle(propertiesIn('a{flex:none}')[0], propertiesIn('a{align-items:flex-start}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'flex #4': {
      'topic': canReorderSingle(propertiesIn('a{justify-content:center}')[0], propertiesIn('a{–ms-flex-pack:center}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    },
    'flex #5': {
      'topic': canReorderSingle(propertiesIn('a{justify-content:center}')[0], propertiesIn('a{–webkit-box-pack:center}')[0]),
      'must be false': function (result) { assert.isFalse(result); }
    }
  })
  .export(module);
