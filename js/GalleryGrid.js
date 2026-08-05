/**
 * Renders gallery tiles and wires them to the lightbox.
 * Keeps a shared list so prev/next works across all loaded pages.
 */
let allItems = [];

export function renderGallery(items, grid, lightbox, _start, _end) {
  if (!grid || !lightbox) return;

  const mapped = items.map((item) => ({
    src: item.url || item.src,
    caption: item.caption || '',
    name: item.name || '',
    batch: item.batch || '',
    thumb: item.thumb || item.url || item.src,
  }));

  const baseIndex = allItems.length;
  allItems = allItems.concat(mapped);
  lightbox.setItems(allItems);

  mapped.forEach((item, i) => {
    const globalIndex = baseIndex + i;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'photo-tile mb-3 block w-full break-inside-avoid overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-coral';
    btn.innerHTML = `
      <img
        src="${item.thumb}"
        alt="${escapeAttr(item.caption || item.name || 'Reunion photo')}"
        class="w-full object-cover transition duration-300 hover:scale-[1.03]"
        loading="lazy"
      />
    `;
    btn.addEventListener('click', () => {
      lightbox.open(allItems, globalIndex);
    });
    grid.appendChild(btn);
  });
}

/** Call this if you ever fully re-init the grid (optional) */
export function resetGalleryItems() {
  allItems = [];
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}