import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapCodeFor, paddedViewBox, viewBoxString } from '../js/worldmap.js';

test('mapCodeFor passes through most codes unchanged', () => {
  assert.equal(mapCodeFor('fr'), 'fr');
  assert.equal(mapCodeFor('jp'), 'jp');
});

test('mapCodeFor maps UK constituent flags to the whole-UK map region', () => {
  assert.equal(mapCodeFor('gb-eng'), 'gb');
  assert.equal(mapCodeFor('gb-wls'), 'gb');
});

test('paddedViewBox pads proportionally to the country size', () => {
  const box = paddedViewBox({ x: 100, y: 100, width: 20, height: 10 }, 5, 2);
  // pad = max(20, 10, 5) * 2 = 40
  assert.deepEqual(box, { x: 60, y: 60, width: 100, height: 90 });
});

test('paddedViewBox applies a minimum pad so tiny countries still get zoomed context', () => {
  const box = paddedViewBox({ x: 0, y: 0, width: 0.5, height: 0.3 }, 20, 1.5);
  // pad = max(0.5, 0.3, 20) * 1.5 = 30
  assert.deepEqual(box, { x: -30, y: -30, width: 60.5, height: 60.3 });
});

test('viewBoxString formats a box as an SVG viewBox attribute value', () => {
  assert.equal(viewBoxString({ x: -1, y: 2, width: 10, height: 20 }), '-1 2 10 20');
});
