// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  // Canonical origin. Required for <link rel="canonical">, sitemap and RSS.
  // Override per environment with SITE_URL (preview deploys, staging).
  site: process.env.SITE_URL ?? 'https://myridesg.com',

  // Fully static: every route is prerendered at build time. There is no server
  // at runtime, so no route may fetch on request. See AGENTS.md.
  output: 'static',

  integrations: [react(), sitemap()],

  // Images: WebP is the delivery standard for this site. <Image> already emits
  // WebP by default, so there is no format config here — set `format` on the
  // component only when a specific page needs to differ.
  //
  // Sources MUST live in src/assets/ so astro:assets can process them. Anything
  // placed in public/ is copied byte-for-byte with NO optimisation, which on a
  // 2.7 MB hero is a silent performance regression.

  vite: {
    plugins: [tailwindcss()],
  },
})
