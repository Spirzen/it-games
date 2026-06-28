/**
 * @param {Array<{ title: string, description?: string, href: string, categoryLabel?: string | null, categoryKey?: string | null, isIntro?: boolean, pathSegments?: string[] }>} pages
 */
export function buildPortalSearchIndex(pages) {
  return pages
    .filter((page) => page.href !== '/games/intro')
    .map((page) => ({
      title: page.title,
      description: page.description ?? '',
      href: page.href,
      category: page.categoryLabel ?? '',
      categoryKey: page.categoryKey ?? '',
      isIntro: Boolean(page.isIntro),
    }));
}
