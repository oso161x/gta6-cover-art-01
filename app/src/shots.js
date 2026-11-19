// Fixed scenes for screenshots: ?shot=editor shows the editor with sample photos
// loaded; ?shot=cover shows an exported cover alone, full frame; ?shot=export
// renders a cover and runs the real PNG export path, reporting its byte size.
// Query params: photo, photo2 (sample names), layout, grade, size, caption, subtitle.
// window.__shotReady is set once the scene is painted.
export async function runShot(shot, query, api) {
  const layout = query.get('layout') ?? (shot === 'cover' ? 'hero3' : 'grid4');
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? '1080x1080';
  const title = query.get('caption') ?? 'Neon Shore';
  const subtitle = query.get('subtitle') ?? 'chasing the neon lights';

  api.applyState({ layout, grade, size, title, subtitle });

  const first = await api.loadSample(query.get('photo') ?? 'boulevard');
  const secondName = query.get('photo2');
  if (secondName) await api.loadSample(secondName);
  // A second, different sample photo for the multi-panel layouts.
  if (!secondName && first) await api.loadSample((query.get('photo') ?? 'boulevard') === 'pier' ? 'boulevard' : 'pier');
  api.fillAllPanels();
  api.redraw();

  if (shot === 'cover' || shot === 'export') {
    document.body.classList.add('shot-cover');
    // Draw at the true export size; CSS scales it to the window.
    const canvas = document.getElementById('cover');
    const dims = api.SIZES[size];
    canvas.width = dims.w;
    canvas.height = dims.h;
    api.redraw();
  }

  if (shot === 'export') {
    window.__exportBytes = await window.__exportPNG(size);
    document.title = `export-ok:${window.__exportBytes}`;
  }

  // Wait for the vendored fonts, then paint twice so the canvas is settled.
  try { await document.fonts.ready; } catch { /* fonts are optional */ }
  api.redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
