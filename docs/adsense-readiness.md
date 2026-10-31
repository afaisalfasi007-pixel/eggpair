# Google AdSense readiness

No approval is guaranteed. Google decides after reviewing the site, and its requirements change, so check <https://support.google.com/adsense> before applying. No ad code is on the site and none should be added until AdSense gives you real IDs.

## Status of each requirement

| Item | Status | Notes |
|---|---|---|
| Original, useful content | Partly | 299 Pal pages with real data and a ~800-word guide. The Pal pages share one template, so Google may see them as thin; more original written content is the best fix. |
| Navigation and usability | Done | Tab bar on phones, menu on desktop, all pages within 2 clicks. |
| About page | Done | `/about/` (short). Would be stronger with who runs the site. |
| Contact page | Partly | `/contact/` has a GitHub issues link. **A real contact email is still missing**; set `CONTACT_EMAIL`. |
| Privacy Policy | Done | `/privacy/`; switches wording automatically when GA4 or ads are turned on. Review it again before enabling ads. |
| Terms of use | Done | `/terms/` |
| Disclaimer / not affiliated | Done | `/disclaimer/` and footer on every page |
| Mobile experience | Done | Lab tests (Lighthouse, mobile): Performance, Accessibility, Best Practices, SEO all 100 on 4 key pages. axe-core: 0 violations on 15 pages in light and dark mode. |
| Own domain | **Missing** | AdSense normally needs a site on a domain you own. A `github.io` address may not be accepted. Check AdSense's current rules. |
| Site age/traffic | Missing | A brand-new site with no visitors is often rejected. Build content and visitors first. |
| Consent for ads (EU/UK) | Not yet | Needed before personalised ads in those regions (Google-certified consent tool). |

## Improvement checklist (most valuable first)

1. [ ] Get a custom domain (about $10–15 a year). Avoid "palworld" in the domain name (trademark risk).
2. [ ] Add a real contact email (`CONTACT_EMAIL`) and a short "who runs this site" paragraph on About.
3. [ ] Write more original guides in your own words (for example how to plan a breeding farm, how gender-specific combos work, Cake and incubator basics). Only publish facts you have checked in the game or from sources you can cite.
4. [ ] Let Search Console show the site indexed and getting some real visitors for a few weeks.
5. [ ] Turn on GA4 (see README) to see which pages people use.
6. [ ] When ready, apply. Only then set `ADSENSE_CLIENT`, `ADS_ENABLED` and the ad slot IDs from AdSense. The build already writes `ads.txt` when the client ID is set.

Do not use auto-generated filler text, copy other sites' text, or click your own ads; these cause rejection or a ban.
