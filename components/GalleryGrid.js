function caption(resource) {
  return resource.caption || "A Grand Reunion 2026 memory";
}

export function renderGallery(resources, container, lightbox, start, count = 12) {
  const batch = resources.slice(start, start + count);

  batch.forEach((resource) => {
    const card = document.createElement("button");
    const src = resource.url;

    card.type = "button";
    card.className =
      "gallery-card group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl";

    card.innerHTML = `
      <img
        class="w-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        src="${src}"
        alt="${caption(resource)}"
      />

      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end">
        <span class="p-4 text-sm font-medium text-white">
          ${caption(resource)}
        </span>
      </div>
    `;

    card.addEventListener("click", () =>
      lightbox.open(
        resource.url,
        `${caption(resource)} · ${new Date(resource.createdAt).toLocaleDateString()}`
      )
    );

    container.append(card);
  });

  return start + batch.length;
}