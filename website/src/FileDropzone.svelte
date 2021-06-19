<script>
  import Dropzone from "svelte-file-dropzone"
	import Legend from "./Legend.svelte"
  import LoadedFile from "./LoadedFile.svelte";

  import {byteCount} from "./utils"

  let files = []

  const reader = new FileReader();

  const addFile = (originFile, file) => {
    console.log(originFile, file)
    files = [...files, {
      origin: {
        name: originFile.name,
        content: originFile.target.result
      }, 
      minified: {
        name: file.name,
        content: file.target.result
      }
    }]
  }

  const handleFilesSelect = (e) => {
    const { acceptedFiles, fileRejections } = e.detail
    
    acceptedFiles.forEach(file => {
      const { name } = file
      reader.addEventListener("loadend", (event) => {
        event.name = name
        addFile(event, event)
      })

      reader.readAsText(file)
    })
    
    if (fileRejections) {
      // TODO: show error
    }
  }
</script>

<div class="d-flex flex-column px-4">
  <Dropzone on:drop={handleFilesSelect} accept={['text/css']}>
    <p class="m-3">Drop your files here to optimize them</p>
  </Dropzone>
  <ol>
    {#each files as { origin, minified }}
      <LoadedFile filename={minified.name} sizeSaved={byteCount(origin.content) - byteCount(minified.content)} />
    {/each}
  </ol>
  <Legend />
</div>
