<script>
  import { saveAs } from 'file-saver'
  import CopySaveActions from './CopySaveActions.svelte'
  import SavedSizeBadge from './SavedSizeBadge.svelte'

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
  <SavedSizeBadge size={sizeSaved} />

  <CopySaveActions onSavedToClipboard={saveToClipboard} onSave={saveFile} class="position-absolute top-50 end-0 translate-middle-y" />
</li>

<style>
  li {
    list-style-type: none;
  }
</style>