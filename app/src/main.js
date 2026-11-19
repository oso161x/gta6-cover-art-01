// Vice Cover Studio — wires the editor: photo pool, layout/grade/size pickers, caption
// editing, per-panel drag-to-crop and zoom, undo/redo history, and PNG export.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).
import { drawCover, layoutById, gradeById, GRADES, LAYOUTS, SIZES } from './cover.js';

window.addEventListener('error', (e) => { window.__pageError = String(e.message || e.error); });

const canvas = document.getElementById('cover');
const statusEl = document.getElementById('status');
const titleInput = document.getElementById('title');
const subtitleInput = document.getElementById('subtitle');
const thumbsEl = document.getElementById('thumbs');
const zoomInput = document.getElementById('zoom');
const zoomVal = document.getElementById('zoom-val');
const hintEl = document.getElementById('panel-hint');

// --- Photo pool -------------------------------------------------------------
// Each pool photo is { id, name, img }. Panels reference pool photos by id, so
// undo/redo snapshots stay small JSON and never carry image bytes.
const pool = [];
let poolSeq = 0;

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cannot load ${url}`));
    img.src = url;
  });
}

async function addPhoto(img, name) {
  if (pool.length >= 4) {
    statusEl.textContent = 'Four photos at most — remove one first (click a thumbnail twice).';
    return null;
  }
  const entry = { id: `p${++poolSeq}`, name, img };
  pool.push(entry);
  renderThumbs();
  return entry;
}

function renderThumbs() {
  thumbsEl.innerHTML = '';
  if (!pool.length) {
    const span = document.createElement('span');
    span.className = 'empty';
    span.textContent = 'No photos yet — add yours, or try a sample.';
    thumbsEl.append(span);
    return;
  }
  for (const entry of pool) {
    const img = document.createElement('img');
    img.src = entry.img.src;
    img.alt = entry.name;
    img.title = `${entry.name} — click to put in the selected panel`;
    const selectedPhoto = currentAssignment()?.photoId === entry.id;
    if (selectedPhoto) img.classList.add('selected');
    img.addEventListener('click', () => {
      pushHistory();
      assignPhoto(state.selected, entry.id);
      redraw();
      renderThumbs();
    });
    img.addEventListener('dblclick', () => {
      const idx = pool.findIndex((p) => p.id === entry.id);
      if (idx !== -1) pool.splice(idx, 1);
      for (const a of state.assignments) if (a.photoId === entry.id) a.photoId = pool[0]?.id ?? null;
      pushHistory();
      redraw();
      renderThumbs();
    });
    thumbsEl.append(img);
  }
}

// --- State + history --------------------------------------------------------
const state = {
  layout: 'hero3',
  grade: 'sunset',
  size: '1080x1080',
  title: 'Neon Shore',
  subtitle: 'chasing the neon lights',
  selected: 0,
  // One assignment per panel slot (up to 9); each is { photoId, ox, oy, zoom }.
  assignments: Array.from({ length: 9 }, () => ({ photoId: null, ox: 0, oy: 0, zoom: 1 })),
};

const history = { past: [], future: [] };

function serializeState() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, size: state.size,
    title: state.title, subtitle: state.subtitle, selected: state.selected,
    assignments: state.assignments,
  });
}

function applySnapshot(json) {
  const s = JSON.parse(json);
  state.layout = s.layout; state.grade = s.grade; state.size = s.size;
  state.title = s.title; state.subtitle = s.subtitle; state.selected = s.selected;
  state.assignments = s.assignments;
  syncControls();
  resizePreview();
  redraw();
}

function pushHistory() {
  history.past.push(serializeState());
  if (history.past.length > 60) history.past.shift();
  history.future.length = 0;
  syncUndoButtons();
}

function undo() {
  if (!history.past.length) return;
  history.future.push(serializeState());
  applySnapshot(history.past.pop());
  syncUndoButtons();
}

function redo() {
  if (!history.future.length) return;
  history.past.push(serializeState());
  applySnapshot(history.future.pop());
  syncUndoButtons();
}

function syncUndoButtons() {
  document.getElementById('undo').disabled = !history.past.length;
  document.getElementById('redo').disabled = !history.future.length;
}

// --- Panel assignments ------------------------------------------------------
function currentAssignment() {
  return state.assignments[state.selected];
}

function assignPhoto(panelIndex, photoId) {
  const a = state.assignments[panelIndex];
  if (a) { a.photoId = photoId; a.ox = 0; a.oy = 0; a.zoom = 1; }
}

/** Cycles the pool photos across the layout's panels with varied crops. */
function fillAllPanels() {
  const layout = layoutById(state.layout);
  if (!pool.length) return;
  layout.panels.forEach((_, i) => {
    const a = state.assignments[i];
    a.photoId = pool[i % pool.length].id;
    // Panel 0 is the hero: favour the top of the photo (faces live there).
    // The rest vary so repeated photos read as different shots.
    const oyPattern = [0.8, 0.2, -0.3, 0.5, 0.5, -0.5, 0, 0.3, -0.2];
    a.ox = (i % 3) - 1 > 0 ? 0.3 : (i % 3) - 1 < 0 ? -0.3 : 0;
    a.oy = oyPattern[i % oyPattern.length];
    a.zoom = 1 + (i % 3) * 0.15;
  });
}

/** Builds the render state the cover drawer takes: panels aligned with the layout. */
function renderState() {
  const layout = layoutById(state.layout);
  const panels = layout.panels.map((_, i) => {
    const a = state.assignments[i];
    const photo = pool.find((p) => p.id === a?.photoId) ?? pool[0] ?? null;
    return photo ? { img: photo.img, ox: a?.ox ?? 0, oy: a?.oy ?? 0, zoom: a?.zoom ?? 1 } : null;
  });
  return { title: state.title, subtitle: state.subtitle, layout: state.layout, grade: state.grade, panels };
}

// --- Drawing ----------------------------------------------------------------
function resizePreview() {
  const size = SIZES[state.size];
  const scale = Math.min(1, 900 / Math.max(size.w, size.h));
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
}

function redraw() {
  drawCover(canvas, renderState());
  const layout = layoutById(state.layout);
  const a = currentAssignment();
  const photo = pool.find((p) => p.id === a?.photoId);
  hintEl.textContent = photo
    ? `Panel ${state.selected + 1} of ${layout.panels.length} · ${photo.name} — drag to move, scroll to zoom.`
    : `Panel ${state.selected + 1} of ${layout.panels.length} — add a photo to fill it.`;
  zoomInput.value = String(Math.round((a?.zoom ?? 1) * 100));
  zoomVal.textContent = `${Math.round((a?.zoom ?? 1) * 100)}%`;
}

// --- Pickers ----------------------------------------------------------------
function buildPicker(el, items, current, onPick, swatch) {
  el.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', String(item.id === current));
    if (swatch) {
      const dot = document.createElement('span');
      dot.className = 'grade-swatch';
      dot.style.background = `linear-gradient(135deg, ${item.stops[0].slice(1).map((v) => `#${v.toString(16).padStart(2, '0')}`).join('')}, ${item.accent})`;
      b.append(dot);
    }
    b.append(document.createTextNode(item.name));
    b.addEventListener('click', () => { pushHistory(); onPick(item.id); syncPickers(); redraw(); });
    el.append(b);
  }
}

function syncPickers() {
  buildPicker(document.getElementById('layouts'), LAYOUTS, state.layout, (id) => { state.layout = id; state.selected = 0; resizePreview(); });
  buildPicker(document.getElementById('grades'), GRADES, state.grade, (id) => { state.grade = id; }, true);
  const sizeItems = Object.entries(SIZES).map(([id, s]) => ({ id, name: s.label }));
  buildPicker(document.getElementById('sizes'), sizeItems, state.size, (id) => { state.size = id; resizePreview(); });
}

function syncControls() {
  titleInput.value = state.title;
  subtitleInput.value = state.subtitle;
  syncPickers();
}

// --- Panel interaction: click to select, drag to pan, wheel to zoom ---------
function panelAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  const layout = layoutById(state.layout);
  for (let i = layout.panels.length - 1; i >= 0; i--) {
    const p = layout.panels[i];
    if (nx >= p.x && nx <= p.x + p.w && ny >= p.y && ny <= p.y + p.h) return i;
  }
  return -1;
}

/** Drawn photo size in canvas pixels, for turning drag deltas into pan offsets. */
function drawnSize(panelIndex) {
  const layout = layoutById(state.layout);
  const panel = layout.panels[panelIndex];
  const a = state.assignments[panelIndex];
  const photo = pool.find((p) => p.id === a?.photoId) ?? pool[0];
  if (!photo) return null;
  const pw = panel.w * canvas.width;
  const ph = panel.h * canvas.height;
  const iw = photo.img.naturalWidth;
  const ih = photo.img.naturalHeight;
  const scale = Math.max(pw / iw, ph / ih) * (a?.zoom ?? 1);
  return { pw, ph, dw: iw * scale, dh: ih * scale };
}

let drag = null;
let lastWheelAt = 0;
canvas.addEventListener('pointerdown', (e) => {
  const idx = panelAt(e.clientX, e.clientY);
  if (idx === -1) return;
  pushHistory();
  state.selected = idx;
  canvas.setPointerCapture(e.pointerId);
  drag = { x: e.clientX, y: e.clientY, panel: idx };
  redraw();
  renderThumbs();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const a = state.assignments[drag.panel];
  const d = drawnSize(drag.panel);
  if (!a || !d) return;
  const rect = canvas.getBoundingClientRect();
  const dxPx = ((e.clientX - drag.x) / rect.width) * canvas.width;
  const dyPx = ((e.clientY - drag.y) / rect.height) * canvas.height;
  if (d.dw > d.pw) a.ox = Math.max(-1, Math.min(1, a.ox + (2 * dxPx) / (d.dw - d.pw)));
  if (d.dh > d.ph) a.oy = Math.max(-1, Math.min(1, a.oy + (2 * dyPx) / (d.dh - d.ph)));
  drag.x = e.clientX;
  drag.y = e.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const idx = panelAt(e.clientX, e.clientY);
  if (idx === -1) return;
  const now = Date.now();
  if (now - lastWheelAt > 600) pushHistory();
  lastWheelAt = now;
  const a = state.assignments[idx];
  a.zoom = Math.max(1, Math.min(3, a.zoom * Math.exp(-e.deltaY * 0.0015)));
  state.selected = idx;
  redraw();
}, { passive: false });

// --- Inputs -----------------------------------------------------------------
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
titleInput.addEventListener('change', pushHistory);
subtitleInput.addEventListener('input', () => { state.subtitle = subtitleInput.value; redraw(); });
subtitleInput.addEventListener('change', pushHistory);
zoomInput.addEventListener('input', () => {
  const a = currentAssignment();
  if (a) { a.zoom = Number(zoomInput.value) / 100; redraw(); }
});
zoomInput.addEventListener('change', pushHistory);
document.getElementById('reset-crop').addEventListener('click', () => {
  const a = currentAssignment();
  if (!a) return;
  pushHistory();
  a.ox = 0; a.oy = 0; a.zoom = 1;
  redraw();
});
document.getElementById('fill-panels').addEventListener('click', () => {
  pushHistory();
  fillAllPanels();
  redraw();
  renderThumbs();
});
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) redo(); else undo();
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
});

document.getElementById('photo').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    try {
      const img = await loadImage(URL.createObjectURL(file));
      const entry = await addPhoto(img, file.name.replace(/\.[^.]+$/, ''));
      if (entry && !state.assignments.some((a) => a.photoId)) {
        pushHistory();
        fillAllPanels();
      }
    } catch { statusEl.textContent = `Could not read ${file.name}.`; }
  }
  e.target.value = '';
  redraw();
});
for (const btn of document.querySelectorAll('[data-sample]')) {
  btn.addEventListener('click', async () => {
    const name = btn.dataset.sample;
    try {
      const img = await loadImage(`samples/${name}.jpg`);
      const entry = await addPhoto(img, name);
      if (entry) {
        pushHistory();
        const empty = state.assignments.findIndex((a) => !a.photoId);
        if (empty !== -1) assignPhoto(empty, entry.id);
        else assignPhoto(state.selected, entry.id);
        redraw();
        renderThumbs();
      }
    } catch { statusEl.textContent = `Sample ${name} failed to load.`; }
  });
}

// --- Export -----------------------------------------------------------------
function renderExport(sizeId) {
  const size = SIZES[sizeId];
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, renderState());
  return off;
}

function downloadCanvas(off, filename) {
  return new Promise((resolve) => {
    off.toBlob((blob) => {
      if (!blob) { resolve(0); return; }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      resolve(blob.size);
    }, 'image/png');
  });
}

async function exportPNG(sizeId) {
  const off = renderExport(sizeId);
  const bytes = await downloadCanvas(off, `vice-cover-${sizeId}.png`);
  statusEl.textContent = bytes ? `Saved vice-cover-${sizeId}.png (${(bytes / 1024).toFixed(0)} KiB)` : 'Export failed.';
  return bytes;
}

document.getElementById('export').addEventListener('click', () => exportPNG(state.size));
document.getElementById('export-all').addEventListener('click', async () => {
  statusEl.textContent = 'Exporting all 3 sizes…';
  let total = 0;
  for (const sizeId of Object.keys(SIZES)) {
    total += await exportPNG(sizeId);
    await new Promise((r) => setTimeout(r, 150));
  }
  statusEl.textContent = `Saved all 3 sizes (${(total / 1024).toFixed(0)} KiB in all).`;
});

// Exposed for the ?shot=export test scene and for the finalist review.
window.__exportPNG = async (sizeId) => {
  const off = renderExport(sizeId ?? state.size);
  return new Promise((resolve) => {
    off.toBlob((blob) => resolve(blob ? blob.size : 0), 'image/png');
  });
};

// --- Boot -------------------------------------------------------------------
async function boot() {
  try {
    await Promise.all([document.fonts.load('100px Anton'), document.fonts.load('40px Pacifico')]);
  } catch { /* fall back to system fonts; the cover still draws */ }
  syncControls();
  resizePreview();
  renderThumbs();
  syncUndoButtons();
  const query = new URLSearchParams(location.search);
  const shot = query.get('shot');
  if (shot) {
    const { runShot } = await import('./shots.js');
    await runShot(shot, query, {
      loadSample: async (name) => {
        const img = await loadImage(`samples/${name}.jpg`);
        return addPhoto(img, name);
      },
      applyState: (patch) => {
        if (patch.layout) state.layout = patch.layout;
        if (patch.grade) state.grade = patch.grade;
        if (patch.size) state.size = patch.size;
        if (patch.title !== undefined) state.title = patch.title;
        if (patch.subtitle !== undefined) state.subtitle = patch.subtitle;
        syncControls();
        resizePreview();
      },
      fillAllPanels,
      redraw,
      renderState,
      SIZES,
    });
  } else {
    redraw();
  }
  document.fonts.ready.then(() => redraw());
}

boot();
