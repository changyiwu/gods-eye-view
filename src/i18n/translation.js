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
 *
 * `.gev-flap-text` is the split-flap chip label, and that component identifies
 * its own labels by comparing `textContent` against the string it set
 * (src/splitFlap.js). Rewriting the node under it makes `settle()` conclude a
 * newer label won the race and leave the flap cells stranded, and makes the
 * idempotence check miss so every ticker update replays the whole cascade.
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
const OPAQUE_CLASSES = ['material-symbols-outlined', 'gev-flap-text'];
/**
 * Class prefixes whose subtrees are left alone.
 *
 * Cesium's credit widget and its lightbox carry the attribution every data
 * provider requires as a condition of use — provider names, licence names and
 * their exact wording. That is a legal notice reproduced verbatim, not
 * interface copy, so it stays in the language its provider published it in.
 */
const OPAQUE_CLASS_PREFIXES = ['cesium-credit', 'cesium-widget-credits'];

/**
 * The separator this interface builds composite readouts with.
 *
 * GEV joins status lines from independent pieces — `CelesTrak · never`,
 * `MONITOR · RAW PRIOR · Upstream snapshot active`, `NORMAL · OFF · 4.0s` —
 * and the DOM holds each line as ONE text node. Whole-string lookup can never
 * match those, because the live half (a provider name, a duration, a bearing)
 * changes constantly. Splitting on this separator translates the fixed pieces
 * and leaves the live ones exactly as rendered.
 */
const SEGMENT_SEPARATOR = ' · ';

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
  const classNames = String(element.className || '').split(/\s+/);
  if (OPAQUE_CLASSES.some((name) => classNames.includes(name))) return false;
  return !classNames.some((name) =>
    OPAQUE_CLASS_PREFIXES.some((prefix) => name.startsWith(prefix)),
  );
}

/**
 * Look one exact string up, with no segment handling.
 *
 * @param {string} value Rendered string.
 * @param {object} strings Translation table.
 * @returns {string|null} Translation, or null when none applies.
 */
function lookup(value, strings) {
  const key = translationKey(value);
  if (!key || !Object.hasOwn(strings, key)) return null;
  const translated = strings[key];
  return typeof translated === 'string' && translated !== key
    ? translated
    : null;
}

/**
 * Translate a composite readout one segment at a time.
 *
 * An untranslated segment is kept exactly as it was rendered rather than
 * whitespace-collapsed, so a live value passes through byte for byte. Returns
 * null unless at least one segment actually moved — a line of pure live data
 * must not be rewritten just because it happens to contain the separator.
 *
 * @param {string} value Rendered string.
 * @param {object} strings Translation table.
 * @returns {string|null} Rejoined line, or null when nothing applies.
 */
function translateSegments(value, strings) {
  if (!value.includes(SEGMENT_SEPARATOR)) return null;
  let changed = false;
  const segments = value.split(SEGMENT_SEPARATOR).map((segment) => {
    const translated = lookup(segment, strings);
    if (translated === null) return segment;
    changed = true;
    return translated;
  });
  return changed ? segments.join(SEGMENT_SEPARATOR) : null;
}

/**
 * Translate one rendered string, preserving the whitespace around it.
 *
 * Returns `null` — not the input — when the string is not in the table, so the
 * caller can tell "no translation exists" from "translates to itself" and leave
 * live data (callsigns, place names, readouts) untouched.
 *
 * A whole-string match wins outright. Only when there is none is the text
 * treated as a composite readout and translated segment by segment, so a line
 * the table knows in full is never taken apart.
 *
 * @param {string} text Rendered text.
 * @param {object} [strings] English-keyed translation table.
 * @returns {string|null} Translated text, or null when nothing applies.
 */
export function translate(text, strings) {
  if (!strings || typeof text !== 'string' || !text.trim()) return null;
  const [, lead = '', core = '', trail = ''] =
    text.match(/^(\s*)([\s\S]*?)(\s*)$/) || [];
  const translated =
    lookup(core, strings) ?? translateSegments(core, strings) ?? null;
  return translated === null ? null : `${lead}${translated}${trail}`;
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
