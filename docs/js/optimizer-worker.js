onmessage = function(event) {
  if (!event.data)
    return

  switch (event.data.command) {
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

importScripts('//jakubpawlowicz.github.io/clean-css-builds/v3.4.20.js')
