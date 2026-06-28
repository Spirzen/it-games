/** @typedef {{ prefix: string, label: string, brandLabel: string, assetsBase: string, contentDir: string, introHref: string, spinoffRoots: string[] }} PortalConfig */

/** @type {PortalConfig} */
export const PORTAL = {
  prefix: 'games',
  label: 'Игры',
  brandLabel: 'Games IT',
  assetsBase: '/doc-assets/games',
  contentDir: 'content/games',
  introHref: '/games/intro',
  spinoffRoots: ['9-03-igrovaya-industriya', '9-04-razrabotka-igr', '9-031-gametools'],
  /** Порядок разделов в sidebar (иначе 9-031 уходит перед 9-04 по localeCompare). */
  categoryOrder: ['9-03-igrovaya-industriya', '9-04-razrabotka-igr', '9-031-gametools'],
  gametoolsKey: '9-031-gametools',
};

export const GAMES_ORIGIN = 'https://games.spirzen.ru';
export const KIDS_ORIGIN = 'https://kids.spirzen.ru';

/** @param {string[]} segments */
export function pathSegmentsToHref(segments) {
  return `/${PORTAL.prefix}/${segments.join('/')}`;
}

/**
 * @param {string} doc — encyclopedia/9-spinoff/… или games/…
 */
export function resolveSpinoffDocHref(doc) {
  for (const root of PORTAL.spinoffRoots) {
    const marker = `encyclopedia/9-spinoff/${root}/`;
    if (doc.startsWith(marker)) {
      const rel = doc.slice(marker.length);
      return {href: pathSegmentsToHref([root, ...rel.split('/').filter(Boolean)]), external: false};
    }
  }
  if (doc.startsWith('encyclopedia/9-spinoff/9-11-dlya-detey/')) {
    let rel = doc.replace(/^encyclopedia\/9-spinoff\/9-11-dlya-detey\/?/, '');
    if (rel === 'forkids') {
      rel = 'intro';
    }
    return {href: `${KIDS_ORIGIN}/kids/${rel}`, external: true};
  }
  if (doc.startsWith(`${PORTAL.prefix}/`)) {
    const rel = doc.replace(new RegExp(`^${PORTAL.prefix}/`), '');
    return {href: pathSegmentsToHref(rel.split('/').filter(Boolean)), external: false};
  }
  return null;
}
