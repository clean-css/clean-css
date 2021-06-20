<script>
  import Icon from "./Icon/Icon.svelte";
</script>

<header class="d-flex justify-content-center p-6">
  <a href="https://github.com/jakubpawlowicz/clean-css" target="_blank">
    <Icon name="logo" />
  </a>
</header>

<style>
  header :global(.icon) {
    font-size: 15em;
  }
</style>