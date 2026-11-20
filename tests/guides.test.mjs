// Guides, data-version page and data verification record.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { analyze, shortAnubisRoute, ANUBIS_CHAIN } from '../src/insights.mjs';
import { childOf, outcomes } from '../src/lib/breeding.mjs';
import { GUIDE_LIST } from '../src/guides.mjs';

const root = new URL('../', import.meta.url).pathname;
const read = (f) => JSON.parse(readFileSync(root + 'data/' + f, 'utf8'));
const data = { pals: read('pals.json'), breeding: read('breeding.json') };
const V = read('verification.json');
const A = analyze(data);
const built = existsSync(root + 'dist/index.html');
const page = (p) => readFileSync(root + 'dist' + p + 'index.html', 'utf8');

test('verification.json matches the numbers computed from the data', () => {
  assert.deepEqual(V.internalChecks, A.summary);
});

test('every special recipe really is an outcome of its parents, and rows are unique', () => {
  const seen = new Set();
  for (const o of A.specialRows) {
    const hit = outcomes(data, o.a, o.b).find((x) => x.ga === o.ga && x.gb === o.gb);
    assert.ok(hit && hit.child === o.child, `${data.pals[o.a].name} + ${data.pals[o.b].name}`);
    const k = [o.a, o.ga, o.b, o.gb, o.child].join();
    assert.ok(!seen.has(k)); seen.add(k);
  }
});

test('planned routes are valid step by step, including gender-dependent steps', () => {
  let genderSteps = 0;
  for (const name of ['Anubis', 'Astegon', 'Kitsun', 'Suzaku']) {
    const t = data.pals.findIndex((p) => p.name === name);
    const r = A.routeFromEarly(t);
    assert.ok(r && r.steps.length > 0, name);
    const have = new Set(A.earlySet);
    for (const s of r.steps) {
      assert.ok(have.has(s.a) && have.has(s.b), `${name}: parent not owned`);
      const plain = childOf(data, s.a, s.b);
      if (plain.child == null) {
        genderSteps++;
        assert.ok(s.ga && s.gb, `${name}: gender-dependent step has no genders`);
        const g = childOf(data, s.a, s.b, s.ga, s.gb);
        assert.equal(g.child, s.child, `${name}: wrong gendered child`);
      } else {
        assert.equal(plain.child, s.child, `${name}: wrong child`);
      }
      have.add(s.child);
    }
    assert.ok(have.has(t), `${name}: target not reached`);
  }
  assert.ok(genderSteps > 0, 'no gender-dependent step was exercised');
});

test('data-sources page shows the full MIT notice', { skip: !built && 'run npm run build first' }, () => {
  const h = page('/data-sources/');
  const lic = readFileSync(root + 'data/LICENSE-PalCalc.txt', 'utf8').trim();
  assert.ok(h.includes('Copyright 2024, Tyler Camp'));
  assert.ok(h.includes('Permission is hereby granted, free of charge'));
  assert.ok(h.includes(lic.split('\n').at(-1).slice(0, 40)));
});

test('guide pages exist, are in the hub and carry the data version', { skip: !built && 'run npm run build first' }, () => {
  const hub = page('/guide/');
  for (const g of GUIDE_LIST) {
    assert.ok(existsSync(root + 'dist' + g.path + 'index.html'), g.path);
    assert.ok(hub.includes(`href="${g.path}"`) || hub.includes(`${g.path}"`), `hub misses ${g.path}`);
    if (g.path !== '/data-changelog/') assert.match(page(g.path), /last verified|Last verified/);
  }
});

test('Pal pages have no internal query-string links', { skip: !built && 'run npm run build first' }, () => {
  for (const p of data.pals.slice(0, 40)) {
    const h = page(`/pals/${p.slug}/`);
    assert.ok(!/href="[^"]*\/(?:find|planner)?\/?\?[ta]=/.test(h), p.slug);
    assert.ok(/#t=/.test(h) && /#a=/.test(h));
  }
});

test('sitemap lists the guides with the verification date', { skip: !built && 'run npm run build first' }, () => {
  const sm = readFileSync(root + 'dist/sitemap.xml', 'utf8');
  for (const g of GUIDE_LIST) assert.ok(sm.includes(g.path), g.path);
  assert.ok(sm.includes(`<lastmod>${V.lastVerified}</lastmod>`));
});

const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/\s+/g, ' ');

test('the short Anubis route is valid, step by step, in our own breeding table', () => {
  const r = shortAnubisRoute(data);
  assert.ok(r, 'every step of the chain must give the expected child');
  assert.equal(r.steps.length, ANUBIS_CHAIN.length);
  const have = new Set(r.starters);
  for (const s of r.steps) {
    assert.ok(have.has(s.a) && have.has(s.b), 'step uses a Pal we do not have yet');
    assert.equal(childOf(data, s.a, s.b).child, s.child);
    have.add(s.child);
  }
  assert.equal(data.pals[r.steps.at(-1).child].name, 'Anubis');
});

test('Anubis guide shows the verified short route, the level table and honest wording', { skip: !built && 'run npm run build first' }, () => {
  const t = text(page('/guide/how-to-breed-anubis/'));
  for (const [a, b, c] of ANUBIS_CHAIN) {
    assert.ok(t.includes(`${a} ${b} gives ${c}`), `${a} + ${b} = ${c}`);
  }
  assert.ok(!/none of the easy early-game ones/i.test(t));
  assert.ok(!/2024/.test(t), 'no unsourced 2024 claim');
  assert.match(t, /theoretical minimum-level start/);
  assert.match(t, /Unverified/);
  // every row of the level table matches the planner
  const an = data.pals.findIndex((p) => p.name === 'Anubis');
  for (const cap of [10, 20, 30, 40, 50]) {
    const r = A.routeWithCap(an, cap);
    assert.ok(t.includes(`Wild level ${cap} or lower`));
    assert.ok(r && !r.owned, `cap ${cap}`);
    assert.ok(new RegExp(`Wild level ${cap} or lower \\d+ ${r.steps.length}\\b`).test(t), `cap ${cap} row has ${r.steps.length} steps`);
  }
});

test('"early-game" steps are always described as a theoretical minimum, not a practical route', { skip: !built && 'run npm run build first' }, () => {
  for (const slug of ['anubis', 'astegon', 'kitsun']) {
    const t = text(page(`/pals/${slug}/`));
    assert.ok(!/Starting only from early-game Pals/.test(t), slug);
    assert.match(t, /theoretical minimum-level start/, slug);
  }
  assert.ok(!/early-game/i.test(text(page('/guide/easiest-breeding-routes/'))));
});

test('every mention of Penking + Bushi is labelled unverified', { skip: !built && 'run npm run build first' }, () => {
  for (const p of ['/', '/guide/how-to-breed-anubis/', '/data-sources/', '/data-changelog/']) {
    const t = text(page(p));
    const hits = [...t.matchAll(/Penking \+ Bushi/g)];
    assert.ok(hits.length > 0, p);
    for (const m of hits) assert.match(t.slice(Math.max(0, m.index - 400), m.index + 700), /nverified/i, `${p} near "${m[0]}"`);
  }
  assert.ok(!/Penking \+ Bushi\)[^.]*compared by hand/.test(text(page('/data-sources/'))), 'Penking + Bushi must not be described as hand-compared');
  assert.ok(!/Penking \+ Bushi[^.]{0,300}(?:compared|checked) (?:by hand|against (?:published|other))/i.test(text(page('/data-changelog/'))));
  const combos = text(page('/guide/breeding-combinations/'));
  assert.match(combos, /Unverified/);
  assert.match(combos, /not tested these pairs in the live game/);
});

test('Pals on the short Anubis route link to the Anubis guide', { skip: !built && 'run npm run build first' }, () => {
  const r = shortAnubisRoute(data);
  const members = new Set(r.steps.flatMap((s) => [s.a, s.b, s.child]));
  members.delete(r.steps.at(-1).child);
  for (const i of members) assert.ok(page(`/pals/${data.pals[i].slug}/`).includes('/guide/how-to-breed-anubis/'), data.pals[i].name);
});

test('every guide has at least 6 other pages linking to it', { skip: !built && 'run npm run build first' }, () => {
  const files = [];
  const walk = (d) => readdirSync(d).forEach((f) => { const p = d + '/' + f; statSync(p).isDirectory() ? walk(p) : f.endsWith('.html') && files.push(p); });
  walk(root + 'dist');
  const inbound = {};
  for (const f of files) {
    const here = '/' + f.slice((root + 'dist/').length).replace(/index\.html$/, '');
    const h = readFileSync(f, 'utf8');
    for (const m of new Set([...h.matchAll(/href="\/eggpair(\/[^"#?]*)"/g)].map((x) => x[1]))) if (m !== here) (inbound[m] ||= new Set()).add(here);
  }
  for (const g of GUIDE_LIST) assert.ok((inbound[g.path]?.size || 0) >= 6, `${g.path} has ${inbound[g.path]?.size || 0} inbound links`);
});
