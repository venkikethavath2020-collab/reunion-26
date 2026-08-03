import { MAX_CONCURRENT_UPLOADS } from "./config.js";
import { compressImage } from "./compress.js";
import { uploadImage } from "./r2.js";
import { createUploadRow } from "../components/UploadCard.js";

const validTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
const maxOriginalBytes = 25 * 1024 * 1024;

export function initUpload() {
  const input = document.getElementById("photoInput");
  const zone = document.getElementById("dropZone");
  const list = document.getElementById("uploadList");
  const form = document.getElementById("uploadForm");
  const message = document.getElementById("uploadMessage");
  if (!input || !zone || !form) return;
  let selected = [];
  const choose = (files) => {
    const accepted = [...files].filter(
      (file) => validTypes.includes(file.type) && file.size <= maxOriginalBytes
    );
    const rejected = files.length - accepted.length;
    selected = accepted;
    list.innerHTML = "";
    accepted.forEach((file) => list.append(createUploadRow(file).row));
    if (rejected) {
      message.textContent =
        "Some files were skipped. Choose JPG, PNG, WebP, HEIC, or HEIF files below 25 MB.";
      message.className = "mt-4 text-sm text-red-600";
    }
  };
  input.addEventListener("change", (event) => choose(event.target.files));
  ["dragenter", "dragover"].forEach((type) =>
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.add("border-[#F46352]", "bg-[#fffaf1]");
    })
  );
  ["dragleave", "drop"].forEach((type) =>
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.remove("border-[#F46352]", "bg-[#fffaf1]");
    })
  );
  zone.addEventListener("drop", (event) => choose(event.dataTransfer.files));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!navigator.onLine) {
      message.textContent =
        "You appear to be offline. Reconnect to the internet and try again.";
      message.className = "mt-4 text-sm text-red-600";
      return;
    }
    if (!selected.length) {
      message.textContent = "Choose at least one image to upload.";
      message.className = "mt-4 text-sm text-red-600";
      return;
    }
    const metadata = {
      name: form.name.value.trim(),
      batch: form.batch.value,
      caption: form.caption.value.trim(),
    };
    const rows = [...list.children].map((row) => ({
      row,
      update(progress, label) {
        row.querySelector(".bar").style.width = `${progress}%`;
        row.querySelector(".status").textContent = label;
      },
    }));
    let complete = 0;
    async function uploadOne(file, index) {
      const item = rows[index];
      try {
        item.update(4, "Compressing...");
        const compressed = await compressImage(file);
        item.update(8, "Uploading...");
        await uploadImage(compressed, metadata, (percent) =>
          item.update(percent, `${percent}%`)
        );
        item.update(100, "Uploaded");
        complete++;
      } catch (error) {
        item.update(100, "Could not upload");
        throw error;
      }
    }
    const queue = selected.map((file, index) => () => uploadOne(file, index));
    const workers = Array.from(
      { length: Math.min(MAX_CONCURRENT_UPLOADS, queue.length) },
      async () => {
        while (queue.length) {
          try {
            await queue.shift()();
          } catch {}
        }
      }
    );
    await Promise.all(workers);
    message.innerHTML = complete
      ? '<span class="mr-2 inline-block animate-bounce text-xl" aria-hidden="true">🎉</span>Your memories have been uploaded successfully. Thank you for contributing to the TGTWURJC Grand Reunion 2026.'
      : "None of the photos could be uploaded. Please try again.";
    message.className = `mt-5 rounded-md p-4 text-sm font-semibold ${
      complete ? "bg-[#E5E9DF] text-[#153B3A]" : "bg-red-50 text-red-700"
    }`;
    if (complete) {
      form.reset();
      selected = [];
      window.setTimeout(() => {
        window.location.href = "../#gallery";
      }, 2200);
    }
  });
}
