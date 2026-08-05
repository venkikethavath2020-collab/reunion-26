export function createLightbox() {
    const root = document.createElement('div');
    root.id = 'lightbox';
    root.className =
      'fixed inset-0 z-[100] hidden items-center justify-center bg-ink/90 p-3 backdrop-blur-sm sm:p-6';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Photo viewer');
  
    root.innerHTML = `
      <div class="relative flex h-full w-full max-w-6xl flex-col items-center justify-center">
        <!-- Top bar -->
        <div class="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-3 px-1 py-2 sm:px-2">
          <p id="lbCounter" class="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white/90"></p>
          <div class="flex items-center gap-2">
            <button type="button" id="lbRotateLeft" class="lb-btn" aria-label="Rotate left">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h10a4 4 0 014 4v2M3 10l3-3m-3 3l3 3" />
              </svg>
            </button>
            <button type="button" id="lbRotateRight" class="lb-btn" aria-label="Rotate right">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 10H11a4 4 0 00-4 4v2M21 10l-3-3m3 3l-3 3" />
              </svg>
            </button>
            <button type="button" id="lbClose" class="lb-btn" aria-label="Close">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
  
        <!-- Image -->
        <div class="relative flex max-h-[78vh] w-full items-center justify-center overflow-hidden">
          <img id="lbImage" alt="" class="max-h-[78vh] max-w-full select-none object-contain transition-transform duration-300 ease-out" />
        </div>
  
        <!-- Caption -->
        <div id="lbMeta" class="mt-4 max-w-xl text-center text-sm text-white/80"></div>
  
        <!-- Prev / Next -->
        <button type="button" id="lbPrev"
          class="absolute left-1 top-1/2 z-20 -translate-y-1/2 lb-btn sm:left-2" aria-label="Previous photo">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button type="button" id="lbNext"
          class="absolute right-1 top-1/2 z-20 -translate-y-1/2 lb-btn sm:right-2" aria-label="Next photo">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    `;
  
    // Button base styles
    const style = document.createElement('style');
    style.textContent = `
      .lb-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 9999px;
        background: rgba(0,0,0,0.45);
        color: white;
        border: 1px solid rgba(255,255,255,0.15);
        transition: background 0.2s ease, transform 0.15s ease;
      }
      .lb-btn:hover { background: rgba(244, 99, 82, 0.9); }
      .lb-btn:active { transform: scale(0.95); }
      @media (max-width: 640px) {
        .lb-btn { width: 2.5rem; height: 2.5rem; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(root);
  
    const img = root.querySelector('#lbImage');
    const counter = root.querySelector('#lbCounter');
    const meta = root.querySelector('#lbMeta');
    const btnPrev = root.querySelector('#lbPrev');
    const btnNext = root.querySelector('#lbNext');
    const btnClose = root.querySelector('#lbClose');
    const btnRotL = root.querySelector('#lbRotateLeft');
    const btnRotR = root.querySelector('#lbRotateRight');
  
    /** @type {{ src: string, caption?: string, name?: string, batch?: string }[]} */
    let items = [];
    let index = 0;
    let rotation = 0;
  
    function applyRotation() {
      img.style.transform = `rotate(${rotation}deg)`;
    }
  
    function show(i) {
      if (!items.length) return;
      index = ((i % items.length) + items.length) % items.length;
      const item = items[index];
      rotation = 0;
      applyRotation();
      img.src = item.src;
      img.alt = item.caption || item.name || 'Reunion photo';
      counter.textContent = `${index + 1} / ${items.length}`;
  
      const parts = [];
      if (item.name) parts.push(item.name);
      if (item.batch) parts.push(`Batch ${item.batch}`);
      if (item.caption) parts.push(item.caption);
      meta.textContent = parts.join(' · ');
  
      btnPrev.style.visibility = items.length > 1 ? 'visible' : 'hidden';
      btnNext.style.visibility = items.length > 1 ? 'visible' : 'hidden';
    }
  
    function open(list, startIndex = 0) {
      items = list || [];
      if (!items.length) return;
      show(startIndex);
      root.classList.remove('hidden');
      root.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    }
  
    function close() {
      root.classList.add('hidden');
      root.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
      img.src = '';
      rotation = 0;
    }
  
    function prev() {
      show(index - 1);
    }
    function next() {
      show(index + 1);
    }
  
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      prev();
    });
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      next();
    });
    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });
    btnRotL.addEventListener('click', (e) => {
      e.stopPropagation();
      rotation -= 90;
      applyRotation();
    });
    btnRotR.addEventListener('click', (e) => {
      e.stopPropagation();
      rotation += 90;
      applyRotation();
    });
  
    // Click backdrop to close
    root.addEventListener('click', (e) => {
      if (e.target === root) close();
    });
  
    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (root.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'r' || e.key === 'R') {
        rotation += 90;
        applyRotation();
      }
    });
  
    // Touch swipe
    let touchX = null;
    root.addEventListener(
      'touchstart',
      (e) => {
        touchX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    root.addEventListener(
      'touchend',
      (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].screenX - touchX;
        touchX = null;
        if (Math.abs(dx) < 50) return;
        if (dx > 0) prev();
        else next();
      },
      { passive: true }
    );
  
    return {
      open,
      close,
      /** Append more items after load-more without resetting index */
      setItems(list) {
        items = list || [];
        if (!root.classList.contains('hidden') && items.length) {
          counter.textContent = `${index + 1} / ${items.length}`;
        }
      },
      getItems() {
        return items;
      },
    };
  }