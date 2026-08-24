/**
 * VENDORED from myridesg-v2 @ packages/domain/src/content/usecases.ts.
 *
 * Only the guide use-cases are carried over. Keep the behaviour identical to
 * the monorepo: /guides on this site and /guides in the v2 web app must not
 * disagree about which articles are guides or how they are ordered.
 */

import type { Article, ArticleSummary, ContentRepository } from './entities'

/** Newest first. `category` is the authored field, not derived from the URL. */
export async function listGuideArticles(
  repo: ContentRepository,
): Promise<ArticleSummary[]> {
  const articles = await repo.listArticles()
  return articles
    .filter((a) => a.category === 'guide')
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

/**
 * Guides are addressed as /guides/<slug>, so an article of another category
 * must not be reachable there even if the slug matches.
 */
export async function getGuideArticle(
  repo: ContentRepository,
  slug: string,
): Promise<Article | null> {
  const article = await repo.getArticle(slug)
  return article?.category === 'guide' ? article : null
}
