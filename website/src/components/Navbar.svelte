<script>
  import { Github } from 'svelte-bootstrap-icons'
</script>


<nav class="navbar navbar-expand-lg w-100 px-md-4 pt-0 pb-0 navbar-light">
  <div class="container-fluid">
    <ul class="d-flex align-items-center ms-auto mb-0">
			<li class="nav-item">
				<a class="nav-link d-flex align-items-center fs-5 p-1" href="https://github.com/jakubpawlowicz/clean-css" target="_blank">
					<Github /> <p class="ms-1 p-0 m-0">GitHub</p>
				</a>
      </li>
      <li class="nav-item align-items-center">
        <a href="https://www.npmjs.com/package/clean-css?activeTab=readme p-1" target="_blank">
				  <img alt="npm" src="https://img.shields.io/npm/dw/clean-css">
        </a>
      </li>
			<li class="nav-item align-items-center">
        <a class="p-1" href="https://github.com/jakubpawlowicz/clean-css/stargazers" target="_blank">
				  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/jakubpawlowicz/clean-css?style=social">
        </a>
      </li>
    </ul>
  </div>
</nav>

<style>
	.navbar {
		position: relative;
		display: inline-block;
	}

	h1 {
		line-height: 2.5em;
	}

	li {
		display: block;
	}

	nav {
		z-index: 2;
	}

	.navbar-brand img {
		width: 25%
	}

	a {
		display: block;
		text-decoration: none;
		padding: 1em 0.5em;
		color: black;
	}
</style>
