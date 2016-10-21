(function () {
  var uniqueID = (function () {
    var UID = new Date().getTime()

    return function () {
      return (UID++).toString(36)
    }
  })()

  function fileDraggedIn(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function fileDraggedOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function fileDropped(dropContainer) {
    var templateNode = document.querySelector('.dropped-file-template')

    return function (event) {
      event.preventDefault()

      for (var i = 0, l = event.dataTransfer.files.length; i< l; i++) {
        var file = event.dataTransfer.files[i]

        process(file, dropContainer, templateNode)
      }
    }
  }

  function process(file, dropContainer, templateNode) {
    var optimizationId = uniqueID()
    var importedNode = document.importNode(templateNode.content, true)
    var fileNode = importedNode.querySelector('.dropped-files__file')
    var nameNode = importedNode.querySelector('.dropped-files__file__name')
    var reader

    fileNode.classList.add('dropped-files__file--' + optimizationId)
    nameNode.innerText = file.name

    if (file.type == 'text/css') {
      reader = new FileReader()
      reader.onload = function (event) {
        Optimizer.process(optimizationId, event.target.result)
      }
      reader.readAsText(file)
    } else {
      fileNode.classList.add('dropped-files__file--invalid')
    }

    dropContainer.appendChild(importedNode)
  }

  function optimizationCompleted(optimizationId, output) {
    var fileNode = document.querySelector('.dropped-files__file--' + optimizationId)
    var downloadNode = fileNode.querySelector('.dropped-files__file__save')
    var stylesBlob = new Blob([output.styles])

    fileNode.classList.add('dropped-files__file--optimized')
    downloadNode.href = URL.createObjectURL(stylesBlob)
  }

  window.addEventListener('DOMContentLoaded', function () {
    var dragTarget = document.querySelector('.drag-target')

    dragTarget.addEventListener('dragenter', fileDraggedIn, false)
    dragTarget.addEventListener('dragover', fileDraggedOver, false)
    dragTarget.addEventListener('drop', fileDropped(dragTarget), false)

    Optimizer.oncomplete = optimizationCompleted
  })
})()
