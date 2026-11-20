// Build-time facts derived from the breeding table. Used by the guides and the
// Pal pages; never shipped to the browser.

import { recipeCounts, outcomes, parentsOf, planRoute, childOf } from './lib/breeding.mjs';

/** "Early-game" Pals: non-collab Pals whose lowest wild level in the game data is this or lower. */
export const EARLY_MAX_LEVEL = 10;

export function analyze(data) {
  const { pals } = data;
  const n = pals.length;
  const counts = recipeCounts(data);

  // Special recipes. PalCalc's documentation says a Pal produced by a special recipe
  // can only be produced that way. In the data these Pals have very few pairs (4 or
  // fewer); the Terraria collaboration Pals are also produced by fixed recipes, some
  // with many pairs. This is how we identify them; it is a derived label, not a flag
  // stored in the source data.
  const specialChildren = new Set();
  pals.forEach((p, i) => {
    if ((counts[i] >= 1 && counts[i] <= 4) || (p.collab && counts[i] >= 1)) specialChildren.add(i);
  });
  const specialRows = [];
  for (let b = 0; b < n; b++) {
    for (let a = 0; a < b; a++) {
      for (const o of outcomes(data, a, b)) if (specialChildren.has(o.child)) specialRows.push(o);
    }
  }
  specialRows.sort((x, y) =>
    pals[x.child].name.localeCompare(pals[y.child].name) || pals[x.a].name.localeCompare(pals[y.a]) || pals[x.b].name.localeCompare(pals[y.b]));

  const wildMin = pals.map((p) => (p.wildLevel ? p.wildLevel[0] : null));
  const catchable = (i) => !pals[i].collab && wildMin[i] != null;
  const earlySet = pals.map((p, i) => (catchable(i) && wildMin[i] <= EARLY_MAX_LEVEL ? i : -1)).filter((i) => i >= 0);

  /** Pairs of two wild-catchable parents, easiest first (lowest "higher parent wild level"). */
  function easiestRecipes(target, limit = 5) {
    return parentsOf(data, target)
      .filter((o) => o.a !== o.b && catchable(o.a) && catchable(o.b))
      .map((o) => ({ ...o, level: Math.max(wildMin[o.a], wildMin[o.b]), sum: wildMin[o.a] + wildMin[o.b] }))
      .sort((x, y) => x.level - y.level || x.sum - y.sum || pals[x.a].name.localeCompare(pals[y.a].name) || pals[x.b].name.localeCompare(pals[y.b].name))
      .slice(0, limit);
  }

  const routeCache = new Map();
  /** Fewest breeding steps starting only from the early-game Pals (null = not reachable). */
  function routeFromEarly(target) {
    if (!routeCache.has(target)) routeCache.set(target, planRoute(data, earlySet, target));
    return routeCache.get(target);
  }

  /** Fewest steps to `target` if every wild-catchable Pal up to this wild level can be obtained. */
  const capCache = new Map();
  function routeWithCap(target, cap) {
    const key = `${target}:${cap}`;
    if (!capCache.has(key)) {
      const start = pals.map((p, i) => i).filter((i) => catchable(i) && wildMin[i] <= cap);
      capCache.set(key, planRoute(data, start, target));
    }
    return capCache.get(key);
  }

  const byPower = pals.map((p, i) => i).sort((a, b) => pals[a].power - pals[b].power || pals[a].name.localeCompare(pals[b].name));
  const powerRank = new Array(n);
  byPower.forEach((i, k) => { powerRank[i] = k + 1; });

  return {
    counts,
    specialChildren,
    specialRows,
    earlySet,
    wildMin,
    catchable,
    easiestRecipes,
    routeFromEarly,
    routeWithCap,
    byPower,
    powerRank,
    summary: {
      palCount: n,
      collabPals: pals.filter((p) => p.collab).length,
      variantPals: pals.filter((p) => p.variant && !p.collab).length,
      breedableFromTwoSpecies: counts.filter((c) => c > 0).length,
      onlyFromItself: counts.filter((c) => c === 0).length,
      specialChildren: specialChildren.size,
      specialRows: specialRows.length,
      earlyPals: earlySet.length,
    },
  };
}

/**
 * The short Anubis chain that published guides describe, checked against our own breeding
 * table. Returns null if any step no longer gives the expected child, so a data update can
 * never leave a wrong route on the site (the tests then fail and flag it).
 */
export const ANUBIS_CHAIN = [
  ['Relaxaurus', 'Sparkit', 'Relaxaurus Lux'],
  ['Relaxaurus Lux', 'Moldron Cryst', 'Jormuntide'],
  ['Jormuntide', 'Blazehowl', 'Jormuntide Ignis'],
  ['Relaxaurus Lux', 'Jormuntide Ignis', 'Anubis'],
];

export function shortAnubisRoute(data) {
  const idx = (name) => data.pals.findIndex((p) => p.name === name);
  const steps = [];
  const made = new Set();
  const starters = [];
  for (const [a, b, c] of ANUBIS_CHAIN) {
    const [ia, ib, ic] = [idx(a), idx(b), idx(c)];
    if (ia < 0 || ib < 0 || ic < 0) return null;
    const r = childOf(data, ia, ib);
    if (r.child !== ic) return null;
    for (const x of [ia, ib]) if (!made.has(x) && !starters.includes(x)) starters.push(x);
    made.add(ic);
    steps.push({ a: ia, b: ib, ga: null, gb: null, child: ic });
  }
  return { steps, starters };
}
