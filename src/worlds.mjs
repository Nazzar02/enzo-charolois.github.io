import { ids } from '../facets/content.js'
import { copy, papers, authorList, portfolioSource } from './world-content.mjs'
const prototype = 'https://playlist-recommendation.tools.eurecom.fr/'
const external = (href, label) =>
  `<a class="text-link" href="${href}">${label} <span aria-hidden="true">↗</span></a>`
function notes(w) {
  return `<section class="notes shell"><div><p class="kicker"><span class="rule"></span>${w.section || w.label}</p><h2 class="section-title">${w.title}</h2></div><div class="entries">${w.paragraphs.map(([title, p]) => `<article><h3>${title}</h3><p>${p}</p></article>`).join('')}</div></section>`
}
function choices(items, labels, selectName) {
  return `<div class="switch-row" role="group" aria-label="${selectName}">${items.map((s, i) => `<a href="#item-${i}" data-pick="${i}"><small>0${i + 1}</small>${s}</a>`).join('')}</div>
  ${labels.map((html, i) => `<div class="result" id="item-${i}" data-result="${i}">${html}</div>`).join('')}`
}
function bank(w) {
  const panels = w.picks.map((_, i) => {
    const mismatch = i >= 2,
      values = ['EUR / CHF', 'EUR 250 000', w.date[0], w.date[+mismatch]]
    return `<div><p class="kicker">FX‑042 &nbsp; / &nbsp; 0${i + 1}</p><h3>${w.cap[i]}</h3><p class="finding">${w.findings[i]}</p></div>
   <dl class="readout">${w.fields.map((f, j) => `<div class="${j === 3 && mismatch ? 'difference' : ''}"><dt>${f}</dt><dd>${values[j]}</dd></div>`).join('')}<div><dt class="sr">${w.fields[3]}</dt><dd class="verdict">${mismatch ? '≠' : '='} &nbsp;${mismatch ? w.mismatch : w.match}</dd></div></dl>`
  })
  return (
    choices(w.picks, panels, w.demo) + `<p class="technical-note">${w.safe}</p>`
  )
}
const catalog = [
  [19, 'Morning light', 'Lumière du matin'],
  [39, 'First train', 'Premier train'],
  [62, 'Open windows', 'Fenêtres ouvertes'],
  [131, 'Fast lane', 'Voie rapide'],
  [146, 'Night circuit', 'Circuit de nuit'],
  [167, 'Full speed', 'Pleine vitesse'],
  [236, 'Still water', 'Eau calme'],
  [254, 'Quiet room', 'Chambre calme'],
  [288, 'Last page', 'Dernière page'],
]
const seeds = [
  [33, 'Early commute', 'Trajet du matin'],
  [151, 'Night drive', 'Route de nuit'],
  [250, 'Slow reading', 'Lecture tranquille'],
]
const point = (d) => [
  Math.cos((d * Math.PI) / 180),
  Math.sin((d * Math.PI) / 180),
]
function research(w, lang) {
  const language = lang === 'fr' ? 2 : 1
  const panels = seeds.map((seed) => {
    const query = point(seed[0])
    const ranked = catalog
      .map(([angle, ...names], i) => {
        const v = point(angle)
        return {
          i,
          name: names[language - 1],
          score: v[0] * query[0] + v[1] * query[1],
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
    const project = (d, r) => {
      const [x, y] = point(d)
      return [180 + x * r, 103 - y * r * 0.72]
    }
    const [qx, qy] = project(seed[0], 64)
    const chart = `<svg viewBox="0 0 360 205" class="vector-map" aria-hidden="true"><g fill="none" stroke="currentColor" opacity=".18"><ellipse cx="180" cy="103" rx="120" ry="86"/><ellipse cx="180" cy="103" rx="64" ry="46"/><path d="M22 103h316M180 9v187"/></g>
   ${catalog
     .map((item, i) => {
       const [x, y] = project(item[0], 103 + (i % 3) * 13)
       const n = ranked.findIndex((p) => p.i === i)
       return (
         (n >= 0
           ? `<line x1="${qx}" y1="${qy}" x2="${x}" y2="${y}" stroke="#b9a181" stroke-width="1"/><text x="${x + 8}" y="${y - 5}">${n + 1}</text>`
           : '') +
         `<circle cx="${x}" cy="${y}" r="${n >= 0 ? 4.3 : 3}" fill="${n >= 0 ? '#e8c397' : '#829195'}"/>`
       )
     })
     .join('')}
    <circle cx="${qx}" cy="${qy}" r="7" fill="none" stroke="#f2e9db"/><circle cx="${qx}" cy="${qy}" r="2" fill="#f2e9db"/></svg>`
    return `<div>${chart}</div><div><p class="kicker">${w.ranking}</p><h3>${seed[language]}</h3><ol class="rank">${ranked.map((r) => `<li><span>${r.name}</span><span aria-label="${w.similarity}">${r.score.toLocaleString(lang, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span></li>`).join('')}</ol></div>`
  })
  return (
    choices(
      seeds.map((s) => s[language]),
      panels,
      w.demo,
    ) + `<p class="technical-note">${w.note}</p>`
  )
}
function engineering(w) {
  const panels = w.panels.map(
    (
      [title, body],
      i,
    ) => `<div><p class="kicker">${w.tabs[i]}</p><h3>${title}</h3><p class="finding">${body}</p>${i === 4 ? external(portfolioSource, w.source) : ''}</div>
   <ol class="pipeline">${w.stages.map((s, j) => `<li class="${j === Math.min(i, 3) ? 'lit' : ''}"><span>0${j + 1}</span> ${s}</li>`).join('')}</ol>`,
  )
  return choices(w.tabs, panels, w.demo)
}
function lab(w, id, lang) {
  const demo =
    id === 'banking'
      ? bank(w)
      : id === 'research'
        ? research(w, lang)
        : engineering(w)
  return `<section class="lab shell" aria-labelledby="lab-title"><div class="lab-head"><div><p class="kicker"><span class="rule"></span>${w.label}</p><h2 class="section-title" id="lab-title">${w.demo}</h2></div><p class="prose">${w.instruction}</p></div><div class="instrument">${demo}</div></section>`
}
function publications(w, lang, asset) {
  return `<section class="publications shell"><h2 class="section-title">${w.pubs}</h2>
 ${papers
   .map((p) => {
     const authors = [...authorList]
     if (p.demo) [authors[0], authors[1]] = [authors[1], authors[0]]
     const date = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', {
       dateStyle: 'long',
       timeZone: 'UTC',
     }).format(new Date(p.date))
     return `<article class="publication"><p class="kicker">${p.venue}<br><span>${w.published} <time datetime="${p.date}">${date}</time></span></p>
    <div><h3 lang="en">${p.title}</h3><p>${authors.join(', ')}</p><div class="references">${external('https://doi.org/' + p.doi, 'DOI ' + p.doi)}${external('https://www.eurecom.fr/' + lang + '/publication/' + p.record, w.record)}${p.pdf ? external(asset('assets/docs/papers/my_research_paper-' + p.pdf + '.pdf'), w.pdf) : ''}</div></div></article>`
   })
   .join(
     '',
   )}<p class="prose">${w.equal}</p>${external(prototype, w.demoLink)}</section>`
}
export function world({ id, t, lang, url, asset, arrow, motif }) {
  const i = ids.indexOf(id),
    about = i < 0,
    w = copy[lang][id],
    next = ids[(i + 1) % 3]
  const plate = about
    ? `<img class="portrait" src="${asset('facets/portrait.webp')}" alt="${w.portrait}" width="400" height="460">`
    : `<div class="plate" aria-hidden="true">${motif(i)}<img src="${asset('facets/stills/' + (lang === 'fr' ? 'fr/' : '') + id + '.webp')}" alt="" width="680" height="595"><span class="plate-id">STRATA &nbsp; / &nbsp; 0${i + 1}</span></div>`
  const heading = `<section class="world-cover"><div class="world-hero shell"><div><p class="kicker"><span class="rule"></span>${about ? t.location : t.facets + ' &nbsp; / &nbsp; 0' + (i + 1)}</p><h1>${about ? w.bio : t.names[i]}</h1><p class="intro">${w.lead}</p></div>${plate}</div></section>`
  const contact = about
    ? `<section id="contact" class="contact shell"><p class="kicker">${w.downloads}</p><h2 class="section-title">${w.contact}</h2>
 ${external('mailto:enzo.charolois@gmail.com', 'enzo.charolois@gmail.com')}<div class="references">${external('https://www.linkedin.com/in/enzo-charolois', 'LinkedIn')}${external('https://github.com/Nazzar02', 'GitHub')}${['AI', 'PM'].map((s, j) => external(asset('assets/docs/cv/CV_Enzo_Charolois-CH-' + s + '.pdf'), w.cv[j])).join('')}</div></section>`
    : ''
  const end =
    id === 'engineering'
      ? `<div class="shell evidence-links">${external(portfolioSource, w.source)} ${external(prototype, w.prototype)}</div>`
      : ''
  return `<main id="main">${heading}<div class="paper">${(!about ? lab(w, id, lang) : '') + notes(w)}${id === 'research' ? publications(w, lang, asset) : ''}${contact}${end}
 <div class="shell next"><span class="kicker">${t.next}</span><a href="${url(next)}">${t.names[ids.indexOf(next)]} ${arrow}</a></div></div></main>`
}
