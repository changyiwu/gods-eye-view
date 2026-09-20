import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  freewayTwCameraLabel,
  freewayTwCctvToSource,
  parseFreewayTwCctvXml,
} from '../../server/providers/cctv/sources.js';
import {
  fetchMjpegSnapshot,
  readMjpegPartBounds,
  trimMjpegPartPadding,
} from '../../server/providers/cctv/media.js';
import { FREEWAY_TW_STREAM_DOMAIN } from '../../server/providers/cctv/constants.js';

/** One `<CCTV>` element, verbatim in the shape TISVCloud publishes. */
const CATALOGUE = `<?xml version="1.0" encoding="UTF-8"?>
<CCTVList xmlns="http://traffic.transportdata.tw/standard/traffic/schema/">
\t<CCTVs>
\t\t<CCTV>
\t\t\t<CCTVID>CCTV-N1-S-0.000-M</CCTVID>
\t\t\t<SubAuthorityCode>NFB-NR</SubAuthorityCode>
\t\t\t<VideoStreamURL>https://cctvn.freeway.gov.tw/abs2mjpg/bmjpg?camera=10000</VideoStreamURL>
\t\t\t<PositionLon>121.735695</PositionLon>
\t\t\t<PositionLat>25.1229931</PositionLat>
\t\t\t<RoadName>國道1號</RoadName>
\t\t\t<RoadDirection>S</RoadDirection>
\t\t\t<RoadSection>
\t\t\t\t<Start>基隆端</Start>
\t\t\t\t<End>基隆交流道</End>
\t\t\t</RoadSection>
\t\t\t<LocationMile>0K+000</LocationMile>
\t\t</CCTV>
\t</CCTVs>
</CCTVList>`;

const record = (overrides = {}) => ({
  cctvId: 'CCTV-N1-S-0.000-M',
  streamUrl: 'https://cctvn.freeway.gov.tw/abs2mjpg/bmjpg?camera=10000',
  lat: 25.1229931,
  lon: 121.735695,
  roadName: '國道1號',
  roadDirection: 'S',
  locationMile: '0K+000',
  sectionStart: '基隆端',
  sectionEnd: '基隆交流道',
  ...overrides,
});

test('the MOTC20 catalogue parses every field, not just the one-character ones', () => {
  const [parsed, ...rest] = parseFreewayTwCctvXml(CATALOGUE);
  assert.equal(rest.length, 0);
  // Each of these is a regression guard: an earlier newline class that
  // collapsed to [sS] matched RoadDirection ("S") and nothing else, so the
  // catalogue parsed 1,871 rows that were empty apart from the direction.
  assert.equal(parsed.cctvId, 'CCTV-N1-S-0.000-M');
  assert.equal(
    parsed.streamUrl,
    'https://cctvn.freeway.gov.tw/abs2mjpg/bmjpg?camera=10000',
  );
  assert.equal(parsed.lat, 25.1229931);
  assert.equal(parsed.lon, 121.735695);
  assert.equal(parsed.roadName, '國道1號');
  assert.equal(parsed.roadDirection, 'S');
  assert.equal(parsed.locationMile, '0K+000');
  assert.equal(parsed.sectionStart, '基隆端');
  assert.equal(parsed.sectionEnd, '基隆交流道');
});

test('a catalogue that is empty, truncated or not XML parses to nothing', () => {
  assert.deepEqual(parseFreewayTwCctvXml(''), []);
  assert.deepEqual(parseFreewayTwCctvXml('<CCTVList><CCTV>'), []);
  assert.deepEqual(parseFreewayTwCctvXml(undefined), []);
});

test('the label names the road, the milepost and the interchange span', () => {
  assert.equal(
    freewayTwCameraLabel(record()),
    '國道1號 0K+000（基隆端－基隆交流道）',
  );
  assert.equal(
    freewayTwCameraLabel({ roadName: '國道3號', locationMile: '12K+500' }),
    '國道3號 12K+500',
  );
  assert.equal(freewayTwCameraLabel({ sectionStart: '台北端' }), '台北端');
  assert.equal(freewayTwCameraLabel({}), '');
  assert.equal(freewayTwCameraLabel(), '');
});

test('a catalogue row becomes an MJPEG source with a carriageway heading', () => {
  const source = freewayTwCctvToSource(record());
  assert.equal(source.id, 'tw-freeway-CCTV-N1-S-0.000-M');
  assert.equal(source.name, '國道1號 0K+000（基隆端－基隆交流道）');
  assert.equal(source.cityId, 'taiwan-freeway');
  assert.equal(source.provider, '交通部高速公路局');
  assert.equal(source.lat, 25.1229931);
  assert.equal(source.lon, 121.735695);
  assert.equal(source.headingDeg, 180, 'southbound carriageway');
  // The heading is inferred from the road, never measured, so the operator is
  // told it is a guess and can drag the calibration gizmo.
  assert.equal(source.headingConfidence, 'low');
  assert.equal(source.feedType, 'mjpeg');
  assert.equal(source.sourceKind, 'freeway-tw-motc');
  assert.match(source.license, /政府資料開放授權條款/);
});

test('each cardinal direction maps to its compass heading', () => {
  const heading = (roadDirection) =>
    freewayTwCctvToSource(record({ roadDirection })).headingDeg;
  assert.equal(heading('N'), 0);
  assert.equal(heading('E'), 90);
  assert.equal(heading('S'), 180);
  assert.equal(heading('W'), 270);
  assert.equal(heading('w'), 270);
  // An unknown code still yields a stable heading rather than NaN.
  assert.ok(Number.isFinite(heading('X')));
  assert.ok(Number.isFinite(heading('')));
});

test('rows are dropped unless the stream host is inside the bureau domain', () => {
  // Registration is what authorises the frame proxy to fetch a URL at all, so
  // the catalogue's one stray non-bureau row must not be registered.
  assert.equal(
    freewayTwCctvToSource(
      record({ streamUrl: 'https://cctv-ss02.thb.gov.tw:443/T1' }),
    ),
    null,
  );
  assert.equal(
    freewayTwCctvToSource(
      record({ streamUrl: 'https://evil.example/abs2mjpg/bmjpg?camera=1' }),
    ),
    null,
  );
  // A look-alike host that merely ends in the domain text, without the dot.
  assert.equal(
    freewayTwCctvToSource(
      record({ streamUrl: `https://notfreeway.gov.tw.evil.example/x` }),
    ),
    null,
  );
  assert.equal(
    freewayTwCctvToSource(
      record({ streamUrl: 'http://cctvn.freeway.gov.tw/x' }),
    ),
    null,
    'plaintext is refused',
  );
  assert.equal(freewayTwCctvToSource(record({ streamUrl: '' })), null);
  // Every regional host the bureau actually publishes is accepted.
  for (const host of ['cctvn', 'cctvc', 'cctvs', 'cctvn5']) {
    const source = freewayTwCctvToSource(
      record({ streamUrl: `https://${host}.${FREEWAY_TW_STREAM_DOMAIN}/a` }),
    );
    assert.ok(source, host);
  }
});

test('rows outside Taiwan proper, or without an id, are dropped', () => {
  assert.equal(
    freewayTwCctvToSource(record({ lat: 34.05, lon: -118.24 })),
    null,
  );
  assert.equal(freewayTwCctvToSource(record({ lat: NaN })), null);
  assert.equal(freewayTwCctvToSource(record({ lon: undefined })), null);
  // Kinmen: real Taiwanese territory, but no freeway — a row there is a bad
  // coordinate rather than an outlying camera.
  assert.equal(
    freewayTwCctvToSource(record({ lat: 24.43, lon: 118.32 })),
    null,
  );
  assert.equal(freewayTwCctvToSource(record({ cctvId: '' })), null);
  assert.equal(freewayTwCctvToSource(), null);
});

/** Build a multipart body in the exact shape the cameras emit. */
function mjpegBody(jpeg, { declaredExtra = 2, trailer = '\r\n' } = {}) {
  const header = Buffer.from(
    `--myboundary\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length + declaredExtra}\r\n\r\n`,
    'latin1',
  );
  return Buffer.concat([header, jpeg, Buffer.from(trailer, 'latin1')]);
}

const JPEG = Buffer.concat([
  Buffer.from([0xff, 0xd8]),
  Buffer.alloc(64, 0x41),
  Buffer.from([0xff, 0xd9]),
]);

test('a part header yields its payload bounds only when it is complete', () => {
  const body = mjpegBody(JPEG);
  const bounds = readMjpegPartBounds(body);
  assert.equal(bounds.length, JPEG.length + 2);
  assert.equal(
    body.subarray(bounds.start, bounds.start + 2).toString('hex'),
    'ffd8',
  );
  assert.equal(
    readMjpegPartBounds(Buffer.from('--myboundary\r\nContent')),
    null,
  );
  assert.equal(
    readMjpegPartBounds(Buffer.from('--b\r\nContent-Type: text/html\r\n\r\n')),
    null,
    'only JPEG parts are read',
  );
  assert.equal(
    readMjpegPartBounds(Buffer.from('--b\r\nContent-Type: image/jpeg\r\n\r\n')),
    null,
    'a part with no declared length is refused',
  );
});

test('padding counted inside the declared length is trimmed', () => {
  assert.equal(trimMjpegPartPadding(Buffer.from('abc\r\n')).toString(), 'abc');
  assert.equal(trimMjpegPartPadding(Buffer.from('abc')).toString(), 'abc');
  assert.equal(trimMjpegPartPadding(Buffer.alloc(0)).length, 0);
});

test('one frame is read off a live stream and the connection is dropped', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, redirect: init.redirect });
    return new Response(mjpegBody(JPEG), {
      status: 200,
      headers: {
        'content-type': 'multipart/x-mixed-replace;boundary=--myboundary',
      },
    });
  };
  const frame = await fetchMjpegSnapshot(
    'https://cctvn.freeway.gov.tw/abs2mjpg/bmjpg?camera=10000',
    { fetchImpl },
  );
  assert.equal(frame.ok, true);
  assert.equal(frame.contentType, 'image/jpeg');
  assert.deepEqual(frame.body, JPEG, 'the declared CRLF padding is gone');
  assert.equal(calls.length, 1);
});

test('a still image, a refused URL, or a headerless stream yields no frame', async () => {
  const respond =
    (body, contentType, status = 200) =>
    async () =>
      new Response(body, { status, headers: { 'content-type': contentType } });

  assert.equal(
    await fetchMjpegSnapshot('https://cctvn.freeway.gov.tw/a', {
      fetchImpl: respond(JPEG, 'image/jpeg'),
    }),
    null,
    'a plain image belongs to the image path, not this one',
  );
  assert.equal(
    await fetchMjpegSnapshot('https://cctvn.freeway.gov.tw/a', {
      fetchImpl: respond('nope', 'multipart/x-mixed-replace', 503),
    }),
    null,
  );
  // A body that never produces a usable part header must not be read forever.
  assert.equal(
    await fetchMjpegSnapshot('https://cctvn.freeway.gov.tw/a', {
      fetchImpl: respond(
        Buffer.alloc(64 * 1024, 0x41),
        'multipart/x-mixed-replace',
      ),
    }),
    null,
  );
  assert.equal(await fetchMjpegSnapshot(''), null);
  assert.equal(await fetchMjpegSnapshot('ftp://cctvn.freeway.gov.tw/a'), null);
});

test('a frame larger than the cap is refused before it is buffered', async () => {
  const fetchImpl = async () =>
    new Response(mjpegBody(JPEG), {
      status: 200,
      headers: {
        'content-type': 'multipart/x-mixed-replace;boundary=--myboundary',
      },
    });
  assert.equal(
    await fetchMjpegSnapshot('https://cctvn.freeway.gov.tw/a', {
      fetchImpl,
      maxBytes: 8,
    }),
    null,
  );
});
