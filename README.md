<h1 align="center">
  <br/>
  <img src="https://cdn.rawgit.com/jakubpawlowicz/clean-css/master/logo.v2.svg" alt="clean-css logo" width="525px"/>
  <br/>
  <br/>
</h1>

[![NPM version](https://img.shields.io/npm/v/clean-css.svg?style=flat)](https://www.npmjs.com/package/clean-css)
[![Linux Build Status](https://img.shields.io/travis/jakubpawlowicz/clean-css/master.svg?style=flat&label=Linux%20build)](https://travis-ci.org/jakubpawlowicz/clean-css)
[![Windows Build status](https://img.shields.io/appveyor/ci/jakubpawlowicz/clean-css/master.svg?style=flat&label=Windows%20build)](https://ci.appveyor.com/project/jakubpawlowicz/clean-css/branch/master)
[![Dependency Status](https://img.shields.io/david/jakubpawlowicz/clean-css.svg?style=flat)](https://david-dm.org/jakubpawlowicz/clean-css)
[![NPM Downloads](https://img.shields.io/npm/dm/clean-css.svg)](https://www.npmjs.com/package/clean-css)
[![Twitter](https://img.shields.io/badge/Twitter-@cleancss-blue.svg)](https://twitter.com/cleancss)

## What is clean-css?

Clean-css is a fast and efficient CSS optimizer for [Node.js](http://nodejs.org/) platform and [any modern browser](https://jakubpawlowicz.github.io/clean-css).

According to [tests](http://goalsmashers.github.io/css-minification-benchmark/) it is one of the best available.


## Usage

### This documentation refers to a pre-release version of clean-css 4.0. See [3.4 branch](https://github.com/jakubpawlowicz/clean-css/tree/3.4) for the current release docs.

### What will change in clean-css 4?

There will be some breaking changes:

* `root`, `relativeTo`, and `target` options are replaced by a single `rebaseTo` option - this means that rebasing URLs and import inlining is much simpler but may not be (YMMV) as powerful as in 3.x.
* `debug` API option is gone as stats are always provided in output object under `stats` property
* `roundingPrecision` is disabled by default
* `roundingPrecision` applies to **all** units now, not only `px` as in 3.x;
* `processImport` and `processImportFrom` are merged into `inline` option which defaults to `local`. Remote `@import` rules are **NOT** inlined by default anymore.
* renames CLI `--timeout` option to `--inline-timeout`;
* splits API `inliner: { request: ..., timeout: ... }` option into `inlineRequest` and `inlineTimeout` options;
* remote resources without a protocol, e.g. //fonts.googleapis.com/css?family=Domine:700, are not inlined anymore;
* changes default Internet Explorer compatibility from 9+ to 10+, to revert the old default use `--compatibility ie9` flag;
* renames `keepSpecialComments` to `specialComments`;
* moves `roundingPrecision` and `specialComments` to level 1 optimizations options, see examples below;
* moves `mediaMerging`, `restructuring`, `semanticMerging`, and `shorthandCompacting` to level 2 optimizations options, see examples below;
* renames `shorthandCompacting` option to `mergeIntoShorthands`;
* level 1 optimizations are the new default, up to 3.x it was level 2;
* `--keep-line-breaks` / `keepBreaks` option is replaced with `--format keep-breaks` / `{ format: 'keep-breaks' }` to ease transition.
* `sourceMap` option is API has to be a boolean from now on. If you want to specify an input source map pass it a 2nd argument to `minify` method or via a hash instead;
* `--skip-aggressive-merging` / `aggressiveMerging` option is removed as aggressive merging is gone too, replaced by smarter override merging.

Please note this list is not final. You are more than welcome to comment these changes in [4.0 release discussion](https://github.com/jakubpawlowicz/clean-css/issues/842) thread.

### What are the requirements?

```
Node.js 4.0+ (tested on CentOS, Ubuntu, OS X, and Windows)
```

### How to install clean-css?

```
npm install clean-css
```

### How to use clean-css CLI?

Clean-css accepts the following command line arguments (please make sure
you use `<source-file>` as the very last argument to avoid potential issues):

```
Usage: cleancss [options] <source-file ...>

Options:

  -h, --help                     output usage information
  -v, --version                  output the version number
  -c, --compatibility [ie7|ie8]  Force compatibility mode (see Readme for advanced examples)
  -d, --debug                    Shows debug information (minification time & compression efficiency)
  -f, --format <options>         Controls output formatting, see examples below
  -o, --output [output-file]     Use [output-file] as output instead of STDOUT
  -O <n> [optimizations]         Turn on level <n> optimizations; optionally accepts a list of fine-grained options, defaults to `1`, see examples below
  --inline [rules]               Enables inlining for listed sources (defaults to `local`)
  --inline-timeout [seconds]     Per connection timeout when fetching remote stylesheets (defaults to 5 seconds)
  --skip-rebase                  Disable URLs rebasing
  --source-map                   Enables building input's source map
  --source-map-inline-sources    Enables inlining sources inside source maps
```

#### Examples:

To minify a **one.css** file into **one-min.css** do:

```
cleancss -o one-min.css one.css
```

To minify the same **one.css** into the standard output skip the `-o` parameter:

```
cleancss one.css
```

If you would like to minify a couple of files together, pass more paths in:

```bash
cleancss -o merged-and-minified.css one.css two.css three.css
```

You can also pipe results to other commands, e.g. gzip:

```bash
cleancss one.css two.css three.css | gzip -9 -c > merged-minified-and-gzipped.css.gz
```

Please note there is a difference between passing in a concatenated string and letting clean-css do the job. The former will discard `@import` statements appearing [not at the beginning](https://developer.mozilla.org/en-US/docs/Web/CSS/@import) of the string, while the latter will discard only those appearing not at the beginning of any of the files. Because of this behavior, the latter way (see examples above) is recommended.

Formatting options:

```bash
cleancss --format beautify one.css
cleancss --format keep-breaks one.css
cleancss --format 'indentBy:1;indentWith:tab' one.css
cleancss --format 'breaks:afterBlockBegins=off;spaces:aroundSelectorRelation=off' one.css
# `breaks` controls where to insert breaks
#   `afterAtRule` controls if a line break comes after an at-rule; e.g. `@charset`; defaults to `off` (alias to `false`)
#   `afterBlockBegins` controls if a line break comes after a block begins; e.g. `@media`; defaults to `off`
#   `afterBlockEnds` controls if a line break comes after a block ends, defaults to `off`
#   `afterComment` controls if a line break comes after a comment; defaults to `off`
#   `afterProperty` controls if a line break comes after a property; defaults to `off`
#   `afterRuleBegins` controls if a line break comes after a rule begins; defaults to `off`
#   `afterRuleEnds` controls if a line break comes after a rule ends; defaults to `off`
#   `beforeBlockEnds` controls if a line break comes before a block ends; defaults to `off`
#   `betweenSelectors` controls if a line break comes between selectors; defaults to `off`
# `indentBy` controls number of characters to indent with; defaults to `0`
# `indentWith` controls a character to indent with, can be `space` or `tab`; defaults to `space`
# `spaces` controls where to insert spaces
#   `aroundSelectorRelatioff` controls if spaces come around selector relations; e.g. `div > a`; defaults to `off`
#   `beforeBlockBegins` controls if a space comes before a block begins; e.g. `.block {`; defaults to `off`
#   `beforeValue` controls if a space comes before a value; e.g. `width: 1rem`; defaults to `off`
# `wrapAt` controls maximum line length; defaults to `off`
```

Level 0 optimizations:

```bash
cleancss -O0 one.css
```

Level 1 optimizations (default):

```bash
cleancss -O1 one.css
cleancss -O1 removeQuotes:off;roundingPrecision:4;specialComments:1 one.css
cleancss -O1 all:off;specialComments:1 one.css
# `cleanupCharsets` controls `@charset` moving to the front of a stylesheet; defaults to `on`
# `normalizeUrls` controls URL normalzation; default to `on`
# `optimizeBackground` controls `background` property optimizatons; defaults to `on`
# `optimizeBorderRadius` controls `border-radius` property optimizatons; defaults to `on`
# `optimizeFilter` controls `filter` property optimizatons; defaults to `on`
# `optimizeFont controls `font` property optimizatons; defaults to `on`
# `optimizeFontWeight` controls `font-weight` property optimizatons; defaults to `on`
# `optimizeOutline` controls `outline` property optimizatons; defaults to `on`
# `removeNegativePaddings` controls removing negative paddings; defaults to `on`
# `removeQuotes` controls removing quotes when unnecessary; defaults to `on`
# `removeWhitespace` controls removing unused whitespace; defaults to `on`
# `replaceMultipleZeros` contols removing redundant zeros; defaults to `on`
# `replaceTimeUnits` controls replacing time units with shorter values; defaults to `on
# `replaceZeroUnits` controls replacing zero values with units; defaults to `on`
# `roundingPrecision` rounds pixel values to `N` decimal places; `off` disables rounding; defaults to `off`
# `selectorsSortingMethod` denotes selector sorting method; can be `natural` or `standard`; defaults to `standard`
# `specialComments` denotes a number of /*! ... */ comments preserved; defaults to `all`
# `tidyAtRules` controls at-rules (e.g. `@charset`, `@import`) optimizing; defaults to `on`
# `tidyBlockScopes` controls block scopes (e.g. `@media`) optimizing; defaults to `on`
# `tidySelectors` controls selectors optimizing; defaults to `on`
```

Level 2 optimizations:

```bash
cleancss -O2 one.css
cleancss -O2 mergeMedia:off;restructureRules:off;mergeSemantically:on;mergeIntoShorthands:off one.css
cleancss -O2 all:off;removeDuplicateRules:on one.css
# `mergeAdjacentRules` controls adjacent rules merging; defaults to `on`
# `mergeIntoShorthands` controls merging properties into shorthands; defaults to `on`
# `mergeMedia` controls `@media` merging; defaults to `on`
# `mergeNonAdjacentRules` controls non-adjacent rule merging; defaults to `on`
# `mergeSemantically` controls semantic merging; defaults to `off`
# `reduceNonAdjacentRules` controls non-adjacent rule reducing; defaults to `on`
# `removeDuplicateFontRules` controls duplicate `@font-face` removing; defaults to `on`
# `removeDuplicateMediaBlocks` controls duplicate `@media` removing; defaults to `on`
# `removeDuplicateRules` controls duplicate rules removing; defaults to `on`
# `restructureRules` controls rule restructuring; defaults to `off`
```

### How to use clean-css API?

```js
var CleanCSS = require('clean-css');
var source = 'a{font-weight:bold;}';
var minified = new CleanCSS().minify(source).styles;
```

CleanCSS constructor accepts a hash as a parameter, i.e.,
`new CleanCSS(options)` with the following options available:

* `compatibility` - enables compatibility mode, see [below for more examples](#how-to-set-a-compatibility-mode)
* `format` - formats output CSS by using indentation and one rule or property per line.
* `inline` - whether to inline `@import` rules, can be `['all']`, `['local']` (default), `['remote']`, or a blacklisted domain/path e.g. `['!fonts.googleapis.com']`
* `inlineRequest` - an object with [HTTP(S) request options](https://nodejs.org/api/http.html#http_http_request_options_callback) for inlining remote `@import` rules
* `inlineTimeout` - an integer denoting a number of milliseconds after which inlining a remote `@import` fails (defaults to 5000 ms)
* `level` - an integer denoting optimization level applied or a hash with a fine-grained configuration; see examples below; defaults to `1`
* `rebase` - set to false to skip URL rebasing
* `rebaseTo` - a directory to which all URLs are rebased (most likely the directory under which the output file will live), defaults to the current directory
* `sourceMap` - set to true to build output source map; defaults to `false`
* `sourceMapInlineSources` - set to true to inline sources inside a source map's `sourcesContent` field (defaults to false)
  It is also required to process inlined sources from input source maps.

The output of `minify` method (or the 2nd argument to passed callback) is a hash containing the following fields:

* `styles` - optimized output CSS as a string
* `sourceMap` - output source map (if requested with `sourceMap` option)
* `errors` - a list of errors raised
* `warnings` - a list of warnings raised
* `stats` - a hash of statistic information:
  * `originalSize` - original content size (after import inlining)
  * `minifiedSize` - optimized content size
  * `timeSpent` - time spent on optimizations
  * `efficiency` - a ratio of output size to input size (e.g. 25% if content was reduced from 100 bytes to 75 bytes)

#### How to specify formatting

The `format` option can accept the following options:

```js
new CleanCSS({
  format: {
    breaks: { // controls where to insert breaks
      afterAtRule: false, // controls if a line break comes after an at-rule; e.g. `@charset`; defaults to `false`
      afterBlockBegins: false, // controls if a line break comes after a block begins; e.g. `@media`; defaults to `false`
      afterBlockEnds: false, // controls if a line break comes after a block ends, defaults to `false`
      afterComment: false, // controls if a line break comes after a comment; defaults to `false`
      afterProperty: false, // controls if a line break comes after a property; defaults to `false`
      afterRuleBegins: false, // controls if a line break comes after a rule begins; defaults to `false`
      afterRuleEnds: false, // controls if a line break comes after a rule ends; defaults to `false`
      beforeBlockEnds: false, // controls if a line break comes before a block ends; defaults to `false`
      betweenSelectors: false // controls if a line break comes between selectors; defaults to `false`
    },
    indentBy: 0, // controls number of characters to indent with; defaults to `0`
    indentWith: 'space', // controls a character to indent with, can be `'space'` or `'tab'`; defaults to `'space'`
    spaces: { // controls where to insert spaces
      aroundSelectorRelation: false, // controls if spaces come around selector relations; e.g. `div > a`; defaults to `false`
      beforeBlockBegins: false, // controls if a space comes before a block begins; e.g. `.block {`; defaults to `false`
      beforeValue: false // controls if a space comes before a value; e.g. `width: 1rem`; defaults to `false`
    },
    wrapAt: false // controls maximum line length; defaults to `false`
  }
})
```

#### How to specify optimization levels

The `level` option can be either `0`, `1` (default), or `2`, or a fine-grained configuration given via a hash:

```js
// level 1 optimizations (default)
new CleanCSS({
  level: {
    1: {
      cleanupCharsets: true, // controls `@charset` moving to the front of a stylesheet; defaults to `true`
      normalizeUrls: true, // controls URL normalzation; default to `true`
      optimizeBackground: true, // controls `background` property optimizatons; defaults to `true`
      optimizeBorderRadius: true, // controls `border-radius` property optimizatons; defaults to `true`
      optimizeFilter: true, // controls `filter` property optimizatons; defaults to `true`
      optimizeFont: true, // ontrols `font` property optimizatons; defaults to `true`
      optimizeFontWeight: true, // controls `font-weight` property optimizatons; defaults to `true`
      optimizeOutline: true, // controls `outline` property optimizatons; defaults to `true`
      removeNegativePaddings: true, // controls removing negative paddings; defaults to `true`
      removeQuotes: true, // controls removing quotes when unnecessary; defaults to `true`
      removeWhitespace: true, // controls removing unused whitespace; defaults to `true`
      replaceMultipleZeros: true, // contols removing redundant zeros; defaults to `true`
      replaceTimeUnits: true, // controls replacing time units with shorter values; defaults to `true`
      replaceZeroUnits: true, // controls replacing zero values with units; defaults to `true`
      roundingPrecision: false, // rounds pixel values to `N` decimal places; `false` disables rounding; defaults to `false`
      selectorsSortingMethod: 'standard', // denotes selector sorting method; can be `natural` or `standard`; defaults to `standard`
      specialComments: 'all', // denotes a number of /*! ... */ comments preserved; defaults to `all`
      tidyAtRules: true, // controls at-rules (e.g. `@charset`, `@import`) optimizing; defaults to `true`
      tidyBlockScopes: true, // controls block scopes (e.g. `@media`) optimizing; defaults to `true`
      tidySelectors: true // controls selectors optimizing; defaults to `true`
    }
  }
});

// level 1 optimizations `all` keyword
new CleanCSS({
  level: {
    1: {
      all: false, // sets all values to `false`
      tidySelectors: true // turns on optimizing selectors
    }
  }
});
```

```js
// level 2 optimizations
new CleanCSS({
  level: {
    2: {
      mergeAdjacentRules: true, // controls adjacent rules merging; defaults to true
      mergeIntoShorthands: true, // controls merging properties into shorthands; defaults to true
      mergeMedia: true, // controls `@media` merging; defaults to true
      mergeNonAdjacentRules: true, // controls non-adjacent rule merging; defaults to true
      mergeSemantically: false, // controls semantic merging; defaults to false
      reduceNonAdjacentRules: true, // controls non-adjacent rule reducing; defaults to true
      removeDuplicateFontRules: true, // controls duplicate `@font-face` removing; defaults to true
      removeDuplicateMediaBlocks: true, // controls duplicate `@media` removing; defaults to true
      removeDuplicateRules: true, // controls duplicate rules removing; defaults to true
      restructureRules: false // controls rule restructuring; defaults to false
    }
  }
});

// level 2 optimizations `all` keyword
new CleanCSS({
  level: {
    1: {
      all: false, // sets all values to `false`
      removeDuplicateRules: true // turns on removing duplicate rules
    }
  }
});
```

#### How to make sure remote `@import`s are processed correctly?

In order to inline remote `@import` statements you need to provide a callback to minify method, e.g.:

```js
var CleanCSS = require('clean-css');
var source = '@import url(http://path/to/remote/styles);';
new CleanCSS().minify(source, function (error, minified) {
  // minified.styles
});
```

This is due to a fact, that, while local files can be read synchronously, remote resources can only be processed asynchronously.
If you don't provide a callback, then remote `@import`s will be left intact.

### How to use clean-css with build tools?

* [Broccoli](https://github.com/broccolijs/broccoli#broccoli): [broccoli-clean-css](https://github.com/shinnn/broccoli-clean-css)
* [Brunch](http://brunch.io/): [clean-css-brunch](https://github.com/brunch/clean-css-brunch)
* [Grunt](http://gruntjs.com): [grunt-contrib-cssmin](https://github.com/gruntjs/grunt-contrib-cssmin)
* [Gulp](http://gulpjs.com/): [gulp-clean-css](https://github.com/scniro/gulp-clean-css)
* [Gulp](http://gulpjs.com/): [using vinyl-map as a wrapper - courtesy of @sogko](https://github.com/jakubpawlowicz/clean-css/issues/342)
* [component-builder2](https://github.com/component/builder2.js): [builder-clean-css](https://github.com/poying/builder-clean-css)
* [Metalsmith](http://metalsmith.io): [metalsmith-clean-css](https://github.com/aymericbeaumet/metalsmith-clean-css)
* [Lasso](https://github.com/lasso-js/lasso): [lasso-clean-css](https://github.com/yomed/lasso-clean-css)
* [Start](https://github.com/start-runner/start): [start-clean-css](https://github.com/start-runner/clean-css)

### How to use clean-css from a web browser?

* https://jakubpawlowicz.github.io/clean-css/ (official web interface)
* http://refresh-sf.com/
* http://adamburgess.github.io/clean-css-online/

### What are the clean-css' dev commands?

First clone the source, then run:

* `npm run bench` for clean-css benchmarks (see [test/bench.js](https://github.com/jakubpawlowicz/clean-css/blob/master/test/bench.js) for details)
* `npm run browserify` to create the browser-ready clean-css version
* `npm run check` to check JS sources with [JSHint](https://github.com/jshint/jshint/)
* `npm test` for the test suite

## How to contribute to clean-css?

See [CONTRIBUTING.md](https://github.com/jakubpawlowicz/clean-css/blob/master/CONTRIBUTING.md).

## Tips & Tricks

### How to preserve a comment block?

Use the `/*!` notation instead of the standard one `/*`:

```css
/*!
  Important comments included in minified output.
*/
```

### How to rebase relative image URLs?

Clean-css will handle it automatically for you in the following cases:

* When using the CLI specify output path via `-o`/`--output` to rebase URLs as relative to the output file
* When using the API use `rebaseTo` to rebase URLs to the given path (same as with CLI)

### How to generate source maps?

Source maps are supported since version 3.0.

Additionally to mapping original CSS files, clean-css also supports input source maps, so minified styles can be mapped into their [Less](http://lesscss.org/) or [Sass](http://sass-lang.com/) sources directly.

Source maps are generated using [source-map](https://github.com/mozilla/source-map/) module from Mozilla.

### How to specify custom rounding precision?

The level 1 `roundingPrecision` optimization option accept a string with per-unit rounding precision settings, e.g.

```
clean-css -O1 roundingPrecision:all=3,px=5
```

or

```js
new CleanCSS({ level: { 1: { roundingPrecision: 'all=3,px=5' } } }).minify(...)
```

which sets all units rounding precision to 3 digits except `px` unit precision of 5 digits.

#### Using CLI

To generate a source map, use `--source-map` switch, e.g.:

```
cleancss --source-map --output styles.min.css styles.css
```

Name of the output file is required, so a map file, named by adding `.map` suffix to output file name, can be created (styles.min.css.map in this case).

#### Using API

To generate a source map, use `sourceMap: true` option, e.g.:

```js
new CleanCSS({ sourceMap: true, rebaseTo: pathToOutputDirectory })
  .minify(source, function (error, minified) {
    // access minified.sourceMap for SourceMapGenerator object
    // see https://github.com/mozilla/source-map/#sourcemapgenerator for more details
    // see https://github.com/jakubpawlowicz/clean-css/blob/master/bin/cleancss#L114 on how it's used in clean-css' CLI
});
```

Using API you can also pass an input source map directly as a 2nd argument to `minify` method:

```js
new CleanCSS({ sourceMap: true, rebaseTo: pathToOutputDirectory })
  .minify(source, inputSourceMap, function (error, minified) {
    // access minified.sourceMap to access SourceMapGenerator object
    // see https://github.com/mozilla/source-map/#sourcemapgenerator for more details
    // see https://github.com/jakubpawlowicz/clean-css/blob/master/bin/cleancss#L114 on how it's used in clean-css' CLI
});
```

Or even multiple input source maps at once (available since version 3.1):

```js
new CleanCSS({ sourceMap: true, rebaseTo: pathToOutputDirectory }).minify({
  'path/to/source/1': {
    styles: '...styles...',
    sourceMap: '...source-map...'
  },
  'path/to/source/2': {
    styles: '...styles...',
    sourceMap: '...source-map...'
  }
}, function (error, minified) {
  // access minified.sourceMap as above
});
```

### How to minify multiple files with API?

#### Passing an array

```js
new CleanCSS().minify(['path/to/file/one', 'path/to/file/two']);
```

#### Passing a hash

```js
new CleanCSS().minify({
  'path/to/file/one': {
    styles: 'contents of file one'
  },
  'path/to/file/two': {
    styles: 'contents of file two'
  }
});
```

Important note - any `@import` rules already present in the hash will be automatically resolved in memory.

### How to set a compatibility mode?

Compatibility settings are controlled by `--compatibility` switch (CLI) and `compatibility` option (library mode).

In both modes the following values are allowed:

* `'ie7'` - Internet Explorer 7 compatibility mode
* `'ie8'` - Internet Explorer 8 compatibility mode
* `''` or `'*'` (default) - Internet Explorer 9+ compatibility mode

Since clean-css 3 a fine grained control is available over
[those settings](https://github.com/jakubpawlowicz/clean-css/blob/master/lib/utils/compatibility.js),
with the following options available:

* `'[+-]colors.opacity'` - - turn on (+) / off (-) `rgba()` / `hsla()` declarations removal
* `'[+-]properties.backgroundClipMerging'` - turn on / off background-clip merging into shorthand
* `'[+-]properties.backgroundOriginMerging'` - turn on / off background-origin merging into shorthand
* `'[+-]properties.backgroundSizeMerging'` - turn on / off background-size merging into shorthand
* `'[+-]properties.colors'` - turn on / off any color optimizations
* `'[+-]properties.ieBangHack'` - turn on / off IE bang hack removal
* `'[+-]properties.ieFilters'` - turn on / off IE `filter` / `-ms-filter` removal
* `'[+-]properties.iePrefixHack'` - turn on / off IE prefix hack removal
* `'[+-]properties.ieSuffixHack'` - turn on / off IE suffix hack removal
* `'[+-]properties.merging'` - turn on / off property merging based on understandability
* `'[+-]properties.shorterLengthUnits'` - turn on / off shortening pixel units into `pc`, `pt`, or `in` units
* `'[+-]properties.spaceAfterClosingBrace'` - turn on / off removing space after closing brace - `url() no-repeat` into `url()no-repeat`
* `'[+-]properties.urlQuotes'` - turn on / off `url()` quoting
* `'[+-]properties.zeroUnits'` - turn on / off units removal after a `0` value
* `'[+-]selectors.adjacentSpace'` - turn on / off extra space before `nav` element
* `'[+-]selectors.ie7Hack'` - turn on / off IE7 selector hack removal (`*+html...`)
* `'[+-]selectors.special'` - a regular expression with all special, unmergeable selectors (leave it empty unless you know what you are doing)
* `'[+-]units.ch'` - turn on / off treating `ch` as a proper unit
* `'[+-]units.in'` - turn on / off treating `in` as a proper unit
* `'[+-]units.pc'` - turn on / off treating `pc` as a proper unit
* `'[+-]units.pt'` - turn on / off treating `pt` as a proper unit
* `'[+-]units.rem'` - turn on / off treating `rem` as a proper unit
* `'[+-]units.vh'` - turn on / off treating `vh` as a proper unit
* `'[+-]units.vm'` - turn on / off treating `vm` as a proper unit
* `'[+-]units.vmax'` - turn on / off treating `vmax` as a proper unit
* `'[+-]units.vmin'` - turn on / off treating `vmin` as a proper unit

For example, using `--compatibility 'ie8,+units.rem'` will ensure IE8 compatibility while enabling `rem` units so the following style `margin:0px 0rem` can be shortened to `margin:0`, while in pure IE8 mode it can't be.

To pass a single off (-) switch in CLI please use the following syntax `--compatibility *,-units.rem`.

In library mode you can also pass `compatibility` as a hash of options.

### What level 2 optimizations are applied?

All level 2 optimizations are dispatched [here](https://github.com/jakubpawlowicz/clean-css/blob/master/lib/selectors/advanced.js#L59), and this is what they do:

* `recursivelyOptimizeBlocks` - does all the following operations on a block (think `@media` or `@keyframe` at-rules);
* `recursivelyOptimizeProperties` - optimizes properties in rulesets and "flat at-rules" (like @font-face) by splitting them into components (e.g. `margin` into `margin-(*)`), optimizing, and rebuilding them back. You may want to use `mergeIntoShorthands` option to control whether you want to turn multiple (long-hand) properties into a shorthand ones;
* `removeDuplicates` - gets rid of duplicate rulesets with exactly the same set of properties (think of including the same Sass / Less partial twice for no good reason);
* `mergeAdjacent` - merges adjacent rulesets with the same selector or rules;
* `reduceNonAdjacent` - identifies which properties are overridden in same-selector non-adjacent rulesets, and removes them;
* `mergeNonAdjacentBySelector` - identifies same-selector non-adjacent rulesets which can be moved (!) to be merged, requires all intermediate rulesets to not redefine the moved properties, or if redefined to be either more coarse grained (e.g. `margin` vs `margin-top`) or have the same value;
* `mergeNonAdjacentByBody` - same as the one above but for same-rules non-adjacent rulesets;
* `restructure` - tries to reorganize different-selector different-rules rulesets so they take less space, e.g. `.one{padding:0}.two{margin:0}.one{margin-bottom:3px}` into `.two{margin:0}.one{padding:0;margin-bottom:3px}`;
* `removeDuplicateMediaQueries` - removes duplicated `@media` at-rules;
* `mergeMediaQueries` - merges non-adjacent `@media` at-rules by same rules as `mergeNonAdjacentBy*` above;

## Acknowledgments (sorted alphabetically)

* Anthony Barre ([@abarre](https://github.com/abarre)) for improvements to
  `@import` processing.
* Simon Altschuler ([@altschuler](https://github.com/altschuler)) for fixing
  `@import` processing inside comments.
* Isaac ([@facelessuser](https://github.com/facelessuser)) for pointing out
  a flaw in clean-css' stateless mode.
* Jan Michael Alonzo ([@jmalonzo](https://github.com/jmalonzo)) for a patch
  removing node.js' old `sys` package.
* Luke Page ([@lukeapage](https://github.com/lukeapage)) for suggestions and testing the source maps feature.
  Plus everyone else involved in [#125](https://github.com/jakubpawlowicz/clean-css/issues/125) for pushing it forward.
* Peter Wagenet ([@wagenet](https://github.com/wagenet)) for suggesting improvements to `@import` inlining behavior.
* Timur Kristóf ([@Venemo](https://github.com/Venemo)) for an outstanding
  contribution of advanced property optimizer for 2.2 release.
* Vincent Voyer ([@vvo](https://github.com/vvo)) for a patch with better
  empty element regex and for inspiring us to do many performance improvements
  in 0.4 release.
* [@XhmikosR](https://github.com/XhmikosR) for suggesting new features
  (option to remove special comments and strip out URLs quotation) and
  pointing out numerous improvements (JSHint, media queries).

## License

Clean-css is released under the [MIT License](https://github.com/jakubpawlowicz/clean-css/blob/master/LICENSE).
