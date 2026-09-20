/**
 * Interface localization: the toggle button, the stored preference, and the
 * DOM translation pass they drive.
 *
 * Started from `src/main.js` before the application boots, so the first paint
 * of a stored Traditional Chinese session is already translated.
 */

import { DEFAULT_LANGUAGE, LANGUAGES } from './dictionary.js';
import { createDomLocalizer } from './domLocalizer.js';
import { createLanguageToggle } from './languageToggle.js';
import { resolveLanguage } from './translation.js';

/**
 * Where the chosen language is remembered.
 *
 * Same `godsEyeView.<version>.<setting>` shape as the panel layout and
 * position keys, so clearing `godsEyeView.` clears this too.
 */
export const LANGUAGE_STORAGE_KEY = 'godsEyeView.v1.language';

/** Read the stored language, tolerating private mode and blocked storage. */
function storedLanguage(storage) {
  try {
    return storage?.getItem(LANGUAGE_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/** Persist the language; a refused write only costs the preference. */
function rememberLanguage(storage, code) {
  try {
    storage?.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    /* Storage is unavailable; the session still switches. */
  }
}

/**
 * Wire up interface localization.
 *
 * Returns null when the toggle button is absent — an embedding that ships its
 * own chrome keeps running untranslated rather than failing to boot.
 *
 * @param {object} [options] Localization options.
 * @param {Document} [options.document] Document to localize.
 * @param {Storage} [options.storage] Preference storage.
 * @param {ReadonlyArray<object>} [options.languages] Shipped languages.
 * @returns {{setLanguage: Function, getLanguage: Function, stop: Function}|null}
 *   Control, or null when there is nothing to bind to.
 */
export function startLocalization({
  document: doc = typeof document === 'undefined' ? null : document,
  storage = typeof localStorage === 'undefined' ? null : localStorage,
  languages = LANGUAGES,
} = {}) {
  const button = doc?.getElementById?.('language-toggle');
  if (!doc?.body || !button) return null;

  const localizer = createDomLocalizer({ root: doc.body });
  let active = DEFAULT_LANGUAGE;

  function apply(code, { persist = true } = {}) {
    active = resolveLanguage(code, languages, DEFAULT_LANGUAGE);
    const language = languages.find((entry) => entry.code === active);
    localizer.setStrings(language.strings);
    doc.documentElement?.setAttribute('lang', active);
    toggle.render(active);
    if (persist) rememberLanguage(storage, active);
  }

  const toggle = createLanguageToggle({
    button,
    languages,
    onSelect: (code) => apply(code),
  });

  apply(resolveLanguage(storedLanguage(storage), languages, DEFAULT_LANGUAGE), {
    persist: false,
  });

  return {
    setLanguage: apply,
    getLanguage: () => active,
    stop() {
      toggle.dispose();
      localizer.stop();
    },
  };
}
