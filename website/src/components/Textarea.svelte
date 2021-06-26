<script>
  import { saveAs } from 'file-saver'
  import * as CleanCSS from 'clean-css'
  import CopySaveActions from './CopySaveActions.svelte'
  import SavedSizeBadge from './SavedSizeBadge.svelte';

  import { setClipboard } from '../utils'

  import { options } from '../stores'

  let input = ''
  let optimizedInput
  let savedSize

  const optimize = () => {
    const { errors, styles, stats } = new CleanCSS(options.getNormalized($options)).minify(input)
    console.log(errors, styles)
    if (errors.length > 0) {
      return
    }

    savedSize = stats.originalSize - stats.minifiedSize
    optimizedInput = styles
  }

  const saveToClipboard = () => {
    setClipboard(optimizedInput)
  }

  const save = () => {
    const blob = new Blob([optimizedInput], { type: 'text/css;charset=utf-8' })
    saveAs(blob, 'styles.min.css')
  }
</script>

<textarea bind:value={input} class="form-control" rows="6" placeholder="enter your raw css here to optimize it..."></textarea>
<div class="row mt-2">
  <button class="btn btn-primary d-inline" style="background-color: #27AAE1;" on:click={optimize}>optimize ➜</button>

  <div id="result" class="position-relative ms-2 flex-grow-1 d-flex p-0 align-items-center" style="width: 0;">
    <input class="form-control" type="text" disabled={optimizedInput === undefined} bind:value={optimizedInput}>
    {#if optimizedInput !== undefined}
      <SavedSizeBadge size={savedSize} class="text-nowrap ms-2" />
      <CopySaveActions
        onSavedToClipboard={saveToClipboard}
        onSave={save}
        class="ms-1 me-2 rounded border"
      />
    {/if}
  </div>
</div>

<style>
  textarea {
    resize: none;
  }
  div.row {
    width: 100%;
  }
  button {
    width: fit-content;
  }
</style>