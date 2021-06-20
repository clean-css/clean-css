import { writable } from 'svelte/store'
import { deepCopyObject } from './utils'

const ENABLED_OPTIONS = {
  level: {
    0: true,
    1: true,
    2: false
  },
  format: false
}
const OPTIONS = {
  enabledOptions: ENABLED_OPTIONS,
  inline: ['local'],
  compatibility: '',
  rebase: false,
  sourceMap: false,
  level: {
    0: true,
    1: {
      cleanupCharsets: true,
      normalizeUrls: true,
      optimizeBackground: true,
      optimizeBorderRadius: true,
      optimizeFilter: true,
      optimizeFontWeight: true,
      optimizeOutline: true,
      removeEmpty: true,
      removeNegativePaddings: true,
      removeQuotes: true,
      removeWhitespace: true,
      replaceMultipleZeros: true,
      replaceTimeUnits: true,
      replaceZeroUnits: true,
      roundingPrecision: "",
      selectorsSortingMethod: "standard",
      specialComments: "all",
      tidyAtRules: true,
      tidyBlockScopes: true,
      tidySelectors: true
    },
    2: {
      mergeAdjacentRules: true,
      mergeIntoShorthands: true,
      mergeMedia: true,
      mergeNonAdjacentRules: true,
      mergeSemantically: false,
      overrideProperties: true,
      reduceNonAdjacentRules: true,
      removeDuplicateFontRules: true,
      removeDuplicateMediaBlocks: true,
      removeDuplicateRules: true,
      removeEmpty: true,
      removeUnusedAtRules: false,
      restructureRules: false,
      skipProperties: ""
    }
  },
  format: {
    breaks: {
      afterAtRule: true,
      afterBlockBegins: true,
      afterBlockEnds: true,
      afterComment: true,
      afterProperty: true,
      afterRuleBegins: true,
      afterRuleEnds: true,
      beforeBlockEnds: true,
      betweenSelectors: true,
    },
    indentBy: 2,
    indentWith: "space",
    spaces: {
      aroundSelectorRelation: true,
      beforeBlockBegins: true,
      beforeValue: true
    },
    wrapAt: false
  }
}

const createOptionsStore = () => {
  const { subscribe, update, set } = writable(deepCopyObject(OPTIONS))

  const getNormalized = (options) => {
    return {
      ...options,
      format: options.enabledOptions.format ? options.format : false,
      level: {
        ...options.level,
        1: options.enabledOptions.level['1'] ? options.level['1'] : false,
        2: options.enabledOptions.level['2'] ? options.level['2'] : false
      }
    }
  }

  return {
    set,
		subscribe,
    update,
    reset: () => {
      set(deepCopyObject(OPTIONS))
    },
    getNormalized
	}
}

export const options = createOptionsStore()
