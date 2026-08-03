export function createUploadRow(file) {
  const row = document.createElement('li');
  row.className = 'rounded-md bg-[#F7F4EC] p-3';
  row.innerHTML = `<div class="flex items-center justify-between gap-3 text-sm"><span class="truncate font-semibold text-[#153B3A]"></span><span class="status shrink-0 text-[#49886B]">Waiting</span></div><div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#153B3A]/10"><div class="bar h-full w-0 rounded-full bg-[#F46352] transition-all"></div></div>`;
  row.querySelector('span').textContent = file.name;
  return { row, update(progress, label) { row.querySelector('.bar').style.width = `${progress}%`; row.querySelector('.status').textContent = label; } };
}
