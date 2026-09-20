/**
 * The interface-language button in the top-center globe actions.
 *
 * The button shows the language it switches TO, the way a two-position switch
 * is labelled by its other side: `中` while the interface is English, `EN`
 * while it is Traditional Chinese.
 */

import { LANGUAGES } from './dictionary.js';
import { nextLanguage } from './translation.js';

/** The button's own copy, in each language, kept out of the swap path. */
const TOGGLE_LABELS = Object.freeze({
  en: Object.freeze({
    title: 'Switch interface language',
    ariaLabel: 'Switch interface language to Traditional Chinese',
  }),
  'zh-TW': Object.freeze({
    title: '切換介面語言',
    ariaLabel: '將介面語言切換為英文',
  }),
});

/**
 * Bind the toggle button to a language setter.
 *
 * @param {object} options Toggle options.
 * @param {object} options.button The `#language-toggle` element.
 * @param {Function} options.onSelect Called with the chosen language code.
 * @param {ReadonlyArray<object>} [options.languages] Shipped languages.
 * @returns {{render: Function, dispose: Function}} Toggle control.
 */
export function createLanguageToggle({
  button,
  onSelect,
  languages = LANGUAGES,
} = {}) {
  if (!button) throw new TypeError('A toggle button is required');
  if (typeof onSelect !== 'function')
    throw new TypeError('A language selection handler is required');
  let active = languages[0].code;

  /** Paint the button for the language it would switch to next. */
  function render(code = active) {
    active = code;
    const target = languages.find(
      (language) => language.code === nextLanguage(active, languages),
    );
    const copy = TOGGLE_LABELS[active] || TOGGLE_LABELS.en;
    button.textContent = target.label;
    button.setAttribute('title', copy.title);
    button.setAttribute('aria-label', copy.ariaLabel);
    button.setAttribute('lang', target.code);
    button.dataset.language = active;
  }

  const onClick = () => onSelect(nextLanguage(active, languages));
  button.addEventListener('click', onClick);
  render(active);

  return {
    render,
    /** Release the listener; the button keeps its current label. */
    dispose() {
      button.removeEventListener('click', onClick);
    },
  };
}
