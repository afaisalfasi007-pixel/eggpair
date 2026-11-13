// Guide pages. Every number comes from the data at build time or from the cited
// source; anything we could not verify is labelled as such on the page.

import { childOf } from './lib/breeding.mjs';

const MECHANICS_SOURCE = 'https://github.com/tylercamp/palcalc/blob/main/PALWORLD-BREEDING-MECHANICS.md';

export const GUIDE_LIST = [
  { path: '/guide/how-breeding-works/', title: 'How breeding works', blurb: 'The basic rule: breeding power, special recipes and gender.' },
  { path: '/guide/beginner-breeding/', title: 'Breeding for beginners', blurb: 'What you need, how the child is chosen and common mistakes.' },
  { path: '/guide/breeding-combinations/', title: 'Breeding combos (1.0)', blurb: 'How to find any pair fast, and why older guides can be wrong.' },
  { path: '/guide/breeding-power-chart/', title: 'Breeding power chart', blurb: 'Every Pal sorted by breeding power, with recipe counts.' },
  { path: '/guide/special-breeding-combos/', title: 'Special breeding combos', blurb: 'The fixed recipes that ignore the usual rule.' },
  { path: '/guide/breeding-mechanics/', title: 'Breeding mechanics', blurb: 'Species, passives, attacks, IVs and gender, with the odds.' },
  { path: '/guide/breeding-farm-and-cakes/', title: 'Breeding Farm and Cakes', blurb: 'What is confirmed about farms and Cakes, and what is not.' },
  { path: '/guide/how-to-breed-anubis/', title: 'How to breed Anubis', blurb: 'Recipes, routes and which 2024 recipes no longer work.' },
  { path: '/guide/easiest-breeding-routes/', title: 'Easiest breeding routes', blurb: 'The easiest pairs for popular Pals.' },
  { path: '/guide/how-to-use-the-calculator/', title: 'How to use EggPair', blurb: 'The calculator, finder, planner and My Pals list.' },
  { path: '/data-changelog/', title: 'Data version and changelog', blurb: 'Where the data comes from and how it was checked.' },
];

const niceDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]} ${y}`;
};

export function guidePages(ctx) {
  const { pals, data, A, verification: V, esc, palPath, icon } = ctx;
  const fmt = (n) => n.toLocaleString('en-US');
  const idx = (name) => pals.findIndex((p) => p.name === name);
  const a = (i) => `<a href="${palPath(pals[i])}">${esc(pals[i].name)}</a>`;
  const gw = { M: 'male', F: 'female' };
  const gtag = (g) => (g ? ` <small>(${gw[g]})</small>` : '');
  const sum = A.summary;
  const verified = niceDate(V.lastVerified);
  const table = (head, rows, cls = '') => `<div class="table-wrap"><table class="${cls}"><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  const tr = (...cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
  const versionBox = () => `<p class="note">${icon('info')}<span>Data: ${esc(V.versionLabel)}, PalCalc game-file export (DB v28). Last verified ${verified}. <a href="/data-changelog/">See what was checked</a>.</span></p>`;
  const related = (...paths) => `<h2>Related guides</h2><ul>${paths.map((p) => { const g = GUIDE_LIST.find((x) => x.path === p); return `<li><a href="${p}">${esc(g.title)}</a>: ${esc(g.blurb)}</li>`; }).join('')}</ul>`;
  const toolLinks = `<p class="btn-row"><a class="btn" href="/">${icon('egg')}<span>Calculator</span></a><a class="btn ghost" href="/find/">${icon('search')}<span>Find parents</span></a><a class="btn ghost" href="/planner/">${icon('route')}<span>Route planner</span></a></p>`;
  const stepList = (steps) => `<ul class="pairs">${steps.map((s) => `<li class="pair"><span class="side">${a(s.a)}${gtag(s.ga)}</span><span class="op">${icon('plus')}</span><span class="side">${a(s.b)}${gtag(s.gb)}<small class="with">gives ${esc(pals[s.child].name)}</small></span></li>`).join('')}</ul>`;
  const lv = (i) => (A.wildMin[i] == null ? 'n/a' : `Lv ${A.wildMin[i]}`);
  const easyTable = (target, limit) => {
    const rows = A.easiestRecipes(target, limit);
    if (!rows.length) return '<p class="muted">No pair of two wild-catchable Pals makes this Pal in the data.</p>';
    return table(['Parent 1', 'Parent 2', 'Higher wild level'], rows.map((o) => tr(`${a(o.a)}${gtag(o.ga)} <small>${lv(o.a)}</small>`, `${a(o.b)}${gtag(o.gb)} <small>${lv(o.b)}</small>`, `Lv ${o.level}`)));
  };
  const rankNote = 'Pairs are ranked by the higher of the two parents\' lowest wild levels in the game data (lower is easier to find). Where a Pal spawns, and whether it can be caught at all in your region, is not modelled.';

  const pages = [];
  const add = (p) => pages.push({ article: true, updated: V.lastVerified, ...p });

  // ---------------------------------------------------------------- hub
  add({
    path: '/guide/',
    crumb: 'Guides',
    title: 'Palworld Breeding Guides (1.0): Start Here',
    description: 'Plain-English Palworld breeding guides built on checked 1.0 data: combos, breeding power chart, special recipes, mechanics, Anubis and easy routes.',
    article: false,
    body: `<h1>Palworld breeding guides</h1>
<p class="lead">Short, practical guides that explain how Palworld breeding works and how to use the data on this site. Every guide shows the game version and what was checked.</p>
${versionBox()}
<h2>New to breeding?</h2>
<p>Start with <a href="/guide/beginner-breeding/">breeding for beginners</a>, then read <a href="/guide/how-breeding-works/">how breeding works</a>.</p>
<h2>All guides</h2>
<ul>${GUIDE_LIST.map((g) => `<li><a href="${g.path}">${esc(g.title)}</a>: ${esc(g.blurb)}</li>`).join('')}</ul>
<h2>Tools</h2>
${toolLinks}
<p class="muted small">EggPair is an unofficial fan project. Game details can change with updates; check anything important in the game.</p>`,
  });

  // ---------------------------------------------------------------- combos
  {
    const pb = idx('Penking'), bu = idx('Bushi');
    const avg = Math.floor((pals[pb].power + pals[bu].power + 1) / 2);
    const res = childOf(data, pb, bu).child;
    const old = [['Arsox', 'Pyrin'], ['Caprity', 'Beakon'], ['Eikthyrdeer', 'Beakon'], ['Incineram', 'Surfent'], ['Penking', 'Bushi']];
    add({
      path: '/guide/breeding-combinations/',
      crumb: 'Breeding combos',
      title: 'Palworld Breeding Combos (1.0): How to Find Any Pair',
      description: 'How Palworld 1.0 breeding combos work, how to find the pair you need fast, and why older guides can give wrong results. Based on checked game data.',
      body: `<h1>Palworld breeding combos (1.0)</h1>
<p class="lead">A breeding combo is two parent Pals and the Pal that hatches from them. This guide shows how to find the pair you need and what to watch out for.</p>
${versionBox()}
<h2>How many combos are there?</h2>
<ul>
  <li><strong>${sum.palCount}</strong> Pals in the data (including ${sum.collabPals} Terraria collaboration Pals and ${sum.variantPals} variant forms).</li>
  <li><strong>${sum.breedableFromTwoSpecies}</strong> of them can hatch from two <em>different</em> Pals. The other <strong>${sum.onlyFromItself}</strong> only hatch from two of their own kind.</li>
  <li><strong>${fmt(data.breeding.tri.length)}</strong> parent pairs (counting each pair once, in any order).</li>
  <li><strong>${sum.specialRows}</strong> of those are <a href="/guide/special-breeding-combos/">special recipes</a>. Only one pair, Katress and Wixen, gives a different Pal depending on which parent is male.</li>
</ul>
<h2>Three ways to find the pair you need</h2>
<ol>
  <li><a href="/">Calculator</a>: pick two parents and see the child.</li>
  <li><a href="/find/">Parent finder</a>: pick the Pal you want and see every pair that makes it. Turn on the filter to show only pairs you own.</li>
  <li><a href="/planner/">Route planner</a>: tick the Pals you own on <a href="/my-pals/">My Pals</a> and get the fewest breeding steps to your target.</li>
</ol>
${toolLinks}
<h2>The rule behind most combos</h2>
<p>Every Pal has a hidden breeding power number. For most pairs, the game adds the two parents' numbers, divides by two, rounds up, and hatches the Pal whose number is closest. Example from the data: ${a(pb)} (${pals[pb].power}) and ${a(bu)} (${pals[bu].power}) average to ${avg}. The closest Pal is ${a(res)} (${pals[res].power}). See the <a href="/guide/breeding-power-chart/">breeding power chart</a> for every number.</p>
<h2>Special combos ignore that rule</h2>
<p>Some Pals only come from fixed recipes. If you want one of them, the list in the <a href="/guide/special-breeding-combos/">special combos guide</a> is the only way in, apart from catching one.</p>
<h2>Why older guides can be wrong</h2>
<p>Palworld 1.0 changed many recipes, so lists written for earlier versions can send you to the wrong Pal. Some older guides (we have not linked a specific guide) listed the pairs below as Anubis recipes. <strong>Unverified:</strong> that those guides gave these exact pairs. What we do know is what each pair hatches in the 1.0 data used here:</p>
${table(['Old Anubis recipe', 'Hatches in 1.0 data', 'Still Anubis?'], old.map(([x, y]) => { const c = childOf(data, idx(x), idx(y)).child; return tr(`${a(idx(x))} + ${a(idx(y))}`, c == null ? 'Depends on gender' : a(c), c === idx('Anubis') ? 'Yes' : 'No'); }))}
<p>Read <a href="/guide/how-to-breed-anubis/">how to breed Anubis</a> for the current recipes.</p>
<h2>Quick tips</h2>
<ul>
  <li>The order of the two parents does not matter.</li>
  <li>You need one male and one female for every pair.</li>
  <li>Always check the game version on a guide before spending Cakes on it. This site shows it on every page.</li>
  <li>EggPair shows the species only. It does not calculate passive skills, IVs or attacks (see <a href="/guide/breeding-mechanics/">breeding mechanics</a>).</li>
</ul>
${related('/guide/beginner-breeding/', '/guide/breeding-power-chart/', '/guide/easiest-breeding-routes/')}`,
    });
  }

  // ---------------------------------------------------------------- power chart
  {
    const nonCollab = A.byPower.filter((i) => !pals[i].collab);
    const low = nonCollab.slice(0, 4), high = nonCollab.slice(-3).reverse();
    const tag = (i) => (pals[i].collab ? 'Collab' : A.specialChildren.has(i) ? 'Special recipe' : A.counts[i] === 0 ? 'Only from itself' : pals[i].variant ? 'Variant' : '');
    add({
      path: '/guide/breeding-power-chart/',
      crumb: 'Breeding power chart',
      title: 'Palworld Breeding Power Chart: All 299 Pals (1.0)',
      description: 'Every Pal\'s breeding power in Palworld 1.0, sorted from lowest to highest, with recipe counts and links to each Pal\'s breeding page.',
      body: `<h1>Palworld breeding power chart (1.0)</h1>
<p class="lead">Every Pal has a breeding power number in the game data. The game uses it to choose the child of most pairs. This chart lists all ${sum.palCount} Pals from the lowest number to the highest.</p>
${versionBox()}
<h2>How to read the chart</h2>
<ul>
  <li><strong>Power</strong> is the number the breeding rule uses. It is not a strength rating.</li>
  <li><strong>Pairs</strong> is how many pairs of two different Pals hatch that Pal. "0" means it only hatches from two of its own kind.</li>
  <li>In this data the lowest numbers are ${low.map((i) => `${a(i)} (${pals[i].power})`).join(', ')}. The highest, apart from the collaboration Pals, are ${high.map((i) => `${a(i)} (${pals[i].power})`).join(', ')}.</li>
</ul>
<h2>The rule in one example</h2>
<p>Add the two parents' powers, divide by two and round up. The child is the Pal with the closest power. If two Pals are equally close, the game uses a priority value from its data, and then the order of its tables (source: <a href="${MECHANICS_SOURCE}" rel="noopener">PalCalc's mechanics notes</a>). Special recipes skip this rule. Details are in <a href="/guide/how-breeding-works/">how breeding works</a> and <a href="/guide/breeding-combinations/">breeding combos</a>.</p>
<h2>All ${sum.palCount} Pals by breeding power</h2>
${table(['#', 'Pal', 'Power', 'Paldeck', 'Pairs', 'Note'], A.byPower.map((i) => tr(String(A.powerRank[i]), a(i), String(pals[i].power), ctx.dexLabel(pals[i]), fmt(A.counts[i]), tag(i))), 'chart')}
${related('/guide/breeding-combinations/', '/guide/special-breeding-combos/', '/guide/easiest-breeding-routes/')}`,
    });
  }

  // ---------------------------------------------------------------- beginner
  add({
    path: '/guide/beginner-breeding/',
    crumb: 'Breeding for beginners',
    title: 'Palworld Breeding for Beginners (1.0): Step by Step',
    description: 'A beginner\'s guide to breeding Pals in Palworld 1.0: what you need, how the child is chosen, and how to plan a pair with a free calculator.',
    body: `<h1>Palworld breeding for beginners (1.0)</h1>
<p class="lead">Breeding lets you hatch Pals you cannot easily catch. This guide covers the basics and how to plan your first pair.</p>
${versionBox()}
<h2>What you need</h2>
<ul>
  <li>A Breeding Farm at your base.</li>
  <li>One male and one female Pal. Two Pals of the same gender will not breed.</li>
  <li>A Cake in the farm's feed box.</li>
  <li>An Egg Incubator to hatch the egg.</li>
</ul>
<p class="note">${icon('info')}<span>This list is the setup that several 1.0 guides describe. We have not tested every detail in the game ourselves, and we cannot confirm unlock levels, Cake recipes or timers. See <a href="/guide/breeding-farm-and-cakes/">what we can and cannot confirm</a>.</span></p>
<h2>How the game picks the child</h2>
<ul>
  <li><strong>Species:</strong> usually decided by the parents' breeding power. A few Pals only come from special fixed recipes. This is what EggPair calculates.</li>
  <li><strong>Gender:</strong> set by the child species' own male/female ratio, not by the parents.</li>
  <li><strong>Passives, attacks and IVs:</strong> inherited from the parents by separate rules, with some luck involved. EggPair does not calculate these. See <a href="/guide/breeding-mechanics/">breeding mechanics</a>.</li>
</ul>
<h2>Your first breeding, step by step</h2>
<ol>
  <li>Pick the Pal you want. Search for it in the <a href="/pals/">Pal list</a>.</li>
  <li>Open its page or the <a href="/find/">parent finder</a> to see every pair that makes it.</li>
  <li>Check which pairs you can build from Pals you already own. Tick them on <a href="/my-pals/">My Pals</a> and the finder can filter for you.</li>
  <li>If no pair works yet, use the <a href="/planner/">route planner</a>. It finds the fewest breeding steps from the Pals you own.</li>
  <li>Make sure you have a male and a female of each parent, then breed.</li>
</ol>
<h2>Common mistakes</h2>
<ul>
  <li><strong>Using an old guide.</strong> Palworld 1.0 changed many recipes. Check the version first (see <a href="/guide/breeding-combinations/">breeding combos</a> for examples).</li>
  <li><strong>Expecting the calculator to pick passives.</strong> It only shows the species.</li>
  <li><strong>Forgetting the one gender-dependent pair.</strong> Katress and Wixen give different Pals depending on which parent is male.</li>
  <li><strong>Trying to breed a Pal that only hatches from itself.</strong> ${sum.onlyFromItself} Pals have no recipe from two different Pals. The <a href="/guide/special-breeding-combos/">special combos guide</a> lists them.</li>
</ul>
${toolLinks}
${related('/guide/how-breeding-works/', '/guide/breeding-combinations/', '/guide/how-to-use-the-calculator/')}`,
  });

  // ---------------------------------------------------------------- farm and cakes
  add({
    path: '/guide/breeding-farm-and-cakes/',
    crumb: 'Breeding Farm and Cakes',
    title: 'Breeding Farm and Cakes in Palworld 1.0: What Is Confirmed',
    description: 'What is confirmed about the Breeding Farm and Cakes in Palworld 1.0, and what is not: Special Cake effects, IV bonus Cakes and unverified details.',
    body: `<h1>Breeding Farm and Cakes in Palworld 1.0</h1>
<p class="lead">Many guides repeat farm and Cake details that nobody has checked. This page separates what is confirmed from what is only reported.</p>
${versionBox()}
<h2>Confirmed</h2>
<p>These points come from <a href="${MECHANICS_SOURCE}" rel="noopener">PalCalc's published research</a> on the game files for version ${esc(V.mechanicsVerifiedFor)}. It is static analysis of the game data, not live testing.</p>
<ul>
  <li><strong>Special Cake</strong> (internal name Cake05): both passive-count rolls are replaced by a target of four passives. If the parents have fewer than four between them, the child inherits all of them and the game tries to fill the rest with random passives. The child also inherits all eligible equipped attacks from both parents, instead of just one.</li>
  <li><strong>Mushroom Cake</strong> (Cake02) and <strong>Extravagant Vegetable Cake</strong> (Cake04): add a separate bonus of 1 to 5 to each ordinary offspring IV, capped at 100.</li>
  <li>Other breeding items exist with different effects.</li>
  <li>For farm-bred eggs, the child's species, gender, IVs, passives and inherited attacks are determined when the egg is produced. (PalCalc's notes cover farm-bred eggs; eggs picked up in the world have extra effects that are not covered here.)</li>
</ul>
<h2>Reported by guides, not checked by us</h2>
<ul>
  <li>Palworld 1.0 added four new Cakes besides the original, an automated Ancient Hatchery and a Babysitter passive (see for example <a href="https://allthings.how/everything-that-changed-about-breeding-in-palworld-1-0/" rel="noopener">allthings.how's summary of the 1.0 breeding changes</a>). Confirm them against the official patch notes.</li>
</ul>
<h2>Not verified</h2>
<ul>
  <li>Unlock levels for the Breeding Farm and Cakes.</li>
  <li>Cake recipes and ingredient amounts.</li>
  <li>How long a farm takes to produce an egg. PalCalc states that the exact farm timing formula has not been assessed.</li>
  <li>The effects of the new Cakes other than those listed above.</li>
</ul>
<p>For anything in the last list, check the item descriptions in your game.</p>
${related('/guide/breeding-mechanics/', '/guide/beginner-breeding/', '/data-changelog/')}`,
  });

  // ---------------------------------------------------------------- special combos
  add({
    path: '/guide/special-breeding-combos/',
    crumb: 'Special breeding combos',
    title: `Palworld Special Breeding Combos (1.0): All ${sum.specialRows} Recipes`,
    description: `Every special (fixed) breeding recipe in our Palworld 1.0 data: ${sum.specialRows} parent pairs for ${sum.specialChildren} Pals, with gender notes and how we count them.`,
    body: `<h1>Palworld special breeding combos (1.0)</h1>
<p class="lead">Most pairs follow the breeding power rule. Special combos are fixed recipes that ignore it. The game checks them first.</p>
${versionBox()}
<h2>What counts as special</h2>
<p>PalCalc's research says the game looks for a matching special recipe first, and that a Pal made by a special recipe can only be made that way. Some recipes also need a certain parent gender. The source data does not label recipes as special, so we derive them: a recipe is special if it makes a Pal that has four or fewer pairs of different Pals, or one of the Terraria collaboration Pals.</p>
<p>That gives <strong>${sum.specialRows}</strong> recipes for <strong>${sum.specialChildren}</strong> Pals in this data. Other sites report 131, 134 and 137 special combos (<strong>unverified</strong>: we read these numbers on those sites and could not re-check them for this update). We matched the recipe counts of the collaboration Pals against one of them, but could not explain the difference in the total, so treat our total as our own count. See the <a href="/data-changelog/">changelog page</a>.</p>
<h2>Gender matters for one pair</h2>
<p>Katress and Wixen give ${a(idx('Katress Ignis'))} when Katress is female and Wixen is male, and ${a(idx('Wixen Noct'))} when Katress is male and Wixen is female.</p>
<h2>All ${sum.specialRows} special recipes</h2>
${table(['Hatches', 'Parent 1', 'Parent 2'], A.specialRows.map((o) => tr(a(o.child), `${a(o.a)}${gtag(o.ga)}`, `${a(o.b)}${gtag(o.gb)}`)), 'chart')}
<h2>Pals that only hatch from two of their own kind</h2>
<p>These ${sum.onlyFromItself} Pals have no recipe from two different Pals in the data. You need a male and a female of the same Pal. How to obtain the first pair is not something this data shows.</p>
<p class="chips">${A.counts.map((c, i) => (c === 0 ? i : -1)).filter((i) => i >= 0).sort((x, y) => pals[x].name.localeCompare(pals[y].name)).map((i) => ctx.palLink(pals[i])).join('')}</p>
${related('/guide/breeding-combinations/', '/guide/breeding-power-chart/', '/guide/easiest-breeding-routes/')}`,
  });

  // ---------------------------------------------------------------- mechanics
  add({
    path: '/guide/breeding-mechanics/',
    crumb: 'Breeding mechanics',
    title: 'Palworld Breeding Mechanics: Species, Passives, IVs, Gender',
    description: 'How Palworld breeding picks a child\'s species, passives, attacks, IVs and gender, with the odds from PalCalc\'s published research (game version 1.0.5).',
    body: `<h1>Palworld breeding mechanics</h1>
<p class="lead">How the game decides the species, gender, passive skills, attacks and IVs of a bred Pal. EggPair only calculates the species; the rest is here so you know what to expect.</p>
${versionBox()}
<p class="note">${icon('info')}<span>Source: <a href="${MECHANICS_SOURCE}" rel="noopener">PalCalc's breeding mechanics notes</a> (MIT licence, by Tyler Camp), which report their findings as verified for game version ${esc(V.mechanicsVerifiedFor)}. That is static analysis of the game files, not live testing. We summarise it in our own words; read the source for the full detail.</span></p>
<h2>Species</h2>
<ol>
  <li>The game first looks for a special recipe that matches the parents (and their genders where needed). If one matches, that is the child.</li>
  <li>Otherwise it averages the parents' breeding powers, rounds up, and picks the eligible Pal with the closest power.</li>
  <li>Special-recipe children, bosses and some other species are not eligible for this step.</li>
  <li>Ties go to the higher breeding priority, then to the first entry in the game's table.</li>
  <li>Sometimes the result can be replaced by an Alpha or boss form.</li>
</ol>
<p>EggPair shows the result of steps 1 to 4. A flower-crowned Gumoss pair is one known exception to the simple "same Pal gives the same Pal" rule: in the game it selects the ordinary Gumoss.</p>
<h2>Passive skills</h2>
<p>The parents' passives are combined and duplicates are removed. Then two rolls happen: how many to inherit, and how many random passives to add. With the default game weights:</p>
${table(['Passives asked from parents', 'Chance', 'Random extra attempts', 'Chance'], [tr('1', '40%', '0', '40%'), tr('2', '30%', '1', '30%'), tr('3', '20%', '2', '20%'), tr('4', '10%', '3', '10%')])}
<ul>
  <li>How the passives are split between the parents does not matter. Having the same passive on both parents does not make it more likely.</li>
  <li>Extra unwanted passives lower the chance of getting the one you want.</li>
  <li>The inherit number is an upper limit. If the parents only have two unique passives, the child gets at most those two.</li>
  <li>If a parent has at least one passive, the child always has at least one.</li>
  <li>An apparent bug in the game can occasionally make it skip a random passive. PalCalc calculates the highest chance at about 1.6% per egg for ordinary breeding and 3.9% with Special Cakes.</li>
</ul>
<h2>Special Cakes</h2>
<p>A Special Cake makes the game aim for four passives and inherit all eligible equipped attacks from both parents. See <a href="/guide/breeding-farm-and-cakes/">Breeding Farm and Cakes</a>.</p>
<h2>Attacks</h2>
<ol>
  <li>The parents' equipped attacks are combined and duplicates removed.</li>
  <li>Attacks that cannot be inherited (including Pal-exclusive ones) are removed.</li>
  <li>One of the remaining attacks is picked at random.</li>
  <li>The child also gets everything its species learns at level one.</li>
</ol>
<p>Only equipped attacks count. With a Special Cake the child inherits all eligible equipped attacks instead of one.</p>
<h2>IVs</h2>
<p>IVs are the hidden HP, Attack and Defense values. The game first picks one of three patterns:</p>
${table(['Pattern', 'Calculated chance', 'Stats taken from the parents'], [tr('First', '50%', 'One of HP, Attack or Defense'), tr('Second', '33%', 'Two or three stats (HP is always included)'), tr('Third', '16%', 'All three')])}
<p>Each inherited stat is taken from one parent at random (50/50). Stats not taken from the parents get a fresh random value from 0 to 100. Because HP is always part of the middle pattern, the odds for HP differ from those for Attack or Defense. Mushroom Cake and Cake04 add a bonus after this.</p>
<h2>Mutation</h2>
<p>A mutation skips the special recipes, uses a different randomised power calculation for the species, and gives fresh IVs in the range 90 to 100 instead of inheriting them. EggPair does not model mutation.</p>
<h2>Gender</h2>
<p>The child's gender follows the chosen species' own male/female ratio, for ordinary and mutated eggs. A few special encounter forms (some raid and tower forms) have fixed or no gender. You can see each species' ratio on its Pal page under "Gender when bred".</p>
<h2>What EggPair does not model</h2>
<ul>
  <li>Passives, IVs and attacks of the child.</li>
  <li>Mutation, Alpha and boss replacement.</li>
  <li>Egg production and hatching times (PalCalc says the farm timing formula has not been assessed).</li>
</ul>
<p>For passive and IV planning, the free Windows tool <a href="https://github.com/tylercamp/palcalc" rel="noopener">PalCalc</a> reads your save file.</p>
${related('/guide/how-breeding-works/', '/guide/breeding-farm-and-cakes/', '/guide/beginner-breeding/')}`,
  });

  // ---------------------------------------------------------------- Anubis
  {
    const an = idx('Anubis');
    const old = [['Arsox', 'Pyrin'], ['Caprity', 'Beakon'], ['Eikthyrdeer', 'Beakon'], ['Incineram', 'Surfent'], ['Penking', 'Bushi']];
    const route = A.routeFromEarly(an);
    add({
      path: '/guide/how-to-breed-anubis/',
      crumb: 'How to breed Anubis',
      title: 'How to Breed Anubis in Palworld 1.0: Recipes and Routes',
      description: 'Anubis breeding in Palworld 1.0: its breeding power, how many parent pairs make it, the easiest pairs of catchable Pals, and why 2024 recipes no longer work.',
      body: `<h1>How to breed Anubis in Palworld 1.0</h1>
<p class="lead">Anubis is one of the most searched breeding targets. In the 1.0 data it can be hatched from many pairs, but none of the easy early-game ones.</p>
${versionBox()}
<h2>Quick facts (from the data)</h2>
<ul>
  <li>Breeding power: <strong>${pals[an].power}</strong>, number ${A.powerRank[an]} of ${sum.palCount} from the lowest (see the <a href="/guide/breeding-power-chart/">chart</a>).</li>
  <li><strong>${fmt(A.counts[an])}</strong> pairs of different Pals hatch it, plus two Anubis. Full list: <a href="${palPath(pals[an])}">Anubis page</a>.</li>
  <li>It follows the normal breeding power rule. It is not a special recipe, and gender does not change the result.</li>
</ul>
<h2>Do the 2024 recipes still work?</h2>
<p>Not in the 1.0 data used here. <strong>Unverified:</strong> we have not linked a specific older guide, so we cannot show who listed these pairs or when. Here is what each pair hatches in this data:</p>
${table(['Old recipe', 'Hatches in 1.0 data', 'Still Anubis?'], old.map(([x, y]) => { const c = childOf(data, idx(x), idx(y)).child; return tr(`${a(idx(x))} + ${a(idx(y))}`, c == null ? 'Depends on gender' : a(c), c === an ? 'Yes' : 'No'); }))}
<h2>The easiest pairs in the 1.0 data</h2>
<p>${esc(rankNote)}</p>
${easyTable(an, 6)}
<p class="muted small">These parents have high wild levels, so Anubis is a late-game breeding target in this data. <strong>Unverified:</strong> some people say 1.0 moved powerful Pals later; we did not check that claim and have no source for it.</p>
<h2>Starting only from early-game Pals</h2>
${route && !route.owned ? `<p>If you start only from the ${sum.earlyPals} Pals whose lowest wild level is ${ctx.EARLY_MAX_LEVEL} or below, the fewest steps to Anubis is <strong>${route.steps.length}</strong>. That is a long chain. Add Pals you already own on <a href="/my-pals/">My Pals</a> and the <a href="/planner/#t=anubis">planner</a> will shorten it.</p><details class="more"><summary>${icon('chevron')}<span>Show the ${route.steps.length} steps</span></summary>${stepList(route.steps)}</details><p class="muted small">Assumes you can get a male and a female for every step. It plans species only.</p>` : '<p>No route was found from the early-game Pals.</p>'}
<h2>Tips</h2>
<ul>
  <li>Use the <a href="/find/#t=anubis">parent finder</a> with the "only pairs I own" filter to see what you can already make.</li>
  <li>This page covers species. For passives and IVs on your Anubis, read <a href="/guide/breeding-mechanics/">breeding mechanics</a>.</li>
</ul>
${related('/guide/easiest-breeding-routes/', '/guide/breeding-combinations/', '/guide/beginner-breeding/')}`,
    });
  }

  // ---------------------------------------------------------------- easiest routes
  {
    const targets = ['Anubis', 'Astegon', 'Blazamut', 'Knocklem', 'Splatterina', 'Jormuntide', 'Suzaku', 'Blazehowl', 'Silvegis', 'Relaxaurus', 'Kitsun', 'Yakumo', 'Bushi', 'Beegarde', 'Penking', 'Katress']
      .map(idx).filter((i) => i >= 0 && A.counts[i] > 0);
    const special = ['Relaxaurus Lux', 'Katress Ignis', 'Wixen Noct', 'Celesdir', 'Dinossom Lux'].map(idx).filter((i) => i >= 0 && A.counts[i] > 0);
    const noRecipe = ['Orserk', 'Shadowbeak', 'Frostallion', 'Lyleen', 'Jetragon', 'Selyne', 'Bastigor', 'Faleris', 'Xenolord', 'Neptilius', 'Paladius', 'Necromus', 'Hartalis', 'Grizzbolt'].map(idx).filter((i) => i >= 0 && A.counts[i] === 0);
    const routeLine = (i) => {
      const r = A.routeFromEarly(i);
      if (!r) return 'Not reachable from the early-game Pals.';
      if (r.owned) return 'This is an early-game Pal.';
      return `<a href="/planner/#t=${esc(pals[i].slug)}">${r.steps.length} step${r.steps.length === 1 ? '' : 's'}</a> from the early-game Pals.`;
    };
    const section = (i) => `<h3>${a(i)}</h3><p class="muted small">Breeding power ${pals[i].power}. ${fmt(A.counts[i])} pair${A.counts[i] === 1 ? '' : 's'}. ${routeLine(i)}</p>${easyTable(i, 3)}`;
    add({
      path: '/guide/easiest-breeding-routes/',
      crumb: 'Easiest breeding routes',
      title: 'Easiest Breeding Routes for Popular Pals (Palworld 1.0)',
      description: 'For popular Pals in Palworld 1.0: the easiest parent pairs of catchable Pals and the fewest breeding steps from early-game Pals, from checked data.',
      body: `<h1>Easiest breeding routes for popular Pals (1.0)</h1>
<p class="lead">Which pair should you try first? For each popular target below, this page shows the easiest pairs in the data and how many steps it takes from the earliest Pals.</p>
${versionBox()}
<h2>How we rank</h2>
<ul>
  <li><strong>Easiest pairs:</strong> ${esc(rankNote)}</li>
  <li><strong>Steps from early-game Pals:</strong> the fewest breeding steps if you start only from the ${sum.earlyPals} Pals whose lowest wild level is ${ctx.EARLY_MAX_LEVEL} or below, using the same planner as the <a href="/planner/">route planner</a>. It plans species only and assumes you can get a male and a female for every step.</li>
  <li>These are our own calculations from the breeding table, not tested in the game. Passives and IVs are not planned.</li>
</ul>
<h2>Popular targets</h2>
${targets.map(section).join('')}
<h2>Special recipes</h2>
<p>These Pals only come from fixed recipes (see <a href="/guide/special-breeding-combos/">special combos</a>).</p>
${special.map(section).join('')}
<h2>Pals with no recipe from two different Pals</h2>
<p>People often search "how to breed" for these. In the data they only hatch from two of their own kind, so there is no pair of other Pals to look for. How to obtain the first male and female is not something this data shows; check the game or official sources.</p>
<p class="chips">${noRecipe.map((i) => ctx.palLink(pals[i])).join('')}</p>
${related('/guide/how-to-breed-anubis/', '/guide/special-breeding-combos/', '/guide/how-to-use-the-calculator/')}`,
    });
  }

  // ---------------------------------------------------------------- how to use
  add({
    path: '/guide/how-to-use-the-calculator/',
    crumb: 'How to use EggPair',
    title: 'How to Use the EggPair Palworld Breeding Calculator',
    description: 'Step-by-step help for EggPair\'s breeding calculator, parent finder, route planner and My Pals list, including shareable links and phone tips.',
    body: `<h1>How to use the EggPair breeding calculator</h1>
<p class="lead">EggPair has four tools. Everything runs in your browser; nothing is sent to a server.</p>
${versionBox()}
<h2>1. Calculator: two parents, one child</h2>
<p>Open the <a href="/">calculator</a>, pick Parent 1 and Parent 2 (search by name or Paldeck number). The child appears at once. Use the swap button to flip the parents. If the pair depends on gender, both results are shown with the genders.</p>
<h2>2. Parent finder: every pair for a target</h2>
<p>Open the <a href="/find/">parent finder</a> and pick the Pal you want. Turn on "Only pairs where I own both parents" to filter by your <a href="/my-pals/">My Pals</a> list, or type a Pal's name to narrow the list.</p>
<h2>3. Route planner: fewest steps</h2>
<p>Tick the Pals you own on <a href="/my-pals/">My Pals</a>, then pick a target in the <a href="/planner/">planner</a>. It lists each step in order. It plans species only and assumes you can get a male and a female for each step. Steps that depend on gender say which parent must be male.</p>
<h2>4. My Pals: your collection</h2>
<p>The list is saved in your browser only. Use "Export backup" to save it as a file and "Import backup" to restore it, for example on another phone. "Clear all" unticks everything.</p>
<h2>Share a result</h2>
<p>The calculator, finder and planner put your choices in the web address, for example <code>/?a=lamball&amp;b=cattiva</code>. Copy the address to share it. Pal pages also have buttons that open the tools with that Pal already chosen.</p>
<h2>What the tools do not do</h2>
<ul>
  <li>They show species only, not passives, IVs or attacks.</li>
  <li>The planner does not know where Pals spawn or which you can catch.</li>
  <li>Results follow the data version shown on every page. If your game is newer, check the <a href="/data-changelog/">changelog</a>.</li>
</ul>
<h2>Tips for phones</h2>
<ul>
  <li>Use the tab bar at the bottom to switch tools.</li>
  <li>The search lists open when you tap a field; type a few letters to narrow them.</li>
  <li>If a tool will not load, check your connection and reload. The data file loads once and is then cached.</li>
</ul>
${related('/guide/beginner-breeding/', '/guide/breeding-combinations/', '/data-changelog/')}`,
  });

  // ---------------------------------------------------------------- changelog
  add({
    path: '/data-changelog/',
    crumb: 'Data version and changelog',
    title: 'Palworld Breeding Data: Version, Checks and Changelog',
    description: 'Where EggPair\'s Palworld breeding data comes from, which game version it matches, how it was checked, what could not be verified, and the change history.',
    body: `<h1>Data version and changelog</h1>
<p class="lead">${esc(V.summary.replace(' as described on the changelog page.', ' as described below.'))}</p>
<h2>Current status</h2>
${table(['Item', 'Value'], [
  tr('Game version label', esc(V.versionLabel)),
  tr('Rules verified by PalCalc research for', esc(V.mechanicsVerifiedFor)),
  tr('Last verified by EggPair', verified),
  tr('Source', `<a href="${esc(V.upstream.repository)}" rel="noopener">PalCalc</a> by Tyler Camp, ${esc(V.upstream.licence)} licence`),
  tr('Imported commit', `<code>${esc(V.upstream.importedCommit.slice(0, 7))}</code> (${niceDate(V.upstream.importedCommitDate)})`),
  tr('Latest upstream commit checked', `<code>${esc(V.upstream.checkedCommit.slice(0, 7))}</code> (${niceDate(V.upstream.checkedCommitDate)})`),
  tr('Pals / parent pairs', `${sum.palCount} / ${fmt(data.breeding.tri.length)}`),
  tr('Special recipes (our count)', `${sum.specialRows} for ${sum.specialChildren} Pals`),
])}
<p>${esc(V.upstream.otherChanges)} ${esc(V.upstream.lastDataRegenerationForGameUpdate)}</p>
<h2>What we checked</h2>
<ul>${V.externalChecks.map((c) => `<li><strong>${esc(c.source)}</strong> (${niceDate(c.date)}): ${esc(c.result)} <em>Limit: ${esc(c.caveat)}</em></li>`).join('')}</ul>
<p>These are our own checks. We have not tested all ${fmt(data.breeding.tri.length)} pairs in the live game, and we do not claim the data is perfect.</p>
<h2>Counts compared with other sites</h2>
<ul>
  <li>We list ${sum.palCount} Pals. One entry, Gumoss (Flower), is a separate form of Gumoss; another source lists ${sum.palCount - 2}, and a third says 298 breedable Pals. The differences are consistent with counting forms and Panthalus differently, but we could not confirm that.</li>
  <li>We count ${sum.specialRows} special recipes; other sites report 131, 134 and 137. <strong>Unverified:</strong> these are figures from those sites that we could not re-check.</li>
  <li>Sites also differ on the total number of combinations (figures of 44,254 and 47,588 were reported to us against our ${fmt(data.breeding.tri.length)}). <strong>Unverified:</strong> we could not re-check those figures and do not know why they differ. We do not rely on them.</li>
</ul>
<h2>Known issues and limits</h2>
<ul>${Object.entries(V.notes).map(([slug, n]) => { const i = pals.findIndex((p) => p.slug === slug); return `<li><strong>${i >= 0 ? a(i) : esc(slug)}:</strong> ${esc(n)}</li>`; }).join('')}${V.limitations.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
<h2>History</h2>
${V.history.map((h) => `<h3>${niceDate(h.date)}: ${esc(h.title)}</h3><ul>${h.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>`).join('')}
<h2>Report a problem</h2>
<p>If a result does not match your game, please tell us the two parents, their genders and your game version on the <a href="/contact/">contact page</a>.</p>
<p class="muted small">See also: <a href="/data-sources/">data sources and licence</a>.</p>`,
  });

  return pages;
}
