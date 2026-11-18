import { ids } from '../facets/content.js'
import {
  authors,
  copy,
  papers,
  exportProject,
  playlistPrototype,
  mapSource,
} from './world-content.mjs'

const arrow = '<span aria-hidden="true">↗</span>'
const link = (href, label) =>
  `<a class="editorial-link" href="${href}">${label} ${arrow}</a>`
const paperPath = (type) =>
  'assets/docs/papers/my_research_paper-' + type + '.pdf'

export function exhibit(id, lang, asset, lazy = false) {
  const entry = copy[lang][id]
  const media = {
    banking: ['geneve.webp', 1220, 759, mapSource],
    research: ['recsys.webp', 1000, 1294, asset(paperPath('Main_Conference'))],
    engineering: ['export-markets.webp', 1320, 610, exportProject],
  }
  const [file, width, height, href] = media[id]
  return `<figure class="exhibit exhibit-${id}"><div class="exhibit-art"><img src="${asset('facets/editorial/' + file)}" width="${width}" height="${height}" alt="${entry.alt}" ${lazy ? 'loading="lazy"' : ''} decoding="async"></div><figcaption><span>${entry.credit}</span><a href="${href}">${entry.source} ${arrow}</a></figcaption></figure>`
}
function masthead(id, t, w, lang, asset) {
  const about = id === 'about'
  const image = about
    ? `<figure class="suit"><img src="${asset('facets/portrait.webp')}" width="530" height="663" alt="${w.portrait}"></figure>`
    : exhibit(id, lang, asset)
  return `<section class="mast"><div class="shell mast-layout"><div class="mast-copy"><p class="kicker">${about ? t.about : t.names[ids.indexOf(id)]}</p><h1>${w.title}</h1><p class="mast-intro">${w.intro}</p>${about ? `<a class="editorial-link" href="#contact">${w.contact} <span aria-hidden="true">↓</span></a>` : ''}</div>${image}</div></section>`
}
function banking(w) {
  return `<section class="shell ledger"><div class="ledger-side"><p class="kicker">${w.current}</p><h2>${w.assignment}</h2><p>${w.role}</p></div><div class="passages">${w.work.map(([title, body]) => `<article><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></section>
  <section class="shell afterword"><p class="kicker">${w.previous}</p><div><h2>${w.previousTitle}</h2><p>${w.previousText}</p></div></section>`
}
function research(w, lang, asset) {
  const date = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
  const items = papers
    .map((p) => {
      const byline = [...authors]
      if (p.demo) [byline[0], byline[1]] = [byline[1], byline[0]]
      return `<li class="bib-entry" id="paper-${p.record}"><div class="bib-meta"><time datetime="${p.date}">${date.format(new Date(p.date))}</time><span>${p.venue}</span></div><div><h3 lang="en"><a href="https://doi.org/${p.doi}">${p.title}</a></h3><p>${byline.join(', ')}</p><div class="references">${link('https://doi.org/' + p.doi, 'DOI ' + p.doi)}${link('https://www.eurecom.fr/' + lang + '/publication/' + p.record, w.record)}${p.pdf ? link(asset(paperPath(p.pdf)), w.pdf) : ''}</div></div></li>`
    })
    .join('')
  return `<section class="shell bibliography"><h2 class="reading-title">${w.publications}</h2><ol>${items}</ol><p class="footnote">${w.equal}</p></section><section class="shell afterword"><h2>${w.method}</h2><div><p>${w.methodText}</p>${link(playlistPrototype, w.prototype)}</div></section>`
}
function engineering(w, url) {
  return `<section class="shell afterword featured"><div><p class="kicker">${w.project}</p><h2>${w.feature}</h2></div><div><p>${w.featureText}</p>${link(exportProject, w.featureLink)}</div></section>
  <section class="shell ledger"><div class="ledger-side"><h2>${w.other}</h2></div><div class="passages projects">${w.projects.map(([org, title, body], i) => `<article><p class="kicker">${org}</p><h3>${title}</h3><p>${body}</p>${i === 2 ? link(url('research') + '#paper-8318', w.researchLink) : ''}</article>`).join('')}</div></section>`
}
function about(w, asset) {
  return `<section class="shell biography"><h2 class="reading-title">${w.titlePath}</h2><ol>${w.timeline.map(([when, place, role, body]) => `<li><p class="when">${when}</p><div><h3>${place}</h3><p class="position">${role}</p></div><p class="history-text">${body}</p></li>`).join('')}</ol></section>
  <section class="shell contact" id="contact"><h2>${w.contact}</h2><div>${link('mailto:enzo.charolois@gmail.com', 'enzo.charolois@gmail.com')}<div class="references">${link('https://www.linkedin.com/in/enzo-charolois', 'LinkedIn')}${link('https://github.com/Nazzar02', 'GitHub')}${['AI', 'PM'].map((s, i) => link(asset('assets/docs/cv/CV_Enzo_Charolois-CH-' + s + '.pdf'), w.cv[i])).join('')}</div></div></section>`
}
export function world({ id, t, lang, url, asset }) {
  const w = copy[lang][id]
  const content = {
    banking: () => banking(w),
    research: () => research(w, lang, asset),
    engineering: () => engineering(w, url),
    about: () => about(w, asset),
  }
  const next = ids[(ids.indexOf(id) + 1) % ids.length]
  return `<main id="main" class="edition">${masthead(id, t, w, lang, asset)}${content[id]()}<nav class="shell next-reading" aria-label="${t.next}"><span class="kicker">${t.next}</span><a href="${url(next)}">${t.names[ids.indexOf(next)]} ${arrow}</a></nav></main>`
}
