// Guides, data-version page and data verification record.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { analyze } from '../src/insights.mjs';
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
