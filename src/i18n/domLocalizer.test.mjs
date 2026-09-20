import assert from 'node:assert/strict';
import test from 'node:test';
import { createDomLocalizer } from './domLocalizer.js';

const STRINGS = Object.freeze({
  'DATA LAYERS': '資料圖層',
  CONTEXT: '脈絡',
  'Collapse panel': '收合面板',
  ON: '開啟',
});

/** Minimal element/text nodes: the repository has no DOM test harness. */
function text(value) {
  return { nodeType: 3, nodeValue: value };
}

function el(tagName, { className = '', attributes = {}, children = [] } = {}) {
  const attrs = new Map(Object.entries(attributes));
  return {
    nodeType: 1,
    tagName,
    className,
    childNodes: children,
    hasAttribute: (name) => attrs.has(name),
    getAttribute: (name) => attrs.get(name) ?? null,
    setAttribute: (name, value) => attrs.set(name, value),
  };
}

function tree() {
  const title = text('\n  DATA LAYERS\n');
  const callsign = text('UAL2402');
  const icon = text('layers_clear');
  const collapse = el('BUTTON', {
    attributes: { title: 'Collapse panel' },
    children: [text('+')],
  });
  const iconSpan = el('SPAN', {
    className: 'material-symbols-outlined',
    children: [icon],
  });
  const root = el('BODY', {
    children: [
      el('SPAN', { className: 'panel-title', children: [title] }),
      el('SPAN', { className: 'contact-callsign', children: [callsign] }),
      iconSpan,
      collapse,
    ],
  });
  return { root, title, callsign, icon, collapse };
}

test('table entries translate and everything else is left alone', () => {
  const { root, title, callsign, icon, collapse } = tree();
  const localizer = createDomLocalizer({ root });

  localizer.setStrings(STRINGS);
  assert.equal(title.nodeValue, '\n  資料圖層\n', 'indentation is preserved');
  assert.equal(callsign.nodeValue, 'UAL2402', 'live data is untouched');
  assert.equal(icon.nodeValue, 'layers_clear', 'icon ligature is untouched');
  assert.equal(collapse.getAttribute('title'), '收合面板');
});

test('switching back restores the English the application wrote', () => {
  const { root, title, collapse } = tree();
  const localizer = createDomLocalizer({ root });

  localizer.setStrings(STRINGS);
  localizer.setStrings(null);
  assert.equal(title.nodeValue, '\n  DATA LAYERS\n');
  assert.equal(collapse.getAttribute('title'), 'Collapse panel');
});

test('a repaint by the application wins over the translation in place', () => {
  const { root, title } = tree();
  const localizer = createDomLocalizer({ root });
  localizer.setStrings(STRINGS);

  // The feed repaints this node with different English while Chinese is on.
  title.nodeValue = 'CONTEXT';
  localizer.refresh();
  assert.equal(title.nodeValue, '脈絡');

  // Going back to English restores the NEW value, not the one it started with.
  localizer.setStrings(null);
  assert.equal(title.nodeValue, 'CONTEXT');
});

test('repeated passes are stable', () => {
  const { root, title } = tree();
  const localizer = createDomLocalizer({ root });
  localizer.setStrings(STRINGS);
  localizer.refresh();
  localizer.refresh();
  assert.equal(title.nodeValue, '\n  資料圖層\n');
});

test('nodes added after the switch are translated through the observer', () => {
  const { root } = tree();
  const observers = [];
  const localizer = createDomLocalizer({
    root,
    createObserver: (callback) => {
      const observer = {
        callback,
        observed: null,
        observe: (target, options) => {
          observer.observed = { target, options };
        },
        disconnect: () => {
          observer.observed = null;
        },
        takeRecords: () => [],
      };
      observers.push(observer);
      return observer;
    },
  });

  localizer.setStrings(STRINGS);
  const [observer] = observers;
  assert.ok(observer.observed, 'the localizer watches the root');
  assert.equal(observer.observed.target, root);
  assert.equal(observer.observed.options.subtree, true);

  const added = text('CONTEXT');
  observer.callback([
    { type: 'childList', addedNodes: [el('DIV', { children: [added] })] },
  ]);
  assert.equal(added.nodeValue, '脈絡');
});

test('observed attribute and text changes repaint just that node', () => {
  const { root, collapse } = tree();
  const observers = [];
  const localizer = createDomLocalizer({
    root,
    createObserver: (callback) => {
      const observer = {
        callback,
        observe: () => {},
        disconnect: () => {},
        takeRecords: () => [],
      };
      observers.push(observer);
      return observer;
    },
  });
  localizer.setStrings(STRINGS);
  const [observer] = observers;

  collapse.setAttribute('title', 'Collapse panel');
  observer.callback([
    { type: 'attributes', target: collapse, attributeName: 'title' },
  ]);
  assert.equal(collapse.getAttribute('title'), '收合面板');

  const status = text('ON');
  observer.callback([{ type: 'characterData', target: status }]);
  assert.equal(status.nodeValue, '開啟');
});

test('watching stops when the interface returns to English', () => {
  const { root } = tree();
  let connected = 0;
  const localizer = createDomLocalizer({
    root,
    createObserver: () => ({
      observe: () => {
        connected += 1;
      },
      disconnect: () => {
        connected -= 1;
      },
      takeRecords: () => [],
    }),
  });

  localizer.setStrings(STRINGS);
  assert.equal(connected, 1);
  localizer.setStrings(null);
  assert.equal(connected, 0);
});

test('a root is required', () => {
  assert.throws(() => createDomLocalizer({}), TypeError);
});
