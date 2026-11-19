// Vice Cover Studio — the cover renderer. Draws a multi-panel GTA-poster-style cover
// onto a 2D canvas: panel layouts, gradient-map colour grades, big Anton lettering
// with a sunset gradient and halftone title block, a Pacifico neon subtitle, grain
// and a vignette. Everything is drawn from the photos the user loaded; no asset is
// fetched from the network and no Rockstar Games artwork, logo or font is used.

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: 'Square · 1080 × 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait · 1080 × 1350' },
  '1920x1080': { w: 1920, h: 1080, label: 'Landscape · 1920 × 1080' },
};

// Gradient-map grades: each stop is [position 0..1, r, g, b]. A photo pixel is
// remapped by its luminance through the gradient, then blended back with the
// original so faces stay recognisable under the Vice City colour grade.
export const GRADES = [
  {
    id: 'sunset', name: 'Vice Sunset', accent: '#ff5e62',
    stops: [[0, 26, 8, 46], [0.25, 90, 24, 90], [0.5, 214, 48, 120], [0.75, 255, 122, 80], [1, 255, 214, 90]],
  },
  {
    id: 'neon', name: 'Neon Night', accent: '#ff7ad9',
    stops: [[0, 4, 12, 34], [0.3, 16, 60, 110], [0.55, 120, 40, 150], [0.8, 255, 80, 170], [1, 120, 240, 255]],
  },
  {
    id: 'golden', name: 'Golden Hour', accent: '#ffb347',
    stops: [[0, 30, 16, 8], [0.3, 110, 58, 26], [0.55, 216, 110, 40], [0.8, 255, 176, 80], [1, 255, 236, 170]],
  },
  {
    id: 'miami', name: 'Miami Teal', accent: '#3ae0c8',
    stops: [[0, 6, 20, 34], [0.3, 12, 90, 110], [0.55, 40, 160, 170], [0.8, 150, 220, 200], [1, 255, 240, 190]],
  },
  {
    id: 'hotpink', name: 'Hot Pink', accent: '#ff2e88',
    stops: [[0, 24, 4, 40], [0.3, 96, 12, 96], [0.55, 200, 30, 130], [0.8, 255, 90, 160], [1, 255, 200, 220]],
  },
];

// Layouts: panel rectangles in normalised cover coordinates (x, y, w, h, rotation
// in degrees). The title block always sits in a band along the foot of the cover.
export const LAYOUTS = [
  {
    id: 'hero3', name: 'Hero + Three',
    panels: [
      { x: 0.02, y: 0.02, w: 0.60, h: 0.74, rot: 0 },
      { x: 0.64, y: 0.02, w: 0.34, h: 0.233, rot: 0 },
      { x: 0.64, y: 0.27, w: 0.34, h: 0.233, rot: 0 },
      { x: 0.64, y: 0.52, w: 0.34, h: 0.24, rot: 0 },
    ],
  },
  {
    id: 'grid4', name: 'Four-Panel Grid',
    panels: [
      { x: 0.02, y: 0.02, w: 0.48, h: 0.36, rot: 0 },
      { x: 0.50, y: 0.02, w: 0.48, h: 0.36, rot: 0 },
      { x: 0.02, y: 0.40, w: 0.48, h: 0.36, rot: 0 },
      { x: 0.50, y: 0.40, w: 0.48, h: 0.36, rot: 0 },
    ],
  },
  {
    id: 'grid9', name: 'Nine-Panel Grid',
    panels: [
      { x: 0.02, y: 0.02, w: 0.313, h: 0.24, rot: 0 },
      { x: 0.343, y: 0.02, w: 0.313, h: 0.24, rot: 0 },
      { x: 0.667, y: 0.02, w: 0.313, h: 0.24, rot: 0 },
      { x: 0.02, y: 0.277, w: 0.313, h: 0.24, rot: 0 },
      { x: 0.343, y: 0.277, w: 0.313, h: 0.24, rot: 0 },
      { x: 0.667, y: 0.277, w: 0.313, h: 0.24, rot: 0 },
      { x: 0.02, y: 0.534, w: 0.313, h: 0.226, rot: 0 },
      { x: 0.343, y: 0.534, w: 0.313, h: 0.226, rot: 0 },
      { x: 0.667, y: 0.534, w: 0.313, h: 0.226, rot: 0 },
    ],
  },
  {
    id: 'fullbleed', name: 'Full Bleed',
    panels: [{ x: 0, y: 0, w: 1, h: 0.78, rot: 0 }],
  },
  {
    id: 'strip', name: 'Tilted Snapshots',
    panels: [
      { x: 0.05, y: 0.06, w: 0.30, h: 0.52, rot: -6 },
      { x: 0.35, y: 0.10, w: 0.30, h: 0.52, rot: 2 },
      { x: 0.65, y: 0.05, w: 0.30, h: 0.52, rot: 6 },
    ],
  },
  {
    id: 'trio', name: 'Triple Band',
    panels: [
      { x: 0.02, y: 0.02, w: 0.96, h: 0.30, rot: 0 },
      { x: 0.02, y: 0.335, w: 0.47, h: 0.21, rot: 0 },
      { x: 0.51, y: 0.335, w: 0.47, h: 0.21, rot: 0 },
      { x: 0.02, y: 0.56, w: 0.96, h: 0.20, rot: 0 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) ?? GRADES[0];
}

/** Builds a 256-entry RGB lookup table from a grade's gradient stops. */
export function gradientLUT(grade) {
  const lut = new Uint8Array(256 * 3);
  const stops = grade.stops;
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) { a = stops[s]; b = stops[s + 1]; break; }
    }
    const span = b[0] - a[0] || 1;
    const f = Math.min(1, Math.max(0, (t - a[0]) / span));
    for (let c = 0; c < 3; c++) lut[i * 3 + c] = Math.round(a[1 + c] + (b[1 + c] - a[1 + c]) * f);
  }
  return lut;
}

/** Remaps image pixels through the gradient LUT, blended with the original. */
export function applyGrade(imageData, lut, strength = 0.78) {
  const d = imageData.data;
  const keep = 1 - strength;
  for (let i = 0; i < d.length; i += 4) {
    const lum = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    const o = lum * 3;
    d[i] = d[i] * keep + lut[o] * strength;
    d[i + 1] = d[i + 1] * keep + lut[o + 1] * strength;
    d[i + 2] = d[i + 2] * keep + lut[o + 2] * strength;
  }
  return imageData;
}

// Deterministic film grain: a small seeded noise tile, generated once.
let grainTile = null;
function mulberry32(seed) {
  return function random() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function getGrainTile() {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 160; tile.height = 160;
  const ctx = tile.getContext('2d');
  const img = ctx.createImageData(160, 160);
  const rand = mulberry32(1337);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rand() * 255);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTile = tile;
  return tile;
}

/** Cover-fit draw of `img` into rect (x, y, w, h) with pan (ox, oy in -1..1) and zoom. */
export function drawPhotoCover(ctx, img, x, y, w, h, ox, oy, zoom) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = x + (w - dw) / 2 + (ox * (dw - w)) / 2;
  const dy = y + (h - dh) / 2 + (oy * (dh - h)) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/** Draws the halftone dot band behind the title, in the grade's accent colour. */
export function drawHalftone(ctx, x, y, w, h, colour) {
  const step = Math.max(10, h / 9);
  ctx.save();
  ctx.fillStyle = colour;
  for (let row = 0; row * step < h; row++) {
    for (let col = 0; col * step < w; col++) {
      const cx = x + col * step + (row % 2 ? step / 2 : 0);
      const cy = y + row * step;
      const r = (step * 0.32) * (0.5 + 0.5 * Math.sin((cx / w) * Math.PI));
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Wraps a title to at most two lines that fit `maxWidth`; returns { lines, size }. */
export function wrapTitle(ctx, text, maxWidth, startSize) {
  let size = startSize;
  let lines = [text];
  while (size > 14) {
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    const words = text.split(' ');
    if (words.length < 2) { size -= 2; continue; }
    const first = [];
    const rest = [...words];
    while (rest.length > 1) {
      const trial = [...first, rest[0]].join(' ');
      if (ctx.measureText(trial).width > maxWidth * 0.96) break;
      first.push(rest.shift());
    }
    if (first.length === 0) { size -= 2; continue; }
    lines = [first.join(' '), rest.join(' ')];
    if (ctx.measureText(lines[1]).width <= maxWidth) break;
    size -= 2;
  }
  if (lines.length === 1) {
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    while (size > 14 && ctx.measureText(lines[0]).width > maxWidth) {
      size -= 2;
      ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
    }
  }
  return { lines, size };
}

/**
 * Draws the whole cover. `state` is { title, subtitle, layout, grade, panels } where
 * panels is [{ img, ox, oy, zoom }] aligned with the layout's panel list (extra
 * panels are ignored, missing ones fall back to the first photo). The canvas must
 * already be sized to the export (or preview) size.
 */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  const lut = gradientLUT(grade);

  // Backdrop: deep dusk gradient the panel gutters show through.
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#1a0b2e');
  bg.addColorStop(0.55, '#3d1150');
  bg.addColorStop(1, '#12041f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const photos = state.panels.filter((p) => p && p.img);
  const fallback = photos[0] || null;

  for (let i = 0; i < layout.panels.length; i++) {
    const panel = layout.panels[i];
    const slot = state.panels[i] || fallback;
    if (!slot || !slot.img) continue;
    const px = panel.x * w;
    const py = panel.y * h;
    const pw = panel.w * w;
    const ph = panel.h * h;

    // Grade the photo on a panel-sized offscreen canvas first.
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(2, Math.round(pw));
    tmp.height = Math.max(2, Math.round(ph));
    const tctx = tmp.getContext('2d');
    drawPhotoCover(tctx, slot.img, 0, 0, tmp.width, tmp.height, slot.ox || 0, slot.oy || 0, slot.zoom || 1);
    const graded = tctx.getImageData(0, 0, tmp.width, tmp.height);
    applyGrade(graded, lut, 0.78);
    tctx.putImageData(graded, 0, 0);

    ctx.save();
    if (panel.rot) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate((panel.rot * Math.PI) / 180);
      ctx.translate(-(px + pw / 2), -(py + ph / 2));
    }
    // Snapshot-style white frame for the tilted strip; keyline for the rest.
    if (panel.rot) {
      ctx.fillStyle = '#fdf6ec';
      ctx.fillRect(px - pw * 0.02, py - ph * 0.02, pw * 1.04, ph * 1.07);
      ctx.drawImage(tmp, px, py, pw, ph);
      ctx.fillStyle = '#fdf6ec';
      ctx.fillRect(px - pw * 0.02, py + ph, pw * 1.04, ph * 0.05);
    } else {
      ctx.drawImage(tmp, px, py, pw, ph);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(2, w * 0.002);
    ctx.strokeRect(px, py, pw, ph);
    ctx.restore();
  }

  // Title block: scrim rising from the foot, halftone dots, then the lettering.
  const title = (state.title || '').trim().toUpperCase();
  const subtitle = (state.subtitle || '').trim();
  const bandTop = h * 0.78;
  const scrim = ctx.createLinearGradient(0, bandTop - h * 0.06, 0, h);
  scrim.addColorStop(0, 'rgba(18,4,31,0)');
  scrim.addColorStop(0.45, 'rgba(18,4,31,0.72)');
  scrim.addColorStop(1, 'rgba(18,4,31,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, bandTop - h * 0.06, w, h - bandTop + h * 0.06);
  drawHalftone(ctx, w * 0.03, bandTop + h * 0.005, w * 0.94, h * 0.05, grade.accent);

  if (title) {
    const wrapped = wrapTitle(ctx, title, w * 0.92, h * 0.105);
    const lineH = wrapped.size * 1.02;
    // One line centres on the 87.5% height line; two lines anchor so the last
    // line's bottom edge sits at 94% height, clear of the subtitle at 96.5%.
    const ty = wrapped.lines.length === 1
      ? h * 0.875
      : h * 0.94 - wrapped.size * 0.5 - lineH;
    let lineY = ty;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Slight forward slant, poster style.
    ctx.transform(1, 0, -0.08, 1, h * 0.012, 0);
    for (const line of wrapped.lines) {
      ctx.font = `${wrapped.size}px Anton, 'Arial Narrow', sans-serif`;
      const grad = ctx.createLinearGradient(0, lineY - wrapped.size * 0.55, 0, lineY + wrapped.size * 0.55);
      grad.addColorStop(0, '#ffe259');
      grad.addColorStop(0.5, '#ff7e5f');
      grad.addColorStop(1, '#ff2e88');
      ctx.lineWidth = Math.max(3, wrapped.size * 0.09);
      ctx.strokeStyle = '#160826';
      ctx.lineJoin = 'round';
      ctx.strokeText(line, w / 2, lineY);
      ctx.fillStyle = grad;
      ctx.fillText(line, w / 2, lineY);
      lineY += lineH;
    }
    ctx.restore();
  }

  if (subtitle) {
    const subSize = Math.max(16, h * 0.028);
    ctx.save();
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = grade.accent;
    ctx.shadowBlur = subSize * 0.7;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(subtitle, w / 2, h * 0.965);
    ctx.restore();
  }

  // Film grain + vignette finish.
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(10,2,20,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}
