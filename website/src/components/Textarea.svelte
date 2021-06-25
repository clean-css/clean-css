<script>
  import * as CleanCSS from 'clean-css'
  import { options } from '../stores'

  let input = ''
  let optimizedInput
  let isCssErrored = false

  const optimize = () => {
    const { errors, styles } = new CleanCSS(options.getNormalized($options)).minify(input)
    if (errors.length > 0) {
      isCssErrored = true
      return
    }

    console.log(styles)
    optimizedInput = styles
  }
</script>

<textarea bind:value={input} class="form-control" rows="6"></textarea>
<div class="row mt-2">
  <button class="btn btn-primary d-inline" on:click={optimize}>optimize ➜</button>
  <input class="form-control ms-2" type="text" disabled={!optimizedInput} bind:value={optimizedInput}>
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
  input {
    width: 0;
    flex-grow: 1;
  }
</style>