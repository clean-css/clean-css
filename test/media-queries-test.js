var vows = require('vows');
var assert = require('assert');
var CleanCSS = require('../index');

vows.describe('media queries')
  .addBatch({
    'different ones': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media print{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}}@media print{div{display:block}}');
      }
    },
    'other than @media': {
      'topic': function () {
        return new CleanCSS().minify('@font-face{font-family:A}@font-face{font-family:B}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@font-face{font-family:A}@font-face{font-family:B}');
      }
    }
  })
  .addBatch({
    'same two adjacent': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}div{display:block}}');
      }
    },
    'same three adjacent': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media screen{div{display:block}}@media screen{body{width:100%}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}div{display:block}body{width:100%}}');
      }
    },
    'same two with selectors in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}body{width:100%}.one{height:100px}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, 'body{width:100%}.one{height:100px}@media screen{a{color:red}div{display:block}}');
      }
    },
    'same two with other @media in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media (min-width:1024px){body{width:100%}}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media (min-width:1024px){body{width:100%}}@media screen{a{color:red}div{display:block}}');
      }
    },
    'same two with breaking properties in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}.one{color:#00f}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}}.one{color:#00f}@media screen{div{display:block}}');
      }
    },
    'same two with breaking @media in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media (min-width:1024px){.one{color:#00f}}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}}@media (min-width:1024px){.one{color:#00f}}@media screen{div{display:block}}');
      }
    },
    'same two with breaking nested @media in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media (min-width:1024px){@media screen{.one{color:#00f}}}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}}@media (min-width:1024px){@media screen{.one{color:#00f}}}@media screen{div{display:block}}');
      }
    },
    'intermixed': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media (min-width:1024px){p{width:100%}}@media screen{div{display:block}}@media (min-width:1024px){body{height:100%}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}div{display:block}}@media (min-width:1024px){p{width:100%}body{height:100%}}');
      }
    },
    'same two with overriding shorthand in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{font-size:10px}}@media (min-width:1024px){.one{font:12px Helvetica}}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{font-size:10px}}@media (min-width:1024px){.one{font:12px Helvetica}}@media screen{div{display:block}}');
      }
    },
    'same two with different component property in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{font-size:10px}}@media (min-width:1024px){.one{font-weight:700}}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media (min-width:1024px){.one{font-weight:700}}@media screen{a{font-size:10px}div{display:block}}');
      }
    },
    'same two with same values as moved in between': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media (min-width:1024px){.one{color:red}}@media screen{div{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media (min-width:1024px){.one{color:red}}@media screen{a{color:red}div{display:block}}');
      }
    },
    'duplicated but non-mergeable': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}.one{color:#000}@media screen{a{color:red}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '.one{color:#000}@media screen{a{color:red}}');
      }
    },
    'many duplicated but non-mergeable': {
      'topic': function () {
        return new CleanCSS().minify('@media print{a{color:#fff}}@media screen{a{color:red}}.one{color:#000}@media screen{a{color:red}}@media print{a{display:block}}@media print{a{color:#fff}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '.one{color:#000}@media screen{a{color:red}}@media print{a{display:block;color:#fff}}');
      }
    }
  })
  .addBatch({
    'further optimizations': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}@media screen{a{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red;display:block}}');
      }
    }
  })
  .addBatch({
    'with comments': {
      'topic': function () {
        return new CleanCSS().minify('@media screen{a{color:red}}/*! a comment */@media screen{a{display:block}}');
      },
      'get merged': function(minified) {
        assert.equal(minified.styles, '/*! a comment */@media screen{a{color:red;display:block}}');
      }
    }
  })
  .addBatch({
    'disabled': {
      'topic': function () {
        return new CleanCSS({ mediaMerging: false }).minify('@media screen{a{color:red}}@media screen{a{display:block}}');
      },
      'keeps @media intact': function(minified) {
        assert.equal(minified.styles, '@media screen{a{color:red}}@media screen{a{display:block}}');
      }
    }
  }).export(module);
