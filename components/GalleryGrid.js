function caption(resource) {
  return resource.caption || 'A Grand Reunion 2026 memory';
}

export function renderGallery(resources, container, lightbox, start, count = 12) {
  const batch = resources.slice(start, start + count);
  batch.forEach((resource) => {
    const card = document.createElement('button');
    const src = resource.url;
    card.type = 'button'; card.className = 'gallery-card group relative block break-inside-avoid overflow-hidden rounded-sm bg-white text-left shadow-sm';
    card.innerHTML = `<img class="w-full transition duration-300 group-hover:scale-[1.03]" loading="lazy" src="${src}" alt="${caption(resource)}"><span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">${caption(resource)}</span>`;
    card.addEventListener('click', () => lightbox.open(resource.url, `${caption(resource)} · ${new Date(resource.createdAt).toLocaleDateString()}`));
    container.append(card);
  });
  return start + batch.length;
}
