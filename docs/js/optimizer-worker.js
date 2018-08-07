var initialized = false

onmessage = function(event) {
  switch (event.data.command) {
    case 'initialize':
      if (!initialized) {
        initialized = true
        importScripts('//jakubpawlowicz.github.io/clean-css-builds/v4.2.1.js')
      }
      break
    case 'optimize':
      new CleanCSS(event.data.options).minify(event.data.input, function (error, output) {
        postMessage({
          command: 'optimized',
          id: event.data.id,
          error: error,
          output: output,
          saved: event.data.input.length - output.styles.length
        })
      })
  }
}


