// Written pages: the breeding guide and the site information pages.

export function pages({ config, meta, pals, counts, selfOnly, genderedRows, pairText, palLink, esc }) {
  const name = esc(config.name);
  const fewRecipes = pals.map((p, i) => i).filter((i) => counts[i] > 0 && counts[i] <= 4);

  return [
    {
      path: '/guide/how-breeding-works/',
      crumb: 'How breeding works',
      article: true,
      title: 'How Palworld Breeding Works (1.0): Breeding Power',
      description: 'A plain-English guide to Palworld breeding: breeding power, how the child is chosen, special combos, gender rules and Pals that only breed from themselves.',
      body: `
<h1>How Palworld breeding works</h1>
<p class="lead">Breeding looks random at first, but the species of the egg is fully predictable. This guide explains the rule the game uses, the exceptions, and how to use it to plan.</p>

<h2>What you need</h2>
<ul>
  <li>A Breeding Farm at your base.</li>
  <li>One male and one female Pal assigned to the farm.</li>
  <li>A Cake in the farm's box. Each egg uses up one Cake.</li>
</ul>
<p>The egg then needs to be hatched in an incubator. The species inside is decided when the egg is made, so the incubator doesn't change it.</p>

<h2>Breeding power: the hidden number</h2>
<p>Every Pal has a hidden <strong>breeding power</strong> value. In the data used here it runs from ${Math.min(...pals.map((p) => p.power))} to ${Math.max(...pals.map((p) => p.power))}. Rare, late-game Pals have <em>low</em> numbers; common early Pals have <em>high</em> ones. Each Pal page on this site shows the value.</p>

<h2>How the child is chosen</h2>
<ol>
  <li><strong>Same species?</strong> Two Pals of the same species always make that species.</li>
  <li><strong>Special combo?</strong> Some pairs are fixed recipes that ignore the normal rule. A Pal that has a special recipe can only come from that recipe.</li>
  <li><strong>Otherwise, the average rule.</strong> Add both parents' breeding power, divide by two and round up. The child is the Pal whose breeding power is closest to that number. If two Pals are equally close, the game uses a hidden priority value to pick one.</li>
</ol>
<p>Because the child sits between its parents, you can't breed "past" the parents with the normal rule. To reach a rare Pal (low number), at least one parent needs a low number too. That's why rare Pals usually take several generations.</p>

<h2>When gender matters</h2>
<p>For almost every pair it doesn't matter which parent is male. The current data has one exception:</p>
<ul>${genderedRows.map((o) => `<li>${esc(pairText(o))} → ${palLink(pals[o.c])}</li>`).join('')}</ul>

<h2>Pals with very few recipes</h2>
<p>These Pals hatch from four or fewer pairs of different species, usually because they have a special recipe:</p>
<p class="chips">${fewRecipes.map((i) => palLink(pals[i])).join('')}</p>

<h2>Pals that only breed from themselves</h2>
<p>${selfOnly.length} Pals, including most legendaries, can't be hatched from two different species. To breed them you need a male and a female of that Pal:</p>
<p class="chips">${selfOnly.map((i) => palLink(pals[i])).join('')}</p>

<h2>Passive skills and stats</h2>
<p>The species is predictable, but passive skills, IVs and attacks are partly random. A child inherits some passives from its parents and may get random extra ones; a Special Cake improves the odds. This site plans the species only. For passive planning, the free Windows tool <a href="https://github.com/tylercamp/palcalc" rel="noopener">PalCalc</a> reads your save file and estimates the odds.</p>

<h2>A simple planning routine</h2>
<ol>
  <li>Mark the Pals you own on <a href="/my-pals/">My Pals</a>.</li>
  <li>Open the <a href="/planner/">planner</a> and choose your target.</li>
  <li>Breed each step in order. Keep at least one male and one female of every Pal you'll reuse.</li>
</ol>
<p class="muted small">Data: ${esc(meta.gameVersion)}, from ${esc(meta.source)} (DB ${esc(meta.sourceDbVersion)}). Game updates can change results; this page is regenerated whenever the data is updated.</p>`,
    },
    {
      path: '/about/',
      title: `About ${config.name}`,
      description: `${config.name} is a free, fast, unofficial Palworld breeding calculator, parent finder and route planner that runs entirely in your browser.`,
      body: `
<h1>About ${name}</h1>
<p>${name} is a free, unofficial fan tool for planning Palworld breeding. It was built to be quick on a phone, easy to read, and clear about which game version its data comes from.</p>
<h2>What it does</h2>
<ul>
  <li><a href="/">Calculator</a>: two parents in, child out.</li>
  <li><a href="/find/">Parent finder</a>: every pair that hatches a Pal.</li>
  <li><a href="/planner/">Route planner</a>: the fewest steps from the Pals you own.</li>
  <li><a href="/my-pals/">My Pals</a>: a private checklist saved on your device.</li>
  <li><a href="/pals/">Pal pages</a>: breeding combos, stats and work suitability for all ${pals.length} Pals.</li>
</ul>
<h2>How it's built</h2>
<p>Every calculation runs in your browser. There are no accounts and no server storing your data. The breeding data is imported from an open-source project and checked automatically before every update; see <a href="/data-sources/">data sources</a>.</p>
<h2>Found a mistake?</h2>
<p>If a result doesn't match what you see in game, please tell us on the <a href="/contact/">contact page</a>, along with the two parents, their genders and your game version.</p>`,
    },
    {
      path: '/data-sources/',
      title: 'Data Sources and Game Version',
      description: `Where ${config.name}'s Palworld breeding data comes from, which game version it matches, its licence, and how it is checked.`,
      body: `
<h1>Data sources and game version</h1>
<table class="kv"><tbody>
  <tr><th scope="row">Game version</th><td>${esc(meta.gameVersion)}</td></tr>
  <tr><th scope="row">Source</th><td><a href="${esc(meta.sourceUrl)}" rel="noopener">${esc(meta.source)}</a></td></tr>
  <tr><th scope="row">Source licence</th><td>${esc(meta.sourceLicense)}</td></tr>
  <tr><th scope="row">Source database</th><td>${esc(meta.sourceDbVersion)}, commit <code>${esc(meta.sourceCommit.slice(0, 7))}</code> (${esc(meta.sourceCommitDate)})</td></tr>
  <tr><th scope="row">Imported</th><td>${esc(meta.importedOn)}</td></tr>
  <tr><th scope="row">Pals</th><td>${meta.palCount}</td></tr>
  <tr><th scope="row">Parent pairs</th><td>${meta.pairCount.toLocaleString('en-US')} (${meta.genderedCombos} gender-specific results)</td></tr>
</tbody></table>
<h2>Where the data comes from</h2>
<p>PalCalc is an open-source Palworld breeding solver by Tyler Camp. It exports Pal data and breeding results directly from the game files. We use its exported Pal list and breeding table under the MIT licence. Copyright notice: "Copyright 2024, Tyler Camp", licensed under the MIT License.</p>
<h2>How it's checked</h2>
<ul>
  <li>When the data is imported, every one of the source's breeding rows is compared with the table this site uses, in both parent orders. The import stops if a single row disagrees.</li>
  <li>The automated tests recompute every result for regular Pals from breeding power using the rule described in our <a href="/guide/how-breeding-works/">guide</a>, and fail if any differ.</li>
  <li>Sample results (for example Relaxaurus + Sparkit, the Katress and Wixen gender combos, and Penking + Bushi) were compared by hand with other 1.0 calculators and guides.</li>
</ul>
<h2>What we don't have</h2>
<ul>
  <li>The source doesn't name the exact game patch, so we label the data as the 1.0 game-file export.</li>
  <li>Results for the Terraria collaboration Pals haven't been checked against a second source.</li>
  <li>We don't show official Pal artwork. The coloured initials are our own placeholders.</li>
</ul>`,
    },
    {
      path: '/privacy/',
      title: 'Privacy Policy',
      description: `How ${config.name} handles your data: no accounts, My Pals stays on your device.`,
      body: `
<h1>Privacy policy</h1>
<p>Last updated: ${esc(meta.importedOn)}</p>
<h2>What we store</h2>
<p>${name} has no accounts and no database of users. Your My Pals list is saved in your own browser's local storage. It never leaves your device unless you export it yourself. Clearing your browser data deletes it.</p>
<h2>Hosting and analytics</h2>
<p>The site is served by a hosting provider that processes standard request data (such as IP address and browser type) to deliver pages and protect against abuse.${config.cloudflareAnalyticsToken ? ' We use Cloudflare Web Analytics to count visits. It does not use cookies or track you across sites.' : ''}</p>
${config.ga4MeasurementId ? '<h2>Google Analytics</h2><p>If you accept analytics cookies in the banner, we use Google Analytics 4 to count visits and see which tools are used (for example which Pals are looked up). Google may set cookies and receives your IP address and device information, as described in <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">Google\'s policy</a>. Nothing is sent to Google, and its script is not loaded, unless you accept. You can change your choice any time with "Cookie settings" in the footer.</p>' : ''}
<h2>Advertising</h2>
<p>${config.ads.enabled ? 'This site shows ads from Google. Google and its partners may use cookies to show ads based on your visits to this and other sites. You can manage personalised ads at <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>. Visitors in some regions are asked for consent before personalised ads are shown.' : 'The site does not show ads at the moment. If that changes, this policy will be updated first and will explain the ad provider and its cookies.'}</p>
<h2>Affiliate links</h2>
<p>Some pages may contain affiliate links. If you buy through one, we may earn a commission at no extra cost to you. Affiliate links are always labelled.</p>
<h2>Contact</h2>
<p>Questions about privacy: see the <a href="/contact/">contact page</a>.</p>`,
    },
    {
      path: '/contact/',
      title: 'Contact',
      description: `How to contact ${config.name} about data errors, suggestions or other questions.`,
      body: `
<h1>Contact</h1>
${config.contactEmail
    ? `<p>Email: <a href="mailto:${esc(config.contactEmail)}">${esc(config.contactEmail)}</a></p>`
    : ''}
<p>Report a wrong result or suggest an improvement on our <a href="https://github.com/afaisalfasi007-pixel/eggpair/issues" rel="noopener">GitHub issues page</a> (free GitHub account needed).</p>
<p>To report a wrong result, please include both parents, their genders, the child you got in game, and your game version. That helps us check it quickly.</p>`,
    },
    {
      path: '/terms/',
      title: 'Terms of Use',
      description: `The terms for using ${config.name}: what the site is for, accuracy, acceptable use, third-party content and changes.`,
      body: `
<h1>Terms of use</h1>
<p>Last updated: ${esc(meta.importedOn)}</p>
<p>By using ${name} you agree to these terms. If you do not agree, please do not use the site.</p>
<h2>What the site is</h2>
<p>${name} is a free, unofficial fan tool that shows Palworld breeding results and related game information. It is for personal, non-commercial use by players.</p>
<h2>Accuracy</h2>
<p>We work to keep the data correct and show the game version on every page (see <a href="/data-sources/">data sources</a>), but game updates can change results. The site is provided "as is", without warranties. Check important decisions in the game itself.</p>
<h2>Acceptable use</h2>
<ul>
  <li>Do not try to disrupt the site or overload it with automated requests.</li>
  <li>Do not copy the site's original text wholesale and present it as your own. Short quotes with a link back are fine.</li>
  <li>The breeding data comes from an open-source project under the MIT licence; its licence is kept at <a href="/data-sources/">data sources</a>.</li>
</ul>
<h2>Game content and trademarks</h2>
<p>Palworld, its Pals and related names and marks belong to Pocketpair, Inc. and other owners. ${name} is not affiliated with or endorsed by them.</p>
<h2>Links to other sites</h2>
<p>We may link to other websites. We do not control them and are not responsible for their content or practices.</p>
<h2>Changes</h2>
<p>We may update these terms and the site at any time. Continued use after a change means you accept the updated terms.</p>
<h2>Contact</h2>
<p>Questions about these terms: see the <a href="/contact/">contact page</a>.</p>`,
    },
    {
      path: '/disclaimer/',
      title: 'Disclaimer',
      description: `${config.name} is an unofficial Palworld fan tool. Trademark, accuracy, advertising and affiliate disclosures.`,
      body: `
<h1>Disclaimer</h1>
<h2>Unofficial fan tool</h2>
<p>${name} is not affiliated with, endorsed or sponsored by Pocketpair, Inc. Palworld, Pal names and related marks belong to their owners. Names are used only to identify the game content this tool describes.</p>
<h2>Accuracy</h2>
<p>We check the data carefully (see <a href="/data-sources/">data sources</a>), but game updates can change breeding results. Information is provided as is, without warranty.</p>
<h2>Ads and affiliate links</h2>
<p>The site may show ads and labelled affiliate links to help cover its costs. We only link to products or services related to Palworld, and an affiliate link never changes a breeding result.</p>`,
    },
  ];
}
