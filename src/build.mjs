import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ids, languages } from '../facets/content.js'
import { mark, motif } from './graphics.mjs'
import { exhibit, world } from './worlds.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const publicBase = 'https://nazzar02.github.io/enzo-charolois.github.io/'
const arrow = '<span aria-hidden="true">↗</span>'
function home(t, url, asset, lang) {
  const stills = lang === 'fr' ? 'facets/stills/fr/' : 'facets/stills/'
  return `<main id="main"><section class="cover" data-active="0" aria-label="${t.facets}">
    <div class="shell">
      <div class="hero">
        <div class="hero-copy"><p class="kicker location"><span class="swiss" aria-hidden="true">✚</span>${t.location}</p>
          <h1>${t.headline}</h1><p class="intro">${t.intro}</p>
          <a class="cta enter" data-explore href="${url('banking')}"><span>${t.explore[0]}</span>${arrow}</a>
        </div>
        <figure class="specimen">
          <div class="stage" tabindex="0" role="group" aria-label="${t.still} ${t.arrows}">
            <div class="studio-glow"></div><div class="drawings">${ids.map((_, i) => motif(i)).join('')}</div>
            <div class="floor"></div><img class="poster" src="${asset(stills + 'banking.webp')}" width="640" height="560" alt="" fetchpriority="high">
            <canvas aria-hidden="true"></canvas>
          </div>
          <figcaption><p class="facet-story"><span class="story-number">01</span><span data-story>${t.captions[0]}</span></p><span class="drag-hint"><span aria-hidden="true">↔</span> ${t.drag}</span><label class="tilt-control" hidden><span>${t.tilt}</span><input type="range" min="-38" max="38" step="1" value="0" aria-label="${t.tilt}"></label></figcaption>
        </figure>
      </div>
      <div class="selector-label"><span class="kicker">${t.facets}</span><a href="#preview">${t.scroll} <span aria-hidden="true">↓</span></a></div>
      <div class="selector" role="group" aria-label="${t.choose}">${ids.map((id, i) => `<a class="facet" href="${url(id)}" data-select="${i}"><span class="facet-no">0${i + 1}</span><span>${t.names[i]}</span><i aria-hidden="true"></i></a>`).join('')}</div>
      <p class="sr" role="status" data-status></p>
    </div></section>
    <section class="preview paper" id="preview"><div class="shell">
      <p class="kicker"><span class="rule"></span>${t.preview} <span class="preview-no">01 / 03</span></p>
      ${ids
        .map(
          (
            id,
            i,
          ) => `<article class="preview-body" data-preview="${i}" ${i ? 'hidden' : ''}>
        <div><p class="eyebrow">${t.names[i]}</p><h2>${t.titles[i]}</h2><p class="prose">${t.descriptions[i]}</p><a class="text-link enter" href="${url(id)}">${t.explore[i]} ${arrow}</a></div>
        ${exhibit(id, lang, asset, true)}
      </article>`,
        )
        .join('')}
      <div class="other"><p class="kicker">${t.other}</p>${ids.map((id, i) => `<a data-other="${i}" ${i === 0 ? 'hidden' : ''} href="${url(id)}"><strong>${t.names[i]} ${arrow}</strong><small>${t.notes[i]}</small></a>`).join('')}<a href="${url('about')}">${t.aboutLink} ${arrow}</a></div>
    </div></section></main>`
}
export async function buildPage(lang, id, world) {
  const t = languages[lang],
    folder = (lang === 'fr' ? 'fr/' : '') + (id ? id + '/' : '')
  const relative = (to) => posix.relative(folder || '.', to) || '.'
  const asset = (to) => relative(to)
  const pageFolder = (key, locale) =>
    [locale === 'fr' ? 'fr' : '', key].filter(Boolean).join('/')
  const url = (key = '', locale = lang) =>
    relative(pageFolder(key, locale) || '.') + '/'
  const title = id
    ? id === 'about'
      ? t.about
      : t.names[ids.indexOf(id)]
    : t.headline.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '')
  const description = id
    ? id === 'about'
      ? t.role + ' · ' + t.location
      : t.descriptions[ids.indexOf(id)]
    : t.meta
  const navLinks = [...ids, 'about']
    .map(
      (key, i) =>
        `<a href="${url(key)}" ${key === id ? 'aria-current="page"' : ''}>${i === 3 ? t.about : t.short[i]}</a>`,
    )
    .join('')
  const localeNav = `<div class="lang" aria-label="${t.language}">${['en', 'fr'].map((l) => `<a lang="${l}" hreflang="${l}" data-language href="${url(id, l)}" ${l === lang ? 'aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('<span aria-hidden="true">/</span>')}</div>`
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Enzo Charolois</title><meta name="description" content="${description}"><meta name="theme-color" content="#111518">
  <meta property="og:type" content="website"><meta property="og:title" content="${title} — Enzo Charolois"><meta property="og:description" content="${description}"><meta property="og:image" content="${publicBase}facets/social.jpg">
  <link rel="canonical" href="${publicBase + folder}">${['en', 'fr'].map((l) => `<link rel="alternate" hreflang="${l}" href="${publicBase + [pageFolder(id, l), ''].filter((x, i) => x || i).join('/')}">`).join('')}
  <link rel="icon" href="${asset('facets/mark.svg')}"><link rel="preload" href="${asset('facets/fonts/InstrumentSerif-Regular.ttf')}" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="${asset('facets/style.css')}">${id ? `<link rel="stylesheet" href="${asset('facets/world.css')}">` : ''}</head><body class="${id ? 'interior' : 'home'}" data-page="${id || 'home'}">
  <a href="#main" class="skip">${t.skip}</a><header><div class="shell header-inner"><a class="brand" href="${url()}">${mark}<span>Enzo Charolois</span></a>
  <nav class="wide-nav" aria-label="${t.nav}">${navLinks}</nav>${localeNav}
  <details class="compact-nav"><summary>${t.menu}</summary><nav aria-label="${t.nav}">${navLinks}</nav></details></div></header>
  ${id ? world({ lang, id, t, url, asset }) : home(t, url, asset, lang)}
  <footer><div class="shell footer-inner"><a class="brand" href="${url()}">${mark} Enzo Charolois</a><a href="${url('about')}#contact">${t.contact} ${arrow}</a></div></footer>
  ${id ? '' : `<script type="module" src="${asset('facets/home.js')}"></script>`}</body></html>`
  const file = join(root, folder, 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
}
for (const lang of ['en', 'fr']) {
  for (const id of ['', ...ids, 'about']) await buildPage(lang, id, world)
}
