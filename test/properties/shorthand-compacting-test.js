// 'shorthand properties': cssContext({
//   'shorthand background #1' : [
//     'div{background-color:#111;background-image:url(aaa);background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
//     'div{background:url(aaa)#111}'
//   ],
//   'shorthand background #2' : [
//     'div{background-color:#111;background-image:url(aaa);background-repeat:no-repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
//     'div{background:url(aaa)no-repeat #111}'
//   ],
//   'shorthand important background' : [
//     'div{background-color:#111!important;background-image:url(aaa)!important;background-repeat:repeat!important;background-position:0 0!important;background-attachment:scroll!important;background-size:auto!important;background-origin:padding-box!important;background-clip:border-box!important}',
//     'div{background:url(aaa)#111!important}'
//   ],
//   'shorthand important background overriding': [
//     'a{background:url(a.jpg) !important; background-color:#fff !important}',
//     'a{background:url(a.jpg)#fff!important}'
//   ],
//   'shorthand important background overriding by non-mergeable property': [
//     'a{background:url(a.jpg) !important; background-color:#fff !important; background-size:10px 10px !important}',
//     'a{background:url(a.jpg)#fff!important;background-size:10px 10px!important}'
//   ],
//   'shorthand background-repeat correctly': [
//     'a{background:url(/image/path.png) no-repeat repeat}',
//     'a{background:url(/image/path.png)no-repeat repeat}'
//   ],
//   'shorthand border-width': [
//     '.t{border-top-width:7px;border-bottom-width:7px;border-left-width:4px;border-right-width:4px}',
//     '.t{border-width:7px 4px}'
//   ],
//   'shorthand border-color #1': [
//     '.t{border-top-color:#9fce00;border-bottom-color:#9fce00;border-left-color:#9fce00;border-right-color:#9fce00}',
//     '.t{border-color:#9fce00}'
//   ],
//   'shorthand border-color #2': [
//     '.t{border-right-color:#002;border-bottom-color:#003;border-top-color:#001;border-left-color:#004}',
//     '.t{border-color:#001 #002 #003 #004}'
//   ],
//   'shorthand border-radius': [
//     '.t{border-top-left-radius:7px;border-bottom-right-radius:6px;border-bottom-left-radius:5px;border-top-right-radius:3px}',
//     '.t{border-radius:7px 3px 6px 5px}'
//   ],
//   'shorthand border-radius none': 'li{border-radius:none}',
//   'shorthand list-style #1': [
//     '.t{list-style-type:circle;list-style-position:outside;list-style-image:url(aaa)}',
//     '.t{list-style:circle url(aaa)}'
//   ],
//   'shorthand list-style #2': [
//     '.t{list-style-image:url(aaa);list-style-type:circle;list-style-position:inside}',
//     '.t{list-style:circle inside url(aaa)}'
//   ]
// }),
// 'cares about understandability of shorthand components': cssContext({
//   'linear-gradient should NOT clear out background with color only' : [
//     'div{background:#fff;background:linear-gradient(whatever)}',
//     'div{background:#fff;background:linear-gradient(whatever)}'
//   ],
//   'linear-gradient should NOT clear out background with color only, even if it has a color' : [
//     'div{background:#fff;background:linear-gradient(whatever) #222}',
//     'div{background:#fff;background:linear-gradient(whatever)#222}'
//   ],
//   'a background-image with just a linear-gradient should not be compacted to a shorthand' : [
//     'div{background-color:#111;background-image:linear-gradient(aaa);background-repeat:no-repeat;background-position:0 0;background-attachment:scroll}',
//     'div{background-color:#111;background-image:linear-gradient(aaa);background-repeat:no-repeat;background-position:0 0;background-attachment:scroll}'
//   ],
//   'a background-image with a none and a linear-gradient should result in two shorthands' : [
//     'div{background-color:#111;background-image:none;background-image:linear-gradient(aaa);background-repeat:repeat;background-position:0 0;background-attachment:scroll;background-size:auto;background-origin:padding-box;background-clip:border-box}',
//     'div{background:#111;background:linear-gradient(aaa)#111}'
//   ]
// }),
// 'cares about understandability of border components': cssContext({
//   'border(none) with border(rgba)': 'a{border:none;border:1px solid rgba(1,0,0,.5)}',
//   'border(rgba) with border(none)': 'a{border:1px solid rgba(1,0,0,.5);border:none}',
//   'border(hex) with border(rgba)': 'a{border:1px solid #fff;border:1px solid rgba(1,0,0,.5)}'
// }),
// 'merge same properties sensibly': cssContext({
//   'should merge color values with same understandability #1': [
//     'p{color:red;color:#fff;color:blue}',
//     'p{color:#00f}'
//   ],
//   'should merge color values with same understandability #2': [
//     'p{color:red;color:#fff;color:blue;color:transparent}',
//     'p{color:transparent}'
//   ],
//   'should NOT destroy less understandable values': [
//     'p{color:red;color:#fff;color:blue;color:rgba(1,2,3,.4)}',
//     'p{color:#00f;color:rgba(1,2,3,.4)}'
//   ],
//   'should destroy even less understandable values if a more understandable one comes after them': [
//     'p{color:red;color:#fff;color:blue;color:rgba(1,2,3,.4);color:#9fce00}',
//     'p{color:#9fce00}'
//   ],
//   'should merge functions with the same name but keep different functions intact': [
//     'p{background:-webkit-linear-gradient(aaa);background:-webkit-linear-gradient(bbb);background:linear-gradient(aaa);}',
//     'p{background:-webkit-linear-gradient(bbb);background:linear-gradient(aaa)}'
//   ],
//   'should merge nonimportant + important into one important': [
//     'a{color:#aaa;color:#bbb!important}',
//     'a{color:#bbb!important}'
//   ],
//   'should merge important + nonimportant into one important': [
//     'a{color:#aaa!important;color:#bbb}',
//     'a{color:#aaa!important}'
//   ],
//   'should merge importants just like nonimportants while also overriding them': [
//     'p{color:red!important;color:#fff!important;color:blue!important;color:rgba(1,2,3,.4)}',
//     'p{color:#00f!important}'
//   ]
// }),
// 'shorthand granular properties when other granular properties are already covered by the shorthand': cssContext({
//   'should consider the already existing margin to shorthand margin-top and margin-bottom': [
//     'p{margin:5px;margin-top:foo(1);margin-left:foo(2)}',
//     'p{margin:5px;margin:foo(1)5px 5px foo(2)}'
//   ],
//   'should merge margin-top and margin-left with shorthand if their understandability is the same': [
//     'p{margin:5px;margin-top:1px;margin-left:2px}',
//     'p{margin:1px 5px 5px 2px}'
//   ],
//   'should NOT shorthand to margin-top if the result would be longer than the input': [
//     'p{margin:5px;margin-top:foo(1)}',
//     'p{margin:5px;margin-top:foo(1)}'
//   ],
//   'should consider the already existing background to shorthand background-color': [
//     'p{background:#9fce00;background-color:rgba(1,2,3,.4)}',
//     'p{background:#9fce00;background:rgba(1,2,3,.4)}'
//   ],
//   'should NOT touch important outline-color but should minify default value of outline to 0': [
//     'p{outline:medium;outline-color:#9fce00!important}',
//     'p{outline:0;outline-color:#9fce00!important}'
//   ]
// }),
// 'take advantage of importants for optimalization opportunities': cssContext({
//   'should take into account important margin-left to shorthand non-important margin-top, margin-right and margin-bottom': [
//     'p{margin-top:1px;margin-right:2px;margin-bottom:3px;margin-left:4px !important}',
//     'p{margin:1px 2px 3px;margin-left:4px!important}'
//   ],
//   'should take into account important margin-bottom and margin-left to shorten shorthanded non-important margin-top and margin-bottom': [
//     'p{margin-top:1px;margin-right:2px;margin-bottom:3px!important;margin-left:4px !important}',
//     'p{margin:1px 2px;margin-bottom:3px!important;margin-left:4px!important}'
//   ],
//   'should take into account important margin-right and margin-left to shorten shorthanded non-important margin-top and margin-bottom': [
//     'p{margin-top:1px;margin-bottom:3px;margin-right:2px!important;margin-left:4px !important}',
//     'p{margin:1px 0 3px;margin-right:2px!important;margin-left:4px!important}'
//   ],
//   'should take into account important margin-right and margin-left to shorten shorthanded non-important margin-top and margin-bottom #2': [
//     'p{margin-top:1px;margin-bottom:1px;margin-right:2px!important;margin-left:4px !important}',
//     'p{margin:1px;margin-right:2px!important;margin-left:4px!important}'
//   ],
//   'should take into account important background-color and shorthand others into background': [
//     'p{background-color:#9fce00!important;background-image:url(hello);background-attachment:scroll;background-position:1px 2px;background-repeat:repeat-y;background-size:auto;background-origin:padding-box;background-clip:border-box}',
//     'p{background-color:#9fce00!important;background:url(hello)1px 2px repeat-y}'
//   ],
//   'should take into account important outline-color and default value of outline-width': [
//     'p{outline:inset medium;outline-color:#9fce00!important;outline-style:inset!important}',
//     'p{outline:0;outline-color:#9fce00!important;outline-style:inset!important}'
//   ],
//   'should take into account important background-position remove its irrelevant counterpart': [
//     'p{background:#9fce00 url(hello) 4px 5px;background-position:5px 3px!important}',
//     'p{background:url(hello)#9fce00;background-position:5px 3px!important}'
//   ],
//   'should take into account important background-position and assign the shortest possible value for its irrelevant counterpart': [
//     'p{background:transparent;background-position:5px 3px!important}',
//     'p{background:0;background-position:5px 3px!important}'
//   ]
// }),
// 'properly care about inherit': cssContext({
//   'merge multiple inherited margin granular properties into one inherited shorthand': [
//     'p{margin-top:inherit;margin-right:inherit;margin-bottom:inherit;margin-left:inherit}',
//     'p{margin:inherit}'
//   ],
//   'merge multiple inherited background granular properties into one inherited shorthand': [
//     'p{background-color:inherit;background-image:inherit;background-attachment:inherit;background-position:inherit;background-repeat:inherit;;background-size:inherit;background-origin:inherit;background-clip:inherit}',
//     'p{background:inherit}'
//   ],
//   'when shorter, optimize inherited/non-inherited background granular properties into an inherited shorthand and some non-inherited granular properties': [
//     'p{background-color:inherit;background-image:inherit;background-attachment:inherit;background-position:inherit;background-repeat:repeat-y;background-size:inherit;background-origin:inherit;background-clip:inherit}',
//     'p{background:inherit;background-repeat:repeat-y}'
//   ],
//   'when shorter, optimize inherited/non-inherited background granular properties into a non-inherited shorthand and some inherited granular properties': [
//     'p{background-color:#9fce00;background-image:inherit;background-attachment:scroll;background-position:1px 2px;background-repeat:repeat-y;background-size:auto;background-clip:inherit;background-origin:padding-box;}',
//     'p{background:1px 2px repeat-y #9fce00;background-image:inherit;background-clip:inherit}'
//   ],
//   'put inherit to the place where it consumes the least space': [
//     'div{padding:0;padding-bottom:inherit;padding-right:inherit}',
//     'div{padding:inherit;padding-top:0;padding-left:0}'
//   ]
// }),
// 'complex granular properties': cssContext({
//   'two granular properties': 'a{border-bottom:1px solid red;border-color:red}',
//   'more understandable granular property should override less understandable': [
//     'a{border-color:rgba(0,0,0,.5);border-color:red}',
//     'a{border-color:red}'
//   ],
//   'less understandable granular property should NOT override more understandable': [
//     'a{border-color:red;border-color:rgba(0,0,0,.5)}',
//     'a{border-color:red;border-color:rgba(0,0,0,.5)}'
//   ],
//   'two same granular properties redefined': [
//     'a{border-color:rgba(0,0,0,.5);border-color:red;border:0}',
//     'a{border:0}'
//   ],
//   'important granular property redefined': 'a{border-color:red!important;border:0}',
//   'important granular property redefined with important': [
//     'a{border-color:red!important;border:0!important}',
//     'a{border:0!important}'
//   ],
//   'mix of border properties': [
//     'a{border-top:1px solid red;border-top-color:#0f0;color:red;border-top-width:2px;border-bottom-width:1px;border:0;border-left:1px solid red}',
//     'a{color:red;border:0;border-left:1px solid red}'
//   ]
// }),
