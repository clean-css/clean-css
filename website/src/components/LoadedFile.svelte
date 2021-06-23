<script>
  import { saveAs } from 'file-saver'
  import { setClipboard } from '../utils'

  export let name
  export let sizeSaved
  export let content

  const saveToClipboard = () => {
    setClipboard(content)
  }

  const saveFile = () => {
    const blob = new Blob([content], { type: 'text/css;charset=utf-8' })
    saveAs(blob, name)
  }
</script>

<li class="list-group list-group-item d-flex flex-row align-items-center p-1">
  <span class="fw-bold">{name}</span>
  <span class="fw-lighter fst-italic"> - saved {sizeSaved / 1000} kB</span>
  <div class="d-flex justify-content-end flex-grow-1">
    <button class="btn btn-link p-1 ms-4" on:click={saveToClipboard}>copy to clipboard</button>
    <button class="btn btn-link p-1" on:click={saveFile}>save</button>
  </div>
</li>

<style>
  li {
    list-style-type: none;
  }
</style>