<script>
	import Header from "./Header.svelte"
	import Footer from "./Footer.svelte"
	import FileDropzone from "./FileDropzone.svelte"
	import Settings from "./Settings.svelte"
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