/**
 * SafeFun CMS Cloudflare Worker Entrypoint
 * Handles static asset serving and SPA routing for the React application.
 */

export default {
  async fetch(request, env, ctx) {
    // Serve static assets (JS, CSS, images) and HTML routes via ASSETS binding.
    // wrangler.jsonc handles SPA routing fallback via "not_found_handling": "single-page-application".
    let response = await env.ASSETS.fetch(request);

    // Explicit fallback to index.html for client-side routing if 404 occurs on GET navigations
    if (response.status === 404 && request.method === 'GET') {
      const url = new URL(request.url);
      const indexRequest = new Request(`${url.origin}/index.html`, request);
      response = await env.ASSETS.fetch(indexRequest);
    }

    return response;
  },
};
