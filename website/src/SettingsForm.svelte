<script>
  const DEFAULT_OPTIONS = {
    level: {
      1: {
        cleanupCharsets: false
      }
    }
  }
  const DEFAULT_OPENED_LEVEL = {
    0: true,
    1: true,
    2: false,
    format: false
  }

  let options = {...DEFAULT_OPTIONS}
  let openedLevel = {...DEFAULT_OPENED_LEVEL}

  const resetSettings = () => {
    options = {...DEFAULT_OPTIONS}
    openedLevel = {...DEFAULT_OPENED_LEVEL}
  }

  // $: console.log(options)

</script>

<form class="settings settings--collapsed js-settings">
  <fieldset class="settings__group">
    <select class="settings__option settings__option--version" name="version">
      <option value="v5.1.2" selected>5.1.2 (latest)</option>
    </select>
  </fieldset>
  <fieldset class="settings__group settings__group--advanced">
    <div class="settings__group__wrapper">
      <input class="form-check-input" type="checkbox" id="level_0" checked disabled />
      <label for="level_0">level 0 optimizations</label>
    </div>
    <div class="settings__group__wrapper">
      <input class="form-check-input" type="checkbox" id="level_1" bind:checked={openedLevel['1']} />
      <label for="level_1">level 1 optimizations</label>
    </div>
    {#if openedLevel['1']}
      <ul class="fine-grained-options js-settings-level-1-options">
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_cleanup_charsets" bind:checked={options.level['1'].cleanupCharsets} />
          <label for="level_1_cleanup_charsets">cleanup @charset at-rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_normalize_urls" name="level[1][normalizeUrls]" checked />
          <label for="level_1_normalize_urls">normalize URLs</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_optimize_background" name="level[1][optimizeBackground]" checked />
          <label for="level_1_optimize_background">optimize <em>background</em> properties</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_optimize_border_radius" name="level[1][optimizeBorderRadius]" checked />
          <label for="level_1_optimize_border_radius">optimize <em>border-radius</em> properties</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_optimize_filter" name="level[1][optimizeFilter]" checked />
          <label for="level_1_optimize_filter">optimize <em>filter</em> / <em>-ms-filter</em> properties</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_optimize_font_weight" name="level[1][optimizeFontWeight]" checked />
          <label for="level_1_optimize_font_weight">optimize <em>font-weight</em> properties</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_optimize_outline" name="level[1][optimizeOutline]" checked />
          <label for="level_1_optimize_outline">optimize <em>outline</em> properties</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_remove_empty" name="level[1][removeEmpty]" checked />
          <label for="level_1_remove_empty">remove empty rules and nested blocks (after level 1 optimizations)</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_remove_negative_paddings" name="level[1][removeNegativePaddings]" checked />
          <label for="level_1_remove_negative_paddings">remove negative <em>padding</em>s</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_remove_quotes" name="level[1][removeQuotes]" checked />
          <label for="level_1_remove_quotes">remove quotes</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_remove_whitespace" name="level[1][removeWhitespace]" checked />
          <label for="level_1_remove_whitespace">remove whitespace</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_replace_multiple_zeros" name="level[1][replaceMultipleZeros]" checked />
          <label for="level_1_replace_multiple_zeros">replace multiple zeros</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_replace_time_units" name="level[1][replaceTimeUnits]" checked />
          <label for="level_1_replace_time_units">replace time units</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_replace_zero_units" name="level[1][replaceZeroUnits]" checked />
          <label for="level_1_replace_zero_units">replace <em>0</em> units</label>
        </li>
        <li class="fine-grained-options__option">
          <label for="level_1_rounding_precision">unit rounding precision</label>
          <input class="settings__option js-settings-option" type="text" id="level_1_rounding_precision" name="level[1][roundingPrecision]" value="" placeholder="e.g 5 or *=off,px=4" />
        </li>
        <li class="fine-grained-options__option">
          <select class="settings__option settings__option--select js-settings-option" id="level_1_selectors_sorting_method" name="level[1][selectorsSortingMethod]">
            <option value="natural">Selectors sorting method: natural</option>
            <option value="none">Selectors sorting method: none</option>
            <option value="standard" selected>Selectors sorting method: standard</option>
          </select>
        </li>
        <li class="fine-grained-options__option">
          <select class="settings__option settings__option--select js-settings-option" id="level_1_special_comments" name="level[1][specialComments]">
            <option value="all" selected>Special comments: keep all</option>
            <option value="1">Special comments: remove all but the first one</option>
            <option value="0">Special comments: remove all</option>
          </select>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_tidy_at_rules" name="level[1][tidyAtRules]" checked />
          <label for="level_1_tidy_at_rules">tidy at-rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_tidy_block_scopes" name="level[1][tidyBlockScopes]" checked />
          <label for="level_1_tidy_block_scopes">tidy block scopes</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_1_tidy_selectors" name="level[1][tidySelectors]" checked />
          <label for="level_1_tidy_selectors">tidy selectors</label>
        </li>
      </ul>
    {/if}
    <div class="settings__group__wrapper">
      <input class="form-check-input" type="checkbox" id="level_2" bind:checked={openedLevel['2']} />
      <label for="level_2">level 2 optimizations</label>
    </div>
    {#if openedLevel['2']}
      <ul class="fine-grained-options  js-settings-level-2-options">
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_merge_adjacent_rules" name="level[2][mergeAdjacentRules]" checked />
          <label for="level_2_merge_adjacent_rules">merge adjacent rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_merge_into_shorthands" name="level[2][mergeIntoShorthands]" checked />
          <label for="level_2_merge_into_shorthands">merge components into shorthand properties</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_merge_media" name="level[2][mergeMedia]" checked />
          <label for="level_2_merge_media">merge <em>@media</em> nested blocks</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_merge_non_adjacent_rules" name="level[2][mergeNonAdjacentRules]" checked />
          <label for="level_2_merge_non_adjacent_rules">merge non-adjacent rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_merge_semantically" name="level[2][mergeSemantically]" />
          <label for="level_2_merge_semantically">merge semantically</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_override_properties" name="level[2][overrideProperties]" checked />
          <label for="level_2_override_properties">override properties based on understandability</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_reduce_non_adjacent_rules" name="level[2][reduceNonAdjacentRules]" checked />
          <label for="level_2_reduce_non_adjacent_rules">reduce non-adjacent rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_remove_duplicate_font_rules" name="level[2][removeDuplicateFontRules]" checked />
          <label for="level_2_remove_duplicate_font_rules">remove duplicate <em>@font-face</em> rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_remove_duplicate_media_blocks" name="level[2][removeDuplicateMediaBlocks]" checked />
          <label for="level_2_remove_duplicate_media_blocks">remove duplicate <em>@media</em> nested blocks</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_remove_duplicate_rules" name="level[2][removeDuplicateRules]" checked />
          <label for="level_2_remove_duplicate_rules">remove duplicate rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_remove_empty" name="level[2][removeEmpty]" checked />
          <label for="level_2_remove_empty">remove empty rules and nested blocks (after level 2 optimizations)</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_remove_unused_at_rules" name="level[2][removeUnusedAtRules]" />
          <label for="level_2_remove_unused_at_rules">remove unused <em>@counter-style</em>, <em>@font-face</em>, <em>@keyframes</em>, and <em>@namespace</em> at rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="level_2_restructure_rules" name="level[2][restructureRules]" />
          <label for="level_2_restructure_rules">restructure rules</label>
        </li>
        <li class="fine-grained-options__option">
          <label for="level_2_skip_properties">skip optimizing properties</label>
          <input class="settings__option js-settings-option" type="text" id="level_2_skip_properties" name="level[2][skipProperties]" value="" placeholder="e.g background,font,margin" />
        </li>
      </ul>
    {/if}
  </fieldset>
  <fieldset class="settings__group">
    <div class="settings__group__wrapper">
      <select class="settings__option settings__option--select js-settings-compatibility js-settings-option" id="compatibility" name="compatibility">
        <option value="" selected>Modern browsers compatibility (Internet Explorer 11+)</option>
        <option value="ie10">Modern browsers &amp; Internet Explorer 10+ compatibility</option>
        <option value="ie9">Modern browsers &amp; Internet Explorer 9+ compatibility</option>
        <option value="ie8">Modern browsers &amp; Internet Explorer 8+ compatibility</option>
        <option value="ie7">Modern browsers &amp; Internet Explorer 7+ compatibility</option>
      </select>
    </div>
    <div class="settings__group__wrapper">
      <input class="form-check-input" type="checkbox" id="format" bind:checked={openedLevel.format} />
      <label for="format">output formatting</label>
    </div>
     {#if openedLevel.format}
      <ul class="fine-grained-options  js-settings-format-options">
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_after_at_rule" name="format_breaks[afterAtRule]" checked />
          <label for="format_breaks_after_at_rule">insert line break after at-rules</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_after_block_begins" name="format_breaks[afterBlockBegins]" checked />
          <label for="format_breaks_after_block_begins">insert line break after block begins</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_after_block_ends" name="format_breaks[afterBlockEnds]" checked />
          <label for="format_breaks_after_block_ends">insert line break after block ends</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_after_comment" name="format_breaks[afterComment]" checked />
          <label for="format_breaks_after_comment">insert line break after comments</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_after_property" name="format_breaks[afterProperty]" checked />
          <label for="format_breaks_after_property">insert line break after properties</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_after_rule_begins" name="format_breaks[afterRuleBegins]" checked />
          <label for="format_breaks_after_rule_begins">insert line break after rule begins</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_after_rule_ends" name="format_breaks[afterRuleEnds]" checked />
          <label for="format_breaks_after_rule_ends">insert line break after rule ends</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_before_block_ends" name="format_breaks[beforeBlockEnds]" checked />
          <label for="format_breaks_before_block_ends">insert line break before block ends</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_breaks_between_selectors" name="format_breaks[betweenSelectors]" checked />
          <label for="format_breaks_between_selectors">insert line break between selectors</label>
        </li>
        <li class="fine-grained-options__option">
          <label for="format_indent_by">indent with</label>
          <input class="settings__option settings__option--number js-settings-option" type="number" min="0" max="16" id="format_indent_by" name="format[indentBy]" value="2" />
          <select class="settings__option settings__option--inline-select js-settings-option" id="format_indent_with" name="format[indentWith]">
            <option value="space" selected>space(s)</option>
            <option value="tab">tab(s)</option>
          </select>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_spaces_around_selector_relation" name="format_spaces[aroundSelectorRelation]" checked />
          <label for="format_spaces_around_selector_relation">insert space between selector relation</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_spaces_before_block_begins" name="format_spaces[beforeBlockBegins]" checked />
          <label for="format_spaces_before_block_begins">insert space before block begins</label>
        </li>
        <li class="fine-grained-options__option">
          <input class="form-check-input" type="checkbox" id="format_spaces_before_value" name="format_spaces[beforeValue]" checked />
          <label for="format_spaces_before_value">insert space before property value</label>
        </li>
        <li class="fine-grained-options__option">
          <label for="format_wrap_at">wrap lines when longer than</label>
          <input class="settings__option settings__option--number js-settings-option" type="number" min="0" id="format_wrap_at" name="format[wrapAt]" value="" />
          <label for="format_wrap_at">characters</label>
        </li>
      </ul>
    {/if}
  </fieldset>
  <button class="btn btn-primary" type="button" on:click={resetSettings}>Reset settings to defaults</button>
</form>

<style></style>