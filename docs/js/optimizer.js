Optimizer = {
  options: null, // see setOptionsFrom in settings.js

  start: function () {
    this.worker = new Worker('./js/optimizer-worker.js')
    this.worker.onmessage = function (event) {
      switch (event.data.command) {
        case 'optimized':
          Optimizer.oncomplete(event.data.id, event.data.output, event.data.saved)
      }
    }
    this.worker.onerror = function (event) {
      console.error(event)
    }
  },

  initialize: function() {
    this.worker.postMessage({
      command: 'initialize'
    })
  },

  process: function (id, styles) {
    this.worker.postMessage({
      command: 'optimize',
      id: id,
      input: styles,
      options: this.options
    })
  },

  oncomplete: function () { /* noop */ }
}

Optimizer.start()
