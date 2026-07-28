// The vendored map only has whole-country regions, so the UK's constituent
// flags (used for the England/Wales World Cup teams) fall back to the
// whole-UK region — there's no separate England/Wales shape to highlight.
const MAP_CODE_OVERRIDES = { 'gb-eng': 'gb', 'gb-wls': 'gb' };

export function mapCodeFor(code) {
  return MAP_CODE_OVERRIDES[code] || code;
}

// Zooms the map to a country's bounding box with padding proportional to its
// size, plus a minimum pad so tiny countries (e.g. Vatican City) still show
// enough surrounding context to be legible instead of filling the whole view.
export function paddedViewBox(bbox, minPad = 20, padFactor = 1.5) {
  const pad = Math.max(bbox.width, bbox.height, minPad) * padFactor;
  return {
    x: bbox.x - pad,
    y: bbox.y - pad,
    width: bbox.width + pad * 2,
    height: bbox.height + pad * 2,
  };
}

export function viewBoxString(box) {
  return `${box.x} ${box.y} ${box.width} ${box.height}`;
}
