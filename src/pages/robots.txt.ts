import type { APIRoute } from 'astro'

/**
 * robots.txt, generated at build so the sitemap URL always tracks `site` in
 * astro.config.mjs rather than being hardcoded in a static file.
 *
 * The site is fully indexable. AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
 * Google-Extended) are deliberately NOT blocked — being cited by LLM search is
 * a goal here, not a leak. Revisit only if that position changes.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
