Optimizer = {
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

  process: function (id, styles) {
    this.worker.postMessage({
      command: 'optimize',
      id: id,
      input: styles
    })
  },

  oncomplete: function () { /* noop */ }
}

Optimizer.start()
