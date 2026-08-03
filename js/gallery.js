import { fetchGallery } from './r2.js';
import { createLightbox } from '../components/Lightbox.js';
import { renderGallery } from '../components/GalleryGrid.js';

export async function initGallery({ preview = false } = {}) {
  const grid = document.getElementById('galleryGrid');
  const state = document.getElementById('galleryState');
  const more = document.getElementById('loadMore');
  if (!grid || !state) return;
  try {
    const lightbox = createLightbox(); let cursor = ''; let loading = false;
    async function loadPage() {
      if (loading || cursor === null) return;
      loading = true; more.textContent = 'Loading memories...';
      const page = await fetchGallery(cursor, preview ? 8 : 24); cursor = page.cursor || null;
      if (!page.items.length && !grid.children.length) { state.classList.remove('hidden'); state.textContent = 'No memories uploaded yet. Be the first to upload your reunion moments.'; }
      renderGallery(page.items, grid, lightbox, 0, page.items.length);
      more.classList.toggle('hidden', cursor === null);
      more.textContent = preview ? 'View All Photos' : 'Load more memories';
      loading = false;
    }
    await loadPage();
    if (preview) {
      more.addEventListener('click', () => { window.location.href = 'gallery/'; });
      return;
    }
    more.addEventListener('click', loadPage);
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadPage(); }, { rootMargin: '500px' });
    observer.observe(more);
  } catch (error) { state.classList.remove('hidden'); state.textContent = error.message; }
}
