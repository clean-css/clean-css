<script>
  import Icon from './Icon/Icon.svelte'
  import SettingsForm from './SettingsForm.svelte'

  let open = false

  const toggleOpen = () => {
    open = !open
  }
</script>

<div class="settings">
  <div class="d-flex justify-content-end">
    <button class="btn mb-2" on:click={toggleOpen}>
      <Icon name={open ? 'gear-highlighted' : 'gear'}/>
    </button>
  </div>

  {#if open}
    <SettingsForm />
  {/if}
</div>

<style>
  .settings {
    width: 100%;
  }

  .settings :global(.icon) {
    font-size: 1.5em;
  }
</style>