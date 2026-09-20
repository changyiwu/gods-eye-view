import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_LANGUAGE, LANGUAGES, ZH_TW } from './dictionary.js';
import {
  isTranslatableElement,
  nextLanguage,
  resolveLanguage,
  translate,
  translationKey,
} from './translation.js';

function element(overrides = {}) {
  const attributes = new Map(Object.entries(overrides.attributes || {}));
  return {
    nodeType: 1,
    tagName: overrides.tagName || 'DIV',
    className: overrides.className || '',
    hasAttribute: (name) => attributes.has(name),
    getAttribute: (name) => attributes.get(name) ?? null,
  };
}

test('template whitespace collapses into one lookup key', () => {
  assert.equal(translationKey('  DATA\n  LAYERS  '), 'DATA LAYERS');
  assert.equal(translationKey('CONTEXT'), 'CONTEXT');
});

test('only table entries translate; live data passes through', () => {
  assert.equal(translate('DATA LAYERS', ZH_TW), '資料圖層');
  // A callsign, a place name and a readout are not in the table.
  assert.equal(translate('UAL2402', ZH_TW), null);
  assert.equal(translate('Taoyuan', ZH_TW), null);
  assert.equal(translate('37,000 FT', ZH_TW), null);
});

test('surrounding whitespace survives translation', () => {
  assert.equal(translate('\n    CONTEXT\n  ', ZH_TW), '\n    脈絡\n  ');
});

test('an entry translating to itself reports no translation', () => {
  assert.equal(translate('CCTV', { CCTV: 'CCTV' }), null);
});

test('empty and non-string input is refused', () => {
  assert.equal(translate('   ', ZH_TW), null);
  assert.equal(translate(undefined, ZH_TW), null);
  assert.equal(translate('CONTEXT', null), null);
});

test('inherited object properties are not treated as translations', () => {
  assert.equal(translate('toString', ZH_TW), null);
  assert.equal(translate('constructor', ZH_TW), null);
});

test('icon-font ligature spans are never translated', () => {
  // Their text content is a ligature name; replacing it renders the literal
  // replacement text instead of an icon.
  assert.equal(
    isTranslatableElement(
      element({
        tagName: 'SPAN',
        className: 'pp-icon material-symbols-outlined',
      }),
    ),
    false,
  );
  assert.equal(
    isTranslatableElement(element({ tagName: 'SPAN', className: 'pp-label' })),
    true,
  );
});

test('script, style, canvas and editable surfaces are opaque', () => {
  for (const tagName of ['SCRIPT', 'STYLE', 'CANVAS', 'TEXTAREA'])
    assert.equal(isTranslatableElement(element({ tagName })), false, tagName);
  assert.equal(
    isTranslatableElement(element({ attributes: { contenteditable: 'true' } })),
    false,
  );
  assert.equal(
    isTranslatableElement(
      element({ attributes: { 'data-gev-no-translate': '' } }),
    ),
    false,
  );
  assert.equal(isTranslatableElement(null), false);
  assert.equal(isTranslatableElement({ nodeType: 3 }), false);
});

test('the toggle cycles the shipped languages and rejects unknown codes', () => {
  assert.equal(nextLanguage('en', LANGUAGES), 'zh-TW');
  assert.equal(nextLanguage('zh-TW', LANGUAGES), 'en');
  assert.equal(resolveLanguage('zh-TW', LANGUAGES, DEFAULT_LANGUAGE), 'zh-TW');
  assert.equal(resolveLanguage('de', LANGUAGES, DEFAULT_LANGUAGE), 'en');
  assert.equal(resolveLanguage(null, LANGUAGES, DEFAULT_LANGUAGE), 'en');
});

test('English ships untranslated and Traditional Chinese carries the table', () => {
  const [english, chinese] = LANGUAGES;
  assert.equal(english.code, DEFAULT_LANGUAGE);
  assert.equal(english.strings, null);
  assert.equal(chinese.strings, ZH_TW);
});

test('every table entry is a non-empty string that actually changes', () => {
  for (const [key, value] of Object.entries(ZH_TW)) {
    assert.equal(typeof value, 'string', key);
    assert.ok(value.trim(), `${key} has an empty translation`);
    assert.notEqual(value, key, `${key} translates to itself`);
    assert.equal(key, key.trim(), `${key} is not a collapsed key`);
    assert.equal(translationKey(key), key, `${key} is not a collapsed key`);
  }
});

test('composite readouts translate segment by segment, live values untouched', () => {
  // The DOM holds each of these as ONE text node, so whole-string lookup can
  // never match: the provider name and the timing are live.
  assert.equal(translate('CelesTrak · never', ZH_TW), 'CelesTrak · 從未');
  assert.equal(
    translate('NASA FIRMS · LIVE · never', ZH_TW),
    'NASA FIRMS · 即時 · 從未',
  );
  assert.equal(
    translate('OpenStreetMap · community mapped · never', ZH_TW),
    'OpenStreetMap · 社群標記 · 從未',
  );
  assert.equal(
    translate('NORMAL · OFF · 4.0s + 0.9s', ZH_TW),
    '一般 · 關閉 · 4.0s + 0.9s',
  );
});

test('a line with nothing the table knows is left alone', () => {
  assert.equal(translate('CCTV-N1-S · 25.12N 121.73E', ZH_TW), null);
  assert.equal(translate('UAL2402 · FL370 · 480kt', ZH_TW), null);
});

test('a whole-string match wins over splitting it into segments', () => {
  // This one contains the separator AND has a full translation; taking it
  // apart would translate "tap Space to activate focused controls" as a
  // segment it has never been taught and leave half the sentence English.
  assert.equal(
    translate(
      'Hold Space to speak · tap Space to activate focused controls',
      ZH_TW,
    ),
    '按住空白鍵說話 · 輕點空白鍵啟動聚焦中的控制項',
  );
});

test('segment translation keeps a live value byte for byte', () => {
  const strings = { ON: '開啟' };
  // An untranslated segment is passed through exactly as rendered — its own
  // spacing included — because it may be a value the reader is reading off.
  assert.equal(translate('ON · CAM  7', strings), '開啟 · CAM  7');
  assert.equal(translate('ON ·  CAM  7 ', strings), '開啟 ·  CAM  7 ');
  // Leading and trailing whitespace around the whole line still survives.
  assert.equal(translate('\n  ON · CAM 7\n', strings), '\n  開啟 · CAM 7\n');
});

test('provider attribution is never translated', () => {
  // Credit text is a licence condition reproduced verbatim, not interface copy.
  for (const className of [
    'cesium-credit-lightbox',
    'cesium-credit-wrapper',
    'cesium-credit-lightbox-title',
    'cesium-widget-credits',
  ])
    assert.equal(
      isTranslatableElement(element({ className })),
      false,
      className,
    );
  // A class that merely starts with "cesium" is still ordinary interface copy.
  assert.equal(
    isTranslatableElement(element({ className: 'cesium-viewer-toolbar' })),
    true,
  );
});

test('split-flap chip labels are left to their own component', () => {
  // splitFlap.js identifies its labels by comparing textContent with what it
  // set; a rewritten node strands the flap cells and replays every cascade.
  assert.equal(
    isTranslatableElement(element({ className: 'gev-flap-text' })),
    false,
  );
});
