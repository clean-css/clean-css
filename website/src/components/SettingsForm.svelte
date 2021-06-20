<script>
  import { options as optionsStore } from '../stores'
</script>

<form class="settings mb-4 d-flex flex-column">
  <fieldset class="settings__group">
    <select class="form-select" name="version">
      <option value="v5.1.2" selected>5.1.2 (latest)</option>
    </select>
  </fieldset>
  <div class="mt-2">
    <input class="form-check-input" type="checkbox" id="level_0" checked disabled />
    <label for="level_0">level 0 optimizations</label>
  </div>
  <div class="mt-2">
    <input class="form-check-input" type="checkbox" id="level_1" bind:checked={$optionsStore.enabledOptions.level['1']} />
    <label for="level_1">level 1 optimizations</label>
  </div>
  {#if $optionsStore.enabledOptions.level['1']}
    <ul class="fine-grained-options js-settings-level-1-options">
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_cleanup_charsets" bind:checked={$optionsStore.level['1'].cleanupCharsets} />
        <label for="level_1_cleanup_charsets">cleanup @charset at-rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_normalize_urls" bind:checked={$optionsStore.level['1'].normalizeUrls} />
        <label for="level_1_normalize_urls">normalize URLs</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_optimize_background" bind:checked={$optionsStore.level['1'].optimizeBackground} />
        <label for="level_1_optimize_background">optimize <em>background</em> properties</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_optimize_border_radius" bind:checked={$optionsStore.level['1'].optimizeBorderRadius} />
        <label for="level_1_optimize_border_radius">optimize <em>border-radius</em> properties</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_optimize_filter" bind:checked={$optionsStore.level['1'].optimizeFilter} />
        <label for="level_1_optimize_filter">optimize <em>filter</em> / <em>-ms-filter</em> properties</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_optimize_font_weight" bind:checked={$optionsStore.level['1'].optimizeFontWeight} />
        <label for="level_1_optimize_font_weight">optimize <em>font-weight</em> properties</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_optimize_outline" bind:checked={$optionsStore.level['1'].optimizeOutline} />
        <label for="level_1_optimize_outline">optimize <em>outline</em> properties</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_remove_empty" bind:checked={$optionsStore.level['1'].removeEmpty} />
        <label for="level_1_remove_empty">remove empty rules and nested blocks (after level 1 optimizations)</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_remove_negative_paddings" bind:checked={$optionsStore.level['1'].removeNegativePaddings} />
        <label for="level_1_remove_negative_paddings">remove negative <em>padding</em>s</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_remove_quotes" bind:checked={$optionsStore.level['1'].removeQuotes} />
        <label for="level_1_remove_quotes">remove quotes</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_remove_whitespace" bind:checked={$optionsStore.level['1'].removeWhitespace} />
        <label for="level_1_remove_whitespace">remove whitespace</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_replace_multiple_zeros" bind:checked={$optionsStore.level['1'].replaceMultipleZeros} />
        <label for="level_1_replace_multiple_zeros">replace multiple zeros</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_replace_time_units" bind:checked={$optionsStore.level['1'].replaceTimeUnits} />
        <label for="level_1_replace_time_units">replace time units</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_replace_zero_units" bind:checked={$optionsStore.level['1'].replaceZeroUnits} />
        <label for="level_1_replace_zero_units">replace <em>0</em> units</label>
      </li>
      <li>
        <label for="level_1_rounding_precision">unit rounding precision</label>
        <input 
          class="form-control d-inline-flex my-1" 
          type="text" 
          id="level_1_rounding_precision" 
          bind:value={$optionsStore.level['1'].roundingPrecision}  placeholder="e.g 5 or *=off,px=4" 
          style="width: 200px;"
        />
      </li>
      <li>
        <select class="form-select my-1" bind:value={$optionsStore.level['1'].selectorsSortingMethod}>
          <option value="natural">Selectors sorting method: natural</option>
          <option value="none">Selectors sorting method: none</option>
          <option value="standard" selected>Selectors sorting method: standard</option>
        </select>
      </li>
      <li>
        <select class="form-select my-1" bind:value={$optionsStore.level['1'].specialComments}>
          <option value="all">Special comments: keep all</option>
          <option value="1">Special comments: remove all but the first one</option>
          <option value="0">Special comments: remove all</option>
        </select>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_tidy_at_rules" bind:checked={$optionsStore.level['1'].tidyAtRules} />
        <label for="level_1_tidy_at_rules">tidy at-rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_tidy_block_scopes" bind:checked={$optionsStore.level['1'].tidyBlockScopes} />
        <label for="level_1_tidy_block_scopes">tidy block scopes</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="level_1_tidy_selectors" bind:checked={$optionsStore.level['1'].tidySelectors} />
        <label for="level_1_tidy_selectors">tidy selectors</label>
      </li>
    </ul>
  {/if}
  <div class="mt-2">
    <input class="form-check-input" type="checkbox" id="level_2" bind:checked={$optionsStore.enabledOptions.level['2']} />
    <label for="level_2">level 2 optimizations</label>
  </div>
  {#if $optionsStore.enabledOptions.level['2']}
    <ul>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].mergeAdjacentRules} />
        <label for="level_2_merge_adjacent_rules">merge adjacent rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].mergeIntoShorthands} />
        <label for="level_2_merge_into_shorthands">merge components into shorthand properties</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].mergeMedia} />
        <label for="level_2_merge_media">merge <em>@media</em> nested blocks</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].mergeNonAdjacentRules} />
        <label for="level_2_merge_non_adjacent_rules">merge non-adjacent rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].mergeSemantically} />
        <label for="level_2_merge_semantically">merge semantically</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].overrideProperties} />
        <label for="level_2_override_properties">override properties based on understandability</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].reduceNonAdjacentRules} />
        <label for="level_2_reduce_non_adjacent_rules">reduce non-adjacent rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].removeDuplicateFontRules} />
        <label for="level_2_remove_duplicate_font_rules">remove duplicate <em>@font-face</em> rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].removeDuplicateMediaBlocks} />
        <label for="level_2_remove_duplicate_media_blocks">remove duplicate <em>@media</em> nested blocks</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].removeDuplicateRules} />
        <label for="level_2_remove_duplicate_rules">remove duplicate rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].removeEmpty} />
        <label for="level_2_remove_empty">remove empty rules and nested blocks (after level 2 optimizations)</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].removeUnusedAtRules} />
        <label for="level_2_remove_unused_at_rules">remove unused <em>@counter-style</em>, <em>@font-face</em>, <em>@keyframes</em>, and <em>@namespace</em> at rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" bind:checked={$optionsStore.level['2'].restructureRules} />
        <label for="level_2_restructure_rules">restructure rules</label>
      </li>
      <li>
        <label for="level_2_skip_properties">skip optimizing properties</label>
        <input class="form-control d-inline-flex" style="width: 300px;" type="text" bind:value={$optionsStore.level['2'].skipProperties} placeholder="e.g background,font,margin" />
      </li>
    </ul>
  {/if}
  <select class="form-select mt-3" bind:value={$optionsStore.compatibility}>
    <option value="">Modern browsers compatibility (Internet Explorer 11+)</option>
    <option value="ie10">Modern browsers &amp; Internet Explorer 10+ compatibility</option>
    <option value="ie9">Modern browsers &amp; Internet Explorer 9+ compatibility</option>
    <option value="ie8">Modern browsers &amp; Internet Explorer 8+ compatibility</option>
    <option value="ie7">Modern browsers &amp; Internet Explorer 7+ compatibility</option>
  </select>
  <div class="mt-1">
    <input class="form-check-input" type="checkbox" id="format" bind:checked={$optionsStore.enabledOptions.format} />
    <label for="format">output formatting</label>
  </div>
    {#if $optionsStore.enabledOptions.format}
    <ul>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_after_at_rule" bind:checked={$optionsStore.format.breaks.afterAtRule} />
        <label for="format_breaks_after_at_rule">insert line break after at-rules</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_after_block_begins" bind:checked={$optionsStore.format.breaks.afterBlockBegins} />
        <label for="format_breaks_after_block_begins">insert line break after block begins</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_after_block_ends" bind:checked={$optionsStore.format.breaks.afterBlockEnds} />
        <label for="format_breaks_after_block_ends">insert line break after block ends</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_after_comment" bind:checked={$optionsStore.format.breaks.afterComment} />
        <label for="format_breaks_after_comment">insert line break after comments</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_after_property" bind:checked={$optionsStore.format.breaks.afterProperty} />
        <label for="format_breaks_after_property">insert line break after properties</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_after_rule_begins" bind:checked={$optionsStore.format.breaks.afterRuleBegins} />
        <label for="format_breaks_after_rule_begins">insert line break after rule begins</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_after_rule_ends" bind:checked={$optionsStore.format.breaks.afterRuleEnds} />
        <label for="format_breaks_after_rule_ends">insert line break after rule ends</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_before_block_ends" bind:checked={$optionsStore.format.breaks.beforeBlockEnds} />
        <label for="format_breaks_before_block_ends">insert line break before block ends</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_breaks_between_selectors" bind:checked={$optionsStore.format.breaks.betweenSelectors} />
        <label for="format_breaks_between_selectors">insert line break between selectors</label>
      </li>
      <li>
        <label for="format_indent_by">indent with</label>
        <input class="form-control d-inline-flex" style="width: 60px;" type="number" min="0" max="16" id="format_indent_by"  bind:value={$optionsStore.format.indentBy} />
        <select class="form-select d-inline-flex" style="width: 140px;" bind:value={$optionsStore.format.indentWith}>
          <option value="space" selected>space(s)</option>
          <option value="tab">tab(s)</option>
        </select>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_spaces_around_selector_relation" bind:checked={$optionsStore.format.spaces.aroundSelectorRelation} />
        <label for="format_spaces_around_selector_relation">insert space between selector relation</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_spaces_before_block_begins" bind:checked={$optionsStore.format.spaces.beforeBlockBegins} />
        <label for="format_spaces_before_block_begins">insert space before block begins</label>
      </li>
      <li>
        <input class="form-check-input" type="checkbox" id="format_spaces_before_value" bind:checked={$optionsStore.format.spaces.beforeValue} />
        <label for="format_spaces_before_value">insert space before property value</label>
      </li>
      <li>
        <label for="format_wrap_at">wrap lines when longer than</label>
        <input class="form-control d-inline-flex" style="width: 60px;" type="number" min="0" id="format_wrap_at" bind:value={$optionsStore.format.wrapAt} />
        <label for="format_wrap_at">characters</label>
      </li>
    </ul>
  {/if}

  <button class="btn btn-outline-primary mt-4 align-self-end" type="button" on:click={optionsStore.reset}>Reset settings to defaults</button>
</form>

<style>
  label {
    display: inline;
  }

  .settings li {
    list-style-type: none;
  }
</style>