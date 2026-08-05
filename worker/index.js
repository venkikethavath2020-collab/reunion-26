const GALLERY_PREFIX = 'gallery/';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() },
  });
}

function publicUrl(env, key) {
  return `${env.PUBLIC_R2_URL.replace(/\/$/, '')}/${key}`;
}

function cleanMetadata(value, fallback = '') {
  return String(value || fallback).trim().slice(0, 220);
}

function extension(file) {
  const fromType = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif' };
  return fromType[file.type] || 'jpg';
}

// Inverted timestamps make R2's lexicographic listing return recent uploads first.
function objectKey(file) {
  const invertedTime = String(9999999999999 - Date.now()).padStart(13, '0');
  return `${GALLERY_PREFIX}${invertedTime}-${crypto.randomUUID()}.${extension(file)}`;
}

async function upload(request, env) {
  const form = await request.formData();
  const image = form.get('image');
  if (!(image instanceof File) || !allowedTypes.has(image.type)) return json({ error: 'Please choose a supported image file.' }, 400);
  if (image.size > MAX_FILE_BYTES) return json({ error: 'This compressed image is still too large. Please choose a smaller photo.' }, 413);

  const key = objectKey(image);
  const metadata = {
    name: cleanMetadata(form.get('name'), 'Anonymous'),
    batch: cleanMetadata(form.get('batch'), 'Not specified'),
    caption: cleanMetadata(form.get('caption')),
    createdAt: new Date().toISOString(),
  };
  await env.PHOTOS.put(key, image.stream(), {
    httpMetadata: { contentType: image.type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: metadata,
  });
  return json({ key, url: publicUrl(env, key), createdAt: metadata.createdAt }, 201);
}

async function list(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 24, 1), 100);
  const cursor = url.searchParams.get('cursor') || undefined;
  const result = await env.PHOTOS.list({ prefix: GALLERY_PREFIX, limit, cursor, include: ['customMetadata', 'httpMetadata'] });
  return json({
    items: result.objects.map((object) => ({
      key: object.key,
      url: publicUrl(env, object.key),
      createdAt: object.customMetadata?.createdAt || object.uploaded.toISOString(),
      caption: object.customMetadata?.caption || '',
      name: object.customMetadata?.name || 'Anonymous',
      batch: object.customMetadata?.batch || '',
    })),
    cursor: result.truncated ? result.cursor : null,
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
    try {
      if (request.method === 'POST') return upload(request, env);
      if (request.method === 'GET') return list(request, env);
      return json({ error: 'Method not allowed.' }, 405);
    } catch (error) {
      return json({ error: 'The photo service is temporarily unavailable. Please try again.' }, 500);
    }
  },
};
