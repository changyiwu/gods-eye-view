/**
 * Pure translation rules, with no DOM dependency so they stay unit-testable.
 *
 * `src/i18n/domLocalizer.js` supplies the traversal; everything that decides
 * WHETHER a string may be swapped, and WHAT it becomes, lives here.
 */

/** Attributes whose values a visitor reads, so they are translated too. */
export const TRANSLATABLE_ATTRIBUTES = Object.freeze([
  'title',
  'aria-label',
  'aria-valuetext',
  'placeholder',
  'alt',
]);

/**
 * Elements whose text content is not prose.
 *
 * `.material-symbols-outlined` is the load-bearing one: its text content is an
 * icon-font ligature name (`close`, `radar`, `public`). Translating it does not
 * produce a Chinese icon — the ligature never forms and the element renders the
 * literal replacement text, which is exactly the failure mode index.html warns
 * about for the font subset.
 */
const OPAQUE_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CANVAS',
  'TEXTAREA',
  'CODE',
  'PRE',
  'SVG',
]);
const OPAQUE_CLASSES = ['material-symbols-outlined'];

/** Opt-out marker any surface can set to keep its subtree in the source copy. */
export const SKIP_ATTRIBUTE = 'data-gev-no-translate';

/**
 * The lookup key for a rendered string.
 *
 * Template copy arrives wrapped and indented, and runtime copy arrives with
 * whatever spacing the renderer used, so both collapse to one key.
 *
 * @param {string} text Rendered text.
 * @returns {string} Whitespace-collapsed key.
 */
export function translationKey(text) {
  return String(text).replace(/\s+/g, ' ').trim();
}

/**
 * Whether an element's own text and attributes may be translated.
 *
 * @param {object} [element] Element-like node.
 * @returns {boolean} True when the element is ordinary prose.
 */
export function isTranslatableElement(element) {
  if (!element || element.nodeType !== 1) return false;
  const tag = String(element.tagName || '').toUpperCase();
  if (OPAQUE_TAGS.has(tag)) return false;
  if (typeof element.hasAttribute === 'function') {
    if (element.hasAttribute(SKIP_ATTRIBUTE)) return false;
    if (element.getAttribute('contenteditable') === 'true') return false;
  }
  const className = String(element.className || '');
  return !OPAQUE_CLASSES.some((name) => className.split(/\s+/).includes(name));
}

/**
 * Translate one rendered string, preserving the whitespace around it.
 *
 * Returns `null` — not the input — when the string is not in the table, so the
 * caller can tell "no translation exists" from "translates to itself" and leave
 * live data (callsigns, place names, readouts) untouched.
 *
 * @param {string} text Rendered text.
 * @param {object} [strings] English-keyed translation table.
 * @returns {string|null} Translated text, or null when nothing applies.
 */
export function translate(text, strings) {
  if (!strings || typeof text !== 'string' || !text.trim()) return null;
  const key = translationKey(text);
  if (!Object.hasOwn(strings, key)) return null;
  const translated = strings[key];
  if (typeof translated !== 'string' || translated === key) return null;
  const [, lead = '', , trail = ''] =
    text.match(/^(\s*)([\s\S]*?)(\s*)$/) || [];
  return `${lead}${translated}${trail}`;
}

/**
 * Resolve a stored language code against the shipped languages.
 *
 * @param {string} [code] Candidate code.
 * @param {ReadonlyArray<{code: string}>} languages Shipped languages.
 * @param {string} fallback Code to use when the candidate is unknown.
 * @returns {string} A code that exists in `languages`.
 */
export function resolveLanguage(code, languages, fallback) {
  return languages.some((language) => language.code === code) ? code : fallback;
}

/**
 * The language the toggle moves to next, cycling in shipped order.
 *
 * @param {string} current Active language code.
 * @param {ReadonlyArray<{code: string}>} languages Shipped languages.
 * @returns {string} The next code.
 */
export function nextLanguage(current, languages) {
  const index = languages.findIndex((language) => language.code === current);
  return languages[(index + 1) % languages.length].code;
}
