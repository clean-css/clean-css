<script>
  import Dropzone from 'svelte-file-dropzone'
  import * as CleanCSS from 'clean-css'
  import { options } from '../stores'

import Legend from './Legend.svelte'
  import LoadedFile from './LoadedFile.svelte'

  let isDroppedFileErrored = false
  let files = []

  const addFile = (file) => {
    const { errors, styles, stats } = new CleanCSS(options.getNormalized($options)).minify(file.target.result)
    if (errors.length > 0) {
      isDroppedFileErrored = true
      return
    }

    files = [...files, {
      name: file.name,
      content: styles,
      originalSize: stats.originalSize,
      minifiedSize: stats.minifiedSize
    }]
  }

  const handleFilesSelect = (e) => {
    if (isDroppedFileErrored) isDroppedFileErrored = false

    const { acceptedFiles } = e.detail

    acceptedFiles.forEach(file => {
      const { name } = file

      const reader = new FileReader()
      reader.addEventListener('loadend', (event) => {
        event.name = name
        addFile(event)
      })

      reader.readAsText(file)
    })
  }
</script>

<div class="d-flex flex-column justify-center">
  <Dropzone 
    on:dropaccepted={handleFilesSelect}
    on:droprejected={() => { isDroppedFileErrored = true }}
    accept={['text/css']} 
    containerClasses={`position-relative ${isDroppedFileErrored ? 'errored' : ''}`}
  >
    <p class="my-5 mx-3 fs-4 fw-bold">Drop your files here to optimize them</p>

    {#if isDroppedFileErrored}
       <div class="alert alert-danger position-absolute bottom-0 end-0 m-1 p-1" role="alert">
        Please drop a valid <code>css</code> file!
      </div>
    {/if}
  </Dropzone>

  <ul class="list-group list-group-flush mt-2">
    {#each files as file}
      <LoadedFile name={file.name} sizeSaved={file.originalSize - file.minifiedSize} content={file.content} />
    {/each}
  </ul>
  <Legend />
</div>

<style>
  div :global(.dropzone) {
    cursor: pointer;
  }

  div :global(.dropzone.errored) {
    border-color: red;
  }
</style>