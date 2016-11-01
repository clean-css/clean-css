(function () {
  function show(settingsForm) {
    return function (event) {
      if (event.target.classList.contains('settings__option--apply'))
        return

      if (settingsForm.classList.contains('settings--collapsed')) {
        event.preventDefault()
        settingsForm.classList.remove('settings--collapsed')
      }
    }
  }

  function hide(settingsForm) {
    return function (event) {
      event.preventDefault()
      settingsForm.classList.add('settings--collapsed')
    }
  }

  function setOptionsFrom(settingsForm) {
    return function () {
      Optimizer.options = {
        advanced: settingsForm.querySelector('[name=advanced]').checked,
        aggressiveMerging: settingsForm.querySelector('[name=aggressive-merging]').checked,
        compatibility: settingsForm.querySelector('[name=compatibility]').value,
        keepBreaks: settingsForm.querySelector('[name=keep-breaks]').checked,
        keepSpecialComments: keepSpecialCommentsFrom(settingsForm.querySelector('[name=keep-special-comments]').value),
        mediaMerging: settingsForm.querySelector('[name=media-merging]').checked,
        processImport: false,
        rebase: false,
        restructuring: settingsForm.querySelector('[name=restructuring]').checked,
        roundingPrecision: parseInt(settingsForm.querySelector('[name=rounding-precision]').value),
        shorthandCompacting: settingsForm.querySelector('[name=shorthand-compacting]').checked
      }
    }
  }

  function keepSpecialCommentsFrom(value) {
    if (/^\d+$/.test(value)) {
      return parseInt(value)
    } else {
      return value
    }
  }

  function toggleAdvancedOptionsIn(settingsForm) {
    var checkboxNodes = settingsForm.querySelectorAll('.settings__group--advanced .settings__option--checkbox')

    return function () {
      Array.prototype.slice.call(checkboxNodes, 1).forEach(function (node) {
        node.disabled = !node.disabled
        node.checked = !node.checked
      })
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    var settingsForm = document.querySelector('.settings')
    var applySettingsButton = settingsForm.querySelector('.settings__option--apply')
    var advancedOptionNode = settingsForm.querySelector('.settings__option--advanced')

    settingsForm.addEventListener('click', show(settingsForm), false)
    applySettingsButton.addEventListener('click', hide(settingsForm), false)
    applySettingsButton.addEventListener('click', setOptionsFrom(settingsForm), false)
    advancedOptionNode.addEventListener('click', toggleAdvancedOptionsIn(settingsForm), false)

    setOptionsFrom(settingsForm)()
  })
})()
