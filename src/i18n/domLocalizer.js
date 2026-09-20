/**
 * In-place interface translation over the rendered DOM.
 *
 * Upstream renders its copy from templates and from ~640 modules with no
 * message catalog between them, so this fork translates the result instead of
 * the source: walk the tree, swap the strings the table knows, and keep
 * watching, because most of this interface is painted after load and repainted
 * continuously from live feeds.
 *
 * Two properties make that safe to run over a live globe:
 *
 * - **Only table entries move.** `translate()` returns null for anything it has
 *   not been taught, so callsigns, place names, station names and numeric
 *   readouts flow through untouched.
 * - **The application always wins.** Every node remembers the English it came
 *   from and the exact text this module last wrote. When a repaint puts
 *   something else there, that new value becomes the source of truth rather
 *   than being treated as a stale translation — so switching back to English
 *   never restores a value the feed has since moved past.
 */

import {
  TRANSLATABLE_ATTRIBUTES,
  isTranslatableElement,
  translate,
} from './translation.js';

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

/**
 * Create a localizer bound to a subtree.
 *
 * @param {object} options Localizer options.
 * @param {object} options.root Element to translate, usually `document.body`.
 * @param {Function} [options.createObserver] MutationObserver factory; omit to
 *   use the global one, or pass a stub in tests.
 * @returns {{setStrings: Function, refresh: Function, stop: Function}} Control.
 */
export function createDomLocalizer({ root, createObserver } = {}) {
  if (!root) throw new TypeError('A root element is required');
  const observerFactory =
    createObserver ||
    (typeof MutationObserver === 'function'
      ? (callback) => new MutationObserver(callback)
      : null);
  // Per-node bookkeeping: `source` is the English this node came from,
  // `applied` is what this module last wrote there.
  const textRecords = new WeakMap();
  const attributeRecords = new WeakMap();
  let strings = null;
  let observer = null;

  /** Decide the English a node currently stands for. */
  const sourceOf = (record, current) =>
    record && record.applied === current ? record.source : current;

  /** What `current` should read as under the active table. */
  const targetOf = (source) =>
    (strings && translate(source, strings)) || source;

  function paintText(node) {
    const current = node.nodeValue;
    if (typeof current !== 'string' || !current.trim()) return;
    const source = sourceOf(textRecords.get(node), current);
    const target = targetOf(source);
    if (current !== target) node.nodeValue = target;
    textRecords.set(node, { source, applied: target });
  }

  function paintAttribute(element, attribute) {
    if (typeof element.getAttribute !== 'function') return;
    const current = element.getAttribute(attribute);
    if (typeof current !== 'string' || !current.trim()) return;
    let records = attributeRecords.get(element);
    if (!records) attributeRecords.set(element, (records = new Map()));
    const source = sourceOf(records.get(attribute), current);
    const target = targetOf(source);
    if (current !== target) element.setAttribute(attribute, target);
    records.set(attribute, { source, applied: target });
  }

  function paint(node) {
    if (!node) return;
    if (node.nodeType === TEXT_NODE) {
      paintText(node);
      return;
    }
    if (node.nodeType !== ELEMENT_NODE) return;
    if (!isTranslatableElement(node)) return;
    for (const attribute of TRANSLATABLE_ATTRIBUTES)
      paintAttribute(node, attribute);
    for (const child of [...(node.childNodes || [])]) paint(child);
  }

  function handle(records) {
    for (const record of records) {
      if (record.type === 'attributes') {
        if (isTranslatableElement(record.target))
          paintAttribute(record.target, record.attributeName);
      } else if (record.type === 'characterData') {
        paintText(record.target);
      } else {
        for (const node of record.addedNodes || []) paint(node);
      }
    }
  }

  /** Repaint everything, then drop the records our own writes just queued. */
  function refresh() {
    paint(root);
    if (observer && typeof observer.takeRecords === 'function')
      observer.takeRecords();
  }

  function start() {
    if (observer || !observerFactory) return;
    observer = observerFactory((records) => {
      handle(records);
      if (typeof observer.takeRecords === 'function') observer.takeRecords();
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });
  }

  /** Stop watching. Rendered text is left exactly as it stands. */
  function stop() {
    observer?.disconnect();
    observer = null;
  }

  return {
    /**
     * Switch the active table; `null` restores the English the app wrote.
     *
     * Watching only runs while a translation is active: in English the
     * rendered copy is already what every renderer produces.
     *
     * @param {object|null} next Translation table.
     */
    setStrings(next) {
      strings = next || null;
      refresh();
      if (strings) start();
      else stop();
    },
    refresh,
    stop,
  };
}
