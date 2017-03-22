var vows = require('vows');
var optimizerContext = require('../../test-helper').optimizerContext;

vows.describe('restructure')
  .addBatch(
    optimizerContext('level 2 on', {
      'up until changed #1': [
        'a{color:#000}div{color:red}.one{display:block}.two{display:inline;color:red}',
        'a{color:#000}.two,div{color:red}.one{display:block}.two{display:inline}'
      ],
      'up until changed #2': [
        'p{margin:0;font:inherit}h1{font-family:Helvetica;margin:20px}section h1{font-family:Helvetica;margin:40px}',
        'p{margin:0;font:inherit}h1,section h1{font-family:Helvetica}h1{margin:20px}section h1{margin:40px}'
      ],
      'up until top': [
        'a{width:75px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '.two,div{color:red}a{width:75px}.one{display:block}.two{display:inline}'
      ],
      'up until top with charset': [
        '@charset "utf-8";a{width:75px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "utf-8";.two,div{color:red}a{width:75px}.one{display:block}.two{display:inline}'
      ],
      'two at once': [
        '.one,.two,.three{color:red;display:block}div{margin:0}.four,.five,.six{color:red;display:block}',
        '.five,.four,.one,.six,.three,.two{color:red;display:block}div{margin:0}'
      ],
      'down until changed': [
        '.one{padding:0}.two{margin:0}.one{margin-bottom:3px}',
        '.two{margin:0}.one{padding:0;margin-bottom:3px}'
      ],
      'over shorthands': [
        'div{margin-top:0}.one{margin:0}.two{display:block;margin-top:0}',
        '.two,div{margin-top:0}.one{margin:0}.two{display:block}'
      ],
      'over shorthands with flush': [
        'div{margin-top:0}.one{margin:5px}.two{display:block;margin-top:0}.three{color:red}.four{margin-top:0}',
        'div{margin-top:0}.one{margin:5px}.four,.two{margin-top:0}.two{display:block}.three{color:red}'
      ],
      'over shorthand - border': [
        '.one{border-color:red}.two{border:1px solid}.three{color:#fff;border-color:red}',
        '.one{border-color:red}.two{border:1px solid}.three{color:#fff;border-color:red}'
      ],
      'granuar over granular': [
        'div{margin-top:0}.one{margin-bottom:2px}.two{display:block;margin-top:0}',
        '.two,div{margin-top:0}.one{margin-bottom:2px}.two{display:block}'
      ],
      'shorthand over granular with different value': [
        'div{margin:0}.one{margin-bottom:1px}.two{display:block;margin:0}',
        'div{margin:0}.one{margin-bottom:1px}.two{display:block;margin:0}'
      ],
      'shorthand over granular with different value for simple tags': [
        'div{margin:0}body{margin-bottom:1px}p{display:block;margin:0}',
        'div,p{margin:0}body{margin-bottom:1px}p{display:block}'
      ],
      'shorthand over granular with different value for simple tags when tag match': [
        'div{margin:0}body,p{margin-bottom:1px}p{display:block;margin:0}',
        'div{margin:0}body,p{margin-bottom:1px}p{display:block;margin:0}'
      ],
      'shorthand over granular with same value': [
        'div{margin:0}.one{margin-bottom:0}.two{display:block;margin:0}',
        '.two,div{margin:0}.one{margin-bottom:0}.two{display:block}'
      ],
      'dropping longer content at a right place': [
        '.one,a:hover{color:red}a:hover{color:#000;display:block;border-color:#000}.longer-name{color:#000;border-color:#000}',
        '.one,a:hover{color:red}.longer-name,a:hover{color:#000;border-color:#000}a:hover{display:block}'
      ],
      'over media without overriding': [
        'div{margin:0}@media{.one{color:red}}.two{display:block;margin:0}',
        '.two,div{margin:0}@media{.one{color:red}}.two{display:block}'
      ],
      'over media with overriding by different value': [
        'div{margin:0}@media{.one{margin:10px}}.two{display:block;margin:0}',
        'div{margin:0}@media{.one{margin:10px}}.two{display:block;margin:0}'
      ],
      'over media with overriding by same value': [
        'div{margin:0}@media{.one{margin:0}}.two{display:block;margin:0}',
        '.two,div{margin:0}@media{.one{margin:0}}.two{display:block}'
      ],
      'over media with overriding by a granular': [
        'div{margin:0}@media{.one{margin-bottom:0}}.two{display:block;margin:0}',
        '.two,div{margin:0}@media{.one{margin-bottom:0}}.two{display:block}'
      ],
      'over media with overriding by a different granular': [
        'div{margin-top:0}@media{.one{margin-bottom:0}}.two{display:block;margin-top:0}',
        '.two,div{margin-top:0}@media{.one{margin-bottom:0}}.two{display:block}'
      ],
      'over media with a new property': [
        'div{margin-top:0}@media{.one{margin-top:0}}.two{display:block;margin:0}',
        'div{margin-top:0}@media{.one{margin-top:0}}.two{display:block;margin:0}'
      ],
      'over a property in the same selector': [
        'div{background-size:100%}a{background:no-repeat;background-size:100%}',
        'div{background-size:100%}a{background:0 0/100% no-repeat}'
      ],
      'multiple granular up to a shorthand': [
        '.one{border:1px solid #bbb}.two{border-color:#666}.three{border-width:1px;border-style:solid}',
        '.one{border:1px solid #bbb}.two{border-color:#666}.three{border-width:1px;border-style:solid}'
      ],
      'multiple granular - complex case': [
        '.one{background:red;padding:8px 24px}.two{padding-left:24px;padding-right:24px}.three{padding-top:20px}.four{border-left:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000}.five{background-color:#fff;background-image:-moz-linear-gradient();background-image:-ms-linear-gradient();background-image:-webkit-gradient();background-image:-webkit-linear-gradient()}',
        '.one{background:red;padding:8px 24px}.two{padding-left:24px;padding-right:24px}.three{padding-top:20px}.four{border-left:1px solid #000;border-right:1px solid #000;border-bottom:1px solid #000}.five{background-color:#fff;background-image:-moz-linear-gradient();background-image:-ms-linear-gradient();background-image:-webkit-gradient();background-image:-webkit-linear-gradient()}'
      ],
      'multiple granular - special': [
        'input:-ms-input-placeholder{color:red;text-align:center}input::placeholder{color:red;text-align:center}',
        'input:-ms-input-placeholder{color:red;text-align:center}input::placeholder{color:red;text-align:center}'
      ],
      'multiple - over longhand': [
        '.one{overflow:hidden;border-right:1px solid;border-color:#d4d4d4}.one:last-child{border-right:0}.two{overflow:hidden;border-right:1px solid;border-color:#d4d4d4}',
        '.one,.two{overflow:hidden}.one{border-right:1px solid;border-color:#d4d4d4}.one:last-child{border-right:0}.two{border-right:1px solid;border-color:#d4d4d4}'
      ],
      'multiple - over redefined property': [
        'a,div{text-decoration:none}a{text-decoration:underline;color:#00f}p{text-decoration:underline}',
        'a,div{text-decoration:none}a,p{text-decoration:underline}a{color:#00f}'
      ],
      'granular two level deep': [
        '.one{border:1px solid red;border-right-width:0}.two{border:1px solid red}',
        '.one{border:1px solid red;border-right-width:0}.two{border:1px solid red}'
      ],
      'moving one already being moved with different value': [
        '.one{color:red}.two{display:block}.three{color:red;display:inline}.four{display:inline-block}.five{color:#000}',
        '.one,.three{color:red}.two{display:block}.three{display:inline}.four{display:inline-block}.five{color:#000}'
      ],
      'not in keyframes': [
        '@keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}',
        '@keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}'
      ],
      'not in vendored keyframes': [
        '@-moz-keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}',
        '@-moz-keyframes test{0%{transform:scale3d(1,1,1);opacity:1}100%{transform:scale3d(.5,.5,.5);opacity:1}}'
      ],
      'with one important comment': [
        '/*! comment */a{width:75px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '/*! comment */.two,div{color:red}a{width:75px}.one{display:block}.two{display:inline}'
      ],
      'with many important comments': [
        '/*! comment 1 *//*! comment 2 */a{width:75px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '/*! comment 1 *//*! comment 2 */.two,div{color:red}a{width:75px}.one{display:block}.two{display:inline}'
      ],
      'with important comment and charset': [
        '@charset "utf-8";/*! comment */a{width:75px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "utf-8";/*! comment */.two,div{color:red}a{width:75px}.one{display:block}.two{display:inline}'
      ],
      'with charset and import': [
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);a{width:75px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);.two,div{color:red}a{width:75px}.one{display:block}.two{display:inline}'
      ],
      'with charset and import and comments': [
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);/*! comment */a{width:75px}div{color:red}.one{display:block}.two{display:inline;color:red}',
        '@charset "UTF-8";@import url(http://fonts.googleapis.com/css?family=Lora:400,700);/*! comment */.two,div{color:red}a{width:75px}.one{display:block}.two{display:inline}'
      ],
      'with same vendor prefixed value group': [
        'a{-moz-box-sizing:content-box;box-sizing:content-box}div{color:red}p{-moz-box-sizing:content-box;box-sizing:content-box}',
        'a,p{-moz-box-sizing:content-box;box-sizing:content-box}div{color:red}'
      ],
      'with different vendor prefixed value group': [
        'a{-moz-box-sizing:content-box;box-sizing:content-box}div{color:red}p{-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}',
        'a{-moz-box-sizing:content-box;box-sizing:content-box}div{color:red}p{-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}'
      ],
      'no rule after comma': [
        'h1{color:#000}div{color:red},h2{color:#000;display:block}',
        'h1{color:#000}div{color:red},h2{color:#000;display:block}'
      ],
      'border color as hex and function': [
        '.one{border-color:#000;border-bottom-color:rgb(0,0,0,.2)}.two{border-color:#fff;border-bottom-color:rgb(0,0,0,.2)}',
        '.one{border-color:#000;border-bottom-color:rgb(0,0,0,.2)}.two{border-color:#fff;border-bottom-color:rgb(0,0,0,.2)}'
      ]
    }, { level: { 2: { restructureRules: true } } })
  )
  .addBatch(
    optimizerContext('only rule restructuring', {
      'best fit sorting': [
        '.block--0{color:red}.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}.block--5{color:red}.block--6{color:red}.block--7{color:red}.block--8{color:red}.block--9{color:red}',
        '.block--0,.block--1,.block--2,.block--3,.block--4,.block--5,.block--6,.block--7,.block--8,.block--9{color:red}'
      ]
    }, { level: { 2: { all: false, restructureRules: true, removeEmpty: true } } })
  )
  .addBatch(
    optimizerContext('only rule restructuring with rule merging limit', {
      'adjacent with as many rules as limit': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}',
        '.block--1,.block--2,.block--3{color:red}'
      ],
      'adjacent with extra rule': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}',
        '.block--1{color:red}.block--2,.block--3,.block--4{color:red}'
      ],
      'adjacent with extra two rules 123': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}.block--5{color:red}',
        '.block--1,.block--2{color:red}.block--3,.block--4,.block--5{color:red}'
      ],
      'adjacent with extra three rules': [
        '.block--1{color:red}.block--2{color:red}.block--3{color:red}.block--4{color:red}.block--5{color:red}.block--6{color:red}',
        '.block--1,.block--2,.block--3{color:red}.block--4,.block--5,.block--6{color:red}'
      ],
      'non-adjacent': [
        '.block--1{color:red}.other-block--1{width:0}.block--2{color:red}.other-block--2{height:0}.block--3{color:red}.other-block--3{opacity:0}.block--4{color:red}',
        '.block--1{color:red}.other-block--1{width:0}.block--2,.block--3,.block--4{color:red}.other-block--2{height:0}.other-block--3{opacity:0}'
      ]
    }, { compatibility: { selectors: { mergeLimit: 3 } }, level: { 2: { all: false, restructureRules: true, removeEmpty: true } } })
  )
  .addBatch(
    optimizerContext('level 2 off', {
      'up until changed': [
        'a{color:#000}div{color:red}.one{display:block}.two{display:inline;color:red}',
        'a{color:#000}div{color:red}.one{display:block}.two{display:inline;color:red}'
      ]
    }, { level: 1 })
  )
  .export(module);
