<script>
  import { saveAs } from 'file-saver';
  import { setClipboard } from './utils'

  export let name
  export let sizeSaved
  export let content

  const saveToClipboard = () => {
    setClipboard(content)
  }

  const saveFile = () => {
    console.log(content);
    const blob = new Blob([content], { type: "text/css;charset=utf-8" })
    saveAs(blob, name);
  }
</script>

<li class="list-group list-group-item p-1">
  <span class="fw-bold">{name}</span>
  <span class="fw-lighter fst-italic"> - saved {sizeSaved / 1000}kB</span>
  <button class="btn btn-link px-1 ms-4" on:click={saveToClipboard}>copy to clipboard</button>
  <button class="btn btn-link px-1" on:click={saveFile}>save</button>
</li>

<style>
  li {
    list-style-type: none;
  }
</style>