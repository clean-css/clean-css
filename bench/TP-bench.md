

## [Tim Peterson](https://github.com/tim-peterson) Benchmark comparing compression size of Clean-CSS and YUI compressor


### TP-demo.css file is a concatentation of the following:
1. jQueryUI.css [download](http://jqueryui.com/download/)
2. bootstrap.css [download](http://twitter.github.com/bootstrap/index.html)
3. bootstrap-responsive.css [same as above](http://twitter.github.com/bootstrap/index.html)
4. glyphicons.css [download](http://glyphicons.com/)
5. font-awesome.css (icon-font) [download](http://fortawesome.github.com/Font-Awesome/)
6. proximanova.css (font-family) [download](https://typekit.com/fonts/proxima-nova)
7. TP-site.css (my site's styles) 

### Clean-CSS minification
```
/clean-css/bin/cleancss -o /css/TP-demo.css /css/TP-demo-Clean-CSS.min.css
```

### YUICompressor minification
I simply input TP-demo.css in this [online YUI compressor](http://refresh-sf.com/yui/). Though you can use it via the command line after installing YUICompressor more or less like this:
```
java -jar yuicompressor-2.4.7.jar /css/TP-demo-YUICompressor.min.css -o
```

##Compression sizes:
* TP-demo.css: 325kb
* TP-demo-Clean-CSS.min.css: 288kb (11.7% reduction)
* TP-demo-YUICompressor.min.css: 246kb (24.4% reduction)

