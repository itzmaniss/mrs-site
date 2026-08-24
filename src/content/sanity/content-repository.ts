/**
 * VENDORED from myridesg-v2 @ packages/data/src/sanity/content-repository.ts.
 *
 * The GROQ is copied verbatim apart from the image projections, which this site
 * does not map (see ./mappers.ts). Keep it that way — if a query drifts, the
 * two sites start disagreeing about what a guide is.
 *
 * The monorepo's `next: { tags: [...] }` fetch options are gone: those drive
 * Next's on-demand revalidation, and there is no server here to revalidate. A
 * rebuild is how this site picks up new content.
 */

import type { SanityClient } from '@sanity/client'
import type { Article, ArticleSummary, ContentRepository } from '../entities'
import {
  mapArticleDoc,
  mapArticleSummaryDoc,
  type ArticleDoc,
  type ArticleSummaryDoc,
} from './mappers'

const ARTICLE_BY_SLUG = /* groq */ `
  *[_type == "article" && slug.current == $slug][0]{
    _id, title, slug, category, description, body, publishedAt, updatedAt, tags,
    "author": author->{ slug, name },
    "relatedSlugs": relatedSlugs[]->{ slug },
    seo
  }
`

const ARTICLE_SUMMARIES = /* groq */ `
  *[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
    slug, title, description, category, publishedAt, updatedAt, tags,
    "author": author->{ slug, name }
  }
`

export class SanityContentRepository implements ContentRepository {
  constructor(private readonly client: SanityClient) {}

  async getArticle(slug: string): Promise<Article | null> {
    const doc = await this.client.fetch<ArticleDoc | null>(ARTICLE_BY_SLUG, { slug })
    return doc ? mapArticleDoc(doc) : null
  }

  async listArticles(): Promise<ArticleSummary[]> {
    const docs = await this.client.fetch<ArticleSummaryDoc[]>(ARTICLE_SUMMARIES, {})
    return docs.map(mapArticleSummaryDoc)
  }
}

/**
 * Stands in when Sanity is not configured. Mirrors the null-object fallback in
 * apps/web/lib/repositories.ts: a CMS-less environment is a supported one, so
 * `pnpm build` must succeed on a machine with no credentials and simply produce
 * an empty /guides index rather than failing the build.
 */
export const emptyContentRepository: ContentRepository = {
  async getArticle() {
    return null
  },
  async listArticles() {
    return []
  },
}
