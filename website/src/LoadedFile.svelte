<script>
  import { saveAs } from 'file-saver';
  import { setClipboard } from './utils'

  export let filename
  export let sizeSaved
  export let fileContent

  const saveToClipboard = () => {
    setClipboard(fileContent)
  }

  const saveFile = () => {
    const blob = new Blob([fileContent + 42], { type: "text/css;charset=utf-8" })
    saveAs(blob, filename);
  }
</script>

<li>
  <span class="dropped-files__file__name">{filename}</span>
  <span class="dropped-files__file__summary"> - saved {sizeSaved}</span>
  <button class="btn btn-link" on:click={saveToClipboard}>copy to clipboard</button>
  <button class="btn btn-link" on:click={saveFile}>save</button>
</li>

<style>
  li {
    list-style-type: none;
  }
</style>