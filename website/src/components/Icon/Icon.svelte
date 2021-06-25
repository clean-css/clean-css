<script>
  import gearHighlighted from './icons/gear-highlighted.svg'
  import gear from './icons/gear.svg'
  import logo from './icons/logo.svg'
  import spinner from './icons/spinner.svg'

  let className = ''

  export let name = 'gear'
  export { className as class }

  const icons = {
    'gear-highlighted': gearHighlighted,
    gear,
    logo,
    spinner
  }
</script>

<style lang="scss">
  .icon {
    display: flex;
    width: 1em;
    height: 1em;
  }

  .icon :global(svg) {
    width: 1em;
  }
</style>

<img src={icons[name]} class={`icon ${className}`} alt={`Icon ${name}`} />
