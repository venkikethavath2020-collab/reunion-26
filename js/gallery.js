import { fetchGallery } from './r2.js';
import { createLightbox } from './Lightbox.js';
import { renderGallery, resetGalleryItems } from './GalleryGrid.js';

export async function initGallery({ preview = false } = {}) {
  const grid = document.getElementById('galleryGrid');
  const state = document.getElementById('galleryState');
  const more = document.getElementById('loadMore');
  const batchSelect = document.getElementById('batchFilter');

  if (!grid || !state) return;

  try {
    resetGalleryItems();
    const lightbox = createLightbox();

    let cursor = '';
    let loading = false;
    let allItems = [];          // keep every item we have loaded
    let currentBatch = '';      // "" = All batches

    function getFilteredItems() {
      if (!currentBatch) return allItems;
      return allItems.filter(
        (item) => String(item.batch || '').trim() === currentBatch
      );
    }

    function renderFiltered() {
      // Clear current grid
      grid.innerHTML = '';

      const filtered = getFilteredItems();

      if (filtered.length === 0) {
        state.classList.remove('hidden');
        state.textContent = currentBatch
          ? `No photos found for batch ${currentBatch}.`
          : 'No memories uploaded yet. Be the first to upload your reunion moments.';
      } else {
        state.classList.add('hidden');
        renderGallery(filtered, grid, lightbox, 0, filtered.length);
      }

      // Show/hide Load more based on whether the API still has more pages
      if (more) {
        more.classList.toggle('hidden', cursor === null);
      }
    }

    async function loadPage() {
      if (loading || cursor === null) return;
      loading = true;
      if (more) more.textContent = 'Loading memories...';

      try {
        const page = await fetchGallery(cursor, preview ? 8 : 30);
        cursor = page.cursor || null;

        // Append new items
        allItems = allItems.concat(page.items || []);

        // Re-render with current filter
        renderFiltered();
      } catch (err) {
        console.error(err);
        state.classList.remove('hidden');
        state.textContent = err.message || 'Could not load photos.';
      } finally {
        if (more) {
          more.textContent = preview ? 'View All Photos' : 'Load more memories';
        }
        loading = false;
      }
    }

    // Initial load
    await loadPage();

    // ── Batch filter change ──────────────────────────────
    if (batchSelect) {
      batchSelect.addEventListener('change', () => {
        currentBatch = batchSelect.value;
        renderFiltered();
      });
    }

    // ── Preview mode ─────────────────────────────────────
    if (preview) {
      more?.addEventListener('click', () => {
        window.location.href = 'gallery/';
      });
      return;
    }

    // ── Load more + infinite scroll ──────────────────────
    more?.addEventListener('click', loadPage);

    if (more) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) loadPage();
        },
        { rootMargin: '500px' }
      );
      observer.observe(more);
    }
  } catch (error) {
    state.classList.remove('hidden');
    state.textContent = error.message;
  }
}