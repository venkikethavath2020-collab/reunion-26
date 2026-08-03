export function createLightbox() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-[100] hidden items-center justify-center bg-black/90 p-4';
  modal.innerHTML = `<button class="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl text-white hover:bg-white/25" aria-label="Close preview">&times;</button><div class="max-h-full max-w-5xl"><img class="max-h-[75vh] w-full object-contain" alt="Reunion memory preview"><div class="mt-3 flex items-center justify-between gap-4 text-white"><p class="text-sm"></p><a class="rounded-md bg-[#FFD166] px-4 py-2 text-sm font-bold text-[#153B3A]" download>Download</a></div></div>`;
  document.body.append(modal);
  const image = modal.querySelector('img'); const caption = modal.querySelector('p'); const download = modal.querySelector('a');
  const close = () => modal.classList.replace('flex', 'hidden');
  modal.querySelector('button').addEventListener('click', close);
  modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  return { open(src, text) { image.src = src; caption.textContent = text; download.href = src; modal.classList.replace('hidden', 'flex'); } };
}
