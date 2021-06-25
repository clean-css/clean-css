<script>
  import Icon from "./Icon/Icon.svelte"

  let className = ''

  export { className as class }
  export let onSavedToClipboard
  export let onSave

  let isSavedToClipboard = false
  let isSaved = false

  const saveToClipboard = () => {
    isSavedToClipboard = true
    setTimeout(() => {
      isSavedToClipboard = false
    }, 700)

    onSavedToClipboard()
  }

  const save = () => {
    isSaved = true
    setTimeout(() => {
      isSaved = false
    }, 700)

    onSave()
  }

</script>

<div class={`d-flex ${className}`}>
  <button class="btn btn-link p-1" on:click={saveToClipboard}>
    <Icon name={isSavedToClipboard ? 'check': 'clipboard'}/>
  </button>
  <button class="btn btn-link p-1 ms-1" on:click={save}>
    <Icon name={isSaved ? 'check': 'download'}/>
  </button>
</div>