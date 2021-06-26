<script>
  export let size
  let className = ''
  export { className as class }
</script>

<span class={`fw-lighter fst-italic ${className}`}> - saved {size / 1000} kB</span>