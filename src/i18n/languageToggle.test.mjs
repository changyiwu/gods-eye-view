import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { expandApplicationHtml } from '../../build/application-html.js';
import { readStylesheet } from '../testSupport/readStylesheet.mjs';
import { LANGUAGES } from './dictionary.js';
import { createLanguageToggle } from './languageToggle.js';
import { LANGUAGE_STORAGE_KEY, startLocalization } from './index.js';

const ROOT = path.join(
  fileURLToPath(new URL('.', import.meta.url)),
  '..',
  '..',
);
const html = expandApplicationHtml(
  fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'),
);

function button() {
  const attributes = new Map();
  const listeners = new Set();
  return {
    nodeType: 1,
    tagName: 'BUTTON',
    className: '',
    textContent: '',
    dataset: {},
    attributes,
    childNodes: [],
    hasAttribute: (name) => attributes.has(name),
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, value),
    addEventListener: (type, handler) =>
      type === 'click' && listeners.add(handler),
    removeEventListener: (type, handler) => listeners.delete(handler),
    click: () => {
      for (const handler of [...listeners]) handler();
    },
    listenerCount: () => listeners.size,
  };
}

test('the toggle is labelled by the language it switches to', () => {
  const element = button();
  const chosen = [];
  const toggle = createLanguageToggle({
    button: element,
    onSelect: (code) => chosen.push(code),
  });

  assert.equal(element.textContent, '中', 'English offers Chinese');
  assert.equal(element.dataset.language, 'en');
  assert.equal(element.getAttribute('lang'), 'zh-TW');
  assert.match(element.getAttribute('title'), /Switch interface language/);

  element.click();
  assert.deepEqual(chosen, ['zh-TW']);

  // The selection handler owns the state change; the toggle repaints on demand.
  toggle.render('zh-TW');
  assert.equal(element.textContent, 'EN', 'Chinese offers English');
  assert.equal(element.dataset.language, 'zh-TW');
  assert.equal(element.getAttribute('title'), '切換介面語言');

  element.click();
  assert.deepEqual(chosen, ['zh-TW', 'en']);

  toggle.dispose();
  assert.equal(element.listenerCount(), 0);
});

test('the toggle refuses to bind without a button or a handler', () => {
  assert.throws(() => createLanguageToggle({ onSelect: () => {} }), TypeError);
  assert.throws(() => createLanguageToggle({ button: button() }), TypeError);
});

/** Document stub over a flat element map; enough for startLocalization. */
function documentStub(elements) {
  const root = {
    nodeType: 1,
    tagName: 'BODY',
    className: '',
    childNodes: Object.values(elements),
    hasAttribute: () => false,
    getAttribute: () => null,
    setAttribute: () => {},
  };
  const lang = new Map();
  return {
    body: root,
    documentElement: {
      setAttribute: (name, value) => lang.set(name, value),
      getAttribute: (name) => lang.get(name) ?? null,
    },
    getElementById: (id) => elements[id] || null,
  };
}

function storageStub(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test('switching language translates the page, sets lang, and is remembered', () => {
  const toggleButton = button();
  const title = { nodeType: 3, nodeValue: 'DATA LAYERS' };
  const panel = {
    nodeType: 1,
    tagName: 'SPAN',
    className: 'panel-title',
    childNodes: [title],
    hasAttribute: () => false,
    getAttribute: () => null,
    setAttribute: () => {},
  };
  const doc = documentStub({ 'language-toggle': toggleButton, panel });
  const storage = storageStub();

  const localization = startLocalization({ document: doc, storage });
  assert.equal(localization.getLanguage(), 'en');
  assert.equal(title.nodeValue, 'DATA LAYERS');

  toggleButton.click();
  assert.equal(localization.getLanguage(), 'zh-TW');
  assert.equal(title.nodeValue, '資料圖層');
  assert.equal(doc.documentElement.getAttribute('lang'), 'zh-TW');
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY), 'zh-TW');

  toggleButton.click();
  assert.equal(title.nodeValue, 'DATA LAYERS');
  assert.equal(storage.getItem(LANGUAGE_STORAGE_KEY), 'en');
  localization.stop();
});

test('a stored language is applied before the first paint, without rewriting it', () => {
  const toggleButton = button();
  const doc = documentStub({ 'language-toggle': toggleButton });
  const storage = storageStub({ [LANGUAGE_STORAGE_KEY]: 'zh-TW' });
  let writes = 0;
  const setItem = storage.setItem;
  storage.setItem = (key, value) => {
    writes += 1;
    setItem(key, value);
  };

  const localization = startLocalization({ document: doc, storage });
  assert.equal(localization.getLanguage(), 'zh-TW');
  assert.equal(writes, 0, 'restoring a preference is not a new choice');
  localization.stop();
});

test('an unknown or unreadable preference falls back to English', () => {
  const toggleButton = button();
  const doc = documentStub({ 'language-toggle': toggleButton });
  const hostile = {
    getItem: () => {
      throw new Error('storage is blocked');
    },
    setItem: () => {
      throw new Error('storage is blocked');
    },
  };
  assert.equal(
    startLocalization({ document: doc, storage: hostile }).getLanguage(),
    'en',
  );
  assert.equal(
    startLocalization({
      document: documentStub({ 'language-toggle': button() }),
      storage: storageStub({ [LANGUAGE_STORAGE_KEY]: 'de' }),
    }).getLanguage(),
    'en',
  );
});

test('an embedding without the toggle button boots untranslated', () => {
  assert.equal(
    startLocalization({ document: documentStub({}), storage: storageStub() }),
    null,
  );
});

test('the toggle ships in the top-center globe actions', () => {
  const actions = html.match(/<nav id="top-center-actions"[\s\S]*?<\/nav>/);
  assert.ok(actions, 'Top-center globe actions are missing');
  assert.match(
    actions[0],
    /id="reset-globe-view"[\s\S]*?id="language-toggle"/,
    'the language toggle follows the existing globe actions',
  );
  assert.equal(
    (html.match(/id="language-toggle"/g) || []).length,
    1,
    'the language toggle must have one DOM owner',
  );
  assert.match(
    actions[0],
    /id="language-toggle"[^>]*data-gev-no-translate/,
    'the toggle labels itself and must stay out of the translation pass',
  );
  // A Material Symbols ligature would render as its own name: index.html only
  // subsets the glyphs the sources already use.
  assert.doesNotMatch(
    actions[0].match(/<button id="language-toggle"[\s\S]*?<\/button>/)[0],
    /material-symbols-outlined/,
  );
});

test('the toggle is styled and the entry point starts localization', () => {
  const css = readStylesheet(path.join(ROOT, 'style.css'));
  assert.match(
    css,
    /#language-toggle \{[\s\S]*?font-family: var\(--font-mono\)/,
  );
  assert.match(css, /#language-toggle\[data-language='zh-TW'\]/);
  const main = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8');
  assert.match(main, /startLocalization\(\)/);
  assert.match(
    main,
    /startLocalization\(\)[\s\S]*createStandaloneApplication/,
    'localization starts before the application boots',
  );
});

test('every shipped language has a label the toggle can render', () => {
  for (const language of LANGUAGES) {
    assert.ok(language.code, 'a language needs a code');
    assert.ok(language.label.trim(), `${language.code} needs a button label`);
    assert.ok(language.name.trim(), `${language.code} needs a name`);
  }
});
