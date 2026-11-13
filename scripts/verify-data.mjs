// Prints the numbers that data/verification.json records, computed from the data
// files. After importing new data, run `npm run verify-data`, update
// verification.json to match and review the notes. The tests fail if they differ.

import { readFileSync } from 'node:fs';
import { analyze } from '../src/insights.mjs';

const read = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), 'utf8'));
const pals = read('pals.json');
const breeding = read('breeding.json');
const recorded = read('verification.json').internalChecks;
const computed = analyze({ pals, breeding }).summary;

let ok = true;
for (const [k, v] of Object.entries(computed)) {
  const same = recorded[k] === v;
  if (!same) ok = false;
  console.log(`${same ? 'ok   ' : 'DIFF '}${k}: computed ${v}, recorded ${recorded[k]}`);
}
if (!ok) process.exitCode = 1;
