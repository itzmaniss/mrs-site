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

  // Local dev and `astro preview` only. There is no server in production, so
  // nothing here ships — it exists so the site can be shared for review.
  //
  // allowedHosts is the part that matters. Vite rejects any request whose Host
  // header it does not recognise (DNS-rebinding protection), and a Cloudflare
  // quick tunnel arrives as a randomly generated *.trycloudflare.com hostname.
  // Without this, the tunnel URL returns a bare "Blocked request" page instead
  // of the site, which looks like the tunnel is broken when it is not.
  //
  // A leading dot matches the domain and all its subdomains.
  server: {
    // Bind 0.0.0.0 so a phone on the same network, or a container, can reach
    // the dev server. cloudflared itself only needs localhost.
    host: true,
    port: 4321,
    allowedHosts: [
      '.trycloudflare.com', // quick tunnels: pnpm tunnel
      '.cfargotunnel.com', // named tunnels, default hostname
      // Named tunnel on a real domain, or any other host, without editing this
      // file: DEV_ALLOWED_HOSTS=preview.myridesg.com pnpm dev
      ...(process.env.DEV_ALLOWED_HOSTS?.split(',')
        .map((host) => host.trim())
        .filter(Boolean) ?? []),
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
})
