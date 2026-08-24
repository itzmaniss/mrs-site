/**
 * VENDORED from myridesg-v2 @ packages/data/src/sanity/mappers.ts.
 *
 * Differences from the monorepo, both deliberate:
 *
 *   - No image mapping. The v2 guide routes do not render heroImage either, so
 *     carrying @sanity/image-url across just to drop the result would be a
 *     dependency for nothing. Add it back with the field when a guide layout
 *     actually needs the art.
 *   - No `avatar` on the author ref, for the same reason.
 *
 * Everything else — field names, the publishedAt/updatedAt fallback, the
 * 'unknown' author null-object — matches, so guides read identically on both
 * sites.
 */

import type { Article, ArticleAuthorRef, ArticleSeo, ArticleSummary } from '../entities'

interface ArticleAuthorRefDoc {
  slug?: { current?: string } | null
  name?: string | null
}

export interface ArticleDoc {
  _id: string
  title: string
  slug: { current: string }
  category: 'guide' | 'bike-model' | 'news'
  description: string
  author?: ArticleAuthorRefDoc | null
  body: unknown[]
  publishedAt: string
  updatedAt?: string | null
  tags?: string[] | null
  relatedSlugs?: Array<{ slug?: { current?: string } | null } | null> | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonicalUrl?: string | null
    noIndex?: boolean | null
  } | null
}

export interface ArticleSummaryDoc {
  slug: { current: string }
  title: string
  description: string
  category: 'guide' | 'bike-model' | 'news'
  author?: ArticleAuthorRefDoc | null
  publishedAt: string
  updatedAt?: string | null
  tags?: string[] | null
}

function mapSeo(doc: ArticleDoc): ArticleSeo {
  const s = doc.seo ?? {}
  return {
    metaTitle: s.metaTitle ?? null,
    metaDescription: s.metaDescription ?? null,
    canonicalUrl: s.canonicalUrl ?? null,
    noIndex: Boolean(s.noIndex),
  }
}

export function mapArticleAuthorRef(
  raw: ArticleAuthorRefDoc | null | undefined,
): ArticleAuthorRef {
  if (!raw) return { slug: 'unknown', name: 'Unknown' }
  return {
    slug: raw.slug?.current ?? 'unknown',
    name: raw.name ?? 'Unknown',
  }
}

export function mapArticleDoc(doc: ArticleDoc): Article {
  return {
    slug: doc.slug.current,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    author: mapArticleAuthorRef(doc.author),
    publishedAt: new Date(doc.publishedAt),
    updatedAt: new Date(doc.updatedAt ?? doc.publishedAt),
    tags: doc.tags ?? [],
    relatedSlugs: (doc.relatedSlugs ?? [])
      .map((r) => r?.slug?.current)
      .filter((s): s is string => Boolean(s)),
    bodySource: JSON.stringify(doc.body),
    bodyFormat: 'portable-text-v1',
    seo: mapSeo(doc),
  }
}

export function mapArticleSummaryDoc(doc: ArticleSummaryDoc): ArticleSummary {
  return {
    slug: doc.slug.current,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    author: mapArticleAuthorRef(doc.author),
    publishedAt: new Date(doc.publishedAt),
    updatedAt: new Date(doc.updatedAt ?? doc.publishedAt),
    tags: doc.tags ?? [],
  }
}
