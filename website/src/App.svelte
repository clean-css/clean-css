<script>
  import Header from "./components/Header.svelte";
  import Footer from "./components/Footer.svelte";
  import FileDropzone from "./components/FileDropzone.svelte";
  import Settings from "./components/Settings.svelte";
</script>

<Header />
<main class="d-flex flex-column justify-content-center align-items-center px-2 px-sm-5">
  <Settings />
  <FileDropzone />
  <Footer />
</main>

<style>
  main {
    max-width: 900px;
  }
</style>
