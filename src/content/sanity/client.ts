/**
 * VENDORED from myridesg-v2 @ packages/data/src/sanity/client.ts.
 *
 * The `import 'server-only'` guard from the monorepo is dropped: this site is
 * fully static, so every call here happens in the build, never in a browser.
 * Nothing in this module may be imported from a React island.
 */

import { createClient, type SanityClient } from '@sanity/client'

export interface SanityConfig {
  projectId: string
  dataset: string
  apiVersion: string
  token?: string
}

export function makeSanityClient(cfg: SanityConfig): SanityClient {
  return createClient({
    projectId: cfg.projectId,
    dataset: cfg.dataset,
    apiVersion: cfg.apiVersion,
    token: cfg.token,
    // The CDN serves the last published state, which is what an untokened
    // build wants. A token means someone is reading drafts, so bypass it.
    useCdn: !cfg.token,
    perspective: 'published',
  })
}
