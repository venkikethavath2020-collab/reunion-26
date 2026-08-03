# Cloudflare R2 Photo Setup

The static Pages site calls a same-origin Cloudflare Worker. The Worker uses the native `R2Bucket` binding; there is no AWS SDK, database, or client-side storage credential.

1. Create the R2 bucket named `grand-reunion-2026`.
2. Enable public access using an R2 public-development URL or, preferably, bind a custom domain such as `photos.your-domain.com`.
3. Set `PUBLIC_R2_URL` in `worker/wrangler.toml` to that public bucket URL.
4. Deploy the Worker and bind `PHOTOS` to `grand-reunion-2026`.
5. Route the Worker to `https://your-pages-domain/api/reunion-photos*` so the static site can use its same-origin `/api/reunion-photos` endpoint.
6. Deploy the updated Pages files.

Images are compressed in the browser, saved in the R2 `gallery/` folder under collision-proof filenames, and returned via public R2 URLs. The Worker lists R2 objects newest-first with cursor pagination for the gallery.
