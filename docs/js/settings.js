(function () {
  var OPTION_NAME_PATTERN = /^\S+\[(\w+)\]$/

  function show(settingsForm) {
    return function (event) {
      if (event.target.classList.contains('settings__option--apply')) {
        return
      }

      if (settingsForm.classList.contains('settings--collapsed')) {
        event.preventDefault()
        settingsForm.classList.remove('settings--collapsed')
      }
    }
  }

  function toggleOptions(checkboxNode) {
    var toggableNode = checkboxNode.parentNode.nextElementSibling

    return function (event) {
      toggableNode.classList.toggle(toggableNode.dataset.visibilityClass)
    }
  }

  function hide(settingsForm) {
    return function (event) {
      event.preventDefault()
      settingsForm.classList.add('settings--collapsed')
    }
  }

  function setOptionsFrom(settingsForm) {
    var compatibilityNode = settingsForm.querySelector('.js-settings-compatibility')
    var formatOptionsContainer = settingsForm.querySelector('.js-settings-format-options')
    var level1OptionsContainer = settingsForm.querySelector('.js-settings-level-1-options')
    var level2OptionsContainer = settingsForm.querySelector('.js-settings-level-2-options')

    return function () {
      Optimizer.options = {
        compatibility: compatibilityNode.value,
        format: formattingEnabled(settingsForm) ?
          mapFormatOptions(formatOptionsContainer) :
          false,
        inline: ['local'],
        rebase: false,
        level: {
          0: true,
          1: levelEnabled(settingsForm, 1) ?
            mapOptionsIn(level1OptionsContainer) :
            false,
          2: levelEnabled(settingsForm, 2) ?
            mapOptionsIn(level2OptionsContainer) :
            false
        }
      }
    }
  }

  function formattingEnabled(settingsForm) {
    return settingsForm.querySelector('.js-settings-format').checked
  }

  function mapFormatOptions(containerNode) {
    var allOptions = mapOptionsIn(containerNode)

    return {
      breaks: {
        afterAtRule: allOptions.afterAtRule,
        afterBlockBegins: allOptions.afterBlockBegins,
        afterBlockEnds: allOptions.afterBlockEnds,
        afterComment: allOptions.afterComment,
        afterProperty: allOptions.afterProperty,
        afterRuleBegins: allOptions.afterRuleBegins,
        afterRuleEnds: allOptions.afterRuleEnds,
        beforeBlockEnds: allOptions.beforeBlockEnds,
        betweenSelectors: allOptions.betweenSelectors
      },
      indentBy: parseInt(allOptions.indentBy),
      indentWith: allOptions.indentWith,
      spaces: {
        aroundSelectorRelation: allOptions.aroundSelectorRelation,
        beforeBlockBegins: allOptions.beforeBlockBegins,
        beforeValue: allOptions.beforeValue
      },
      wrapAt: allOptions.wrapAt.length > 0 ?
        parseInt(allOptions.wrapAt) :
        false
    }
  }

  function levelEnabled(settingsForm, levelNumber) {
    return settingsForm.querySelector('.js-settings-level-' + levelNumber).checked
  }

  function mapOptionsIn(containerNode) {
    var allOptionNodes = containerNode.querySelectorAll('.js-settings-option')

    return Array.prototype.slice.call(allOptionNodes, 0)
      .reduce(function (accumulator, optionNode) {
        var name = optionNode.name
        var value = extractValue(optionNode)
        var optionName = OPTION_NAME_PATTERN.exec(name)[1]

        accumulator[optionName] = value

        return accumulator
      }, {})
  }

  function extractValue(node) {
    if (node.type == 'checkbox') {
      return node.checked
    } else {
      return node.value
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    var settingsForm = document.querySelector('.js-settings')
    var level1Checkbox = settingsForm.querySelector('.js-settings-level-1')
    var level2Checkbox = settingsForm.querySelector('.js-settings-level-2')
    var formattingCheckbox = settingsForm.querySelector('.js-settings-format')
    var applySettingsButton = settingsForm.querySelector('.js-settings-apply')

    settingsForm.addEventListener('click', show(settingsForm), false)
    level1Checkbox.addEventListener('click', toggleOptions(level1Checkbox), false)
    level2Checkbox.addEventListener('click', toggleOptions(level2Checkbox), false)
    formattingCheckbox.addEventListener('click', toggleOptions(formattingCheckbox), false)
    applySettingsButton.addEventListener('click', hide(settingsForm), false)
    applySettingsButton.addEventListener('click', setOptionsFrom(settingsForm), false)

    setOptionsFrom(settingsForm)()
  })
})()
