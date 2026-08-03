import { fetchGallery } from './r2.js';
import { createLightbox } from '../components/Lightbox.js';
import { renderGallery } from '../components/GalleryGrid.js';

export async function initGallery() {
  const grid = document.getElementById('galleryGrid');
  const state = document.getElementById('galleryState');
  const more = document.getElementById('loadMore');
  if (!grid || !state) return;
  try {
    const lightbox = createLightbox(); let cursor = ''; let loading = false;
    async function loadPage() {
      if (loading || cursor === null) return;
      loading = true; more.textContent = 'Loading memories...';
      const page = await fetchGallery(cursor); cursor = page.cursor || null;
      if (!page.items.length && !grid.children.length) { state.classList.remove('hidden'); state.textContent = 'No memories uploaded yet. Be the first to upload your reunion moments.'; }
      renderGallery(page.items, grid, lightbox, 0, page.items.length);
      more.classList.toggle('hidden', cursor === null); more.textContent = 'Load more memories'; loading = false;
    }
    await loadPage();
    more.addEventListener('click', loadPage);
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadPage(); }, { rootMargin: '500px' });
    observer.observe(more);
  } catch (error) { state.classList.remove('hidden'); state.textContent = error.message; }
}
