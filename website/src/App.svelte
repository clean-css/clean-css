<script>
	import Header from "./Header.svelte"

	export let name
</script>

<main>
	<Header />
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	<button type="button" class="btn btn-primary">Primary</button>
</main>

<style>

</style>