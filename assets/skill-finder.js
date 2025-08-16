
/* ===== skill-finder.js (patched) ===== */

/* ---------- Data (work + pubs + education) ---------- */
const SF_ITEMS = [
  {
    id: 'smarttrade',
    title: 'SmartTrade Technologies — IT Project Manager Intern',
    kind: 'work',
    href: '#work',
    text:
      'Integrated FX solutions for Swiss banks (Julius Baer, ZKB, BCV). ' +
      'Solution Architect support, multiple squads, ~100 tickets using logs and SQL. ' +
      'Built a nearest-neighbor tool for client config matching. Finance, FX, SQL, integration, troubleshooting, project management.',
    keywords: ['fx','finance','financial risk','sql','integration','project management','banking','data','fix','fix protocol']
  },
  {
    id: 'siemens',
    title: 'Siemens Healthineers — Prototype Developer Intern (OpenIT Studio)',
    kind: 'work',
    href: '#work',
    text:
      'User-focused requirements with design thinking. Low-code prototypes for 5+ use cases. Internal training on cybersecurity.',
    keywords: ['prototype','prototyping','design thinking','cybersecurity','product']
  },
  {
    id: 'jmp',
    title: 'Junior Mines Provence — Vice President',
    kind: 'work',
    href: '#work',
    text:
      'Strategy, partners, alumni. Team leadership and HR management for a 10+ member board.',
    keywords: ['leadership','management','team','hr','coordination','stakeholders']
  },
  {
    id: 'recsys',
    title: 'RecSys 2025 – Transformer playlist recommendation',
    kind: 'pub',
    href: '#publications',
    text:
      'Transformer-based recommendation from titles using the Million Playlist Dataset. ' +
      'Semantic clusters, light fine-tuning and a voting step. Recommender systems, transformers, deep learning, LLMs.',
    keywords: ['recommender','recsys','transformer','llm','deep learning','nlp','ai','python']
  },
  {
    id: 'eurecom',
    title: 'EURECOM — Post-Master AI & Cybersecurity',
    kind: 'edu',
    href: '#education',
    text:
      'AI (ML, DL, RL, deepfake detection, LLMs) and Security (cryptology, OS, big data, hardware security). Program in English.',
    keywords: ['ml','dl','llm','ai','security','cryptography','big data','data','statistics','nlp','genai','python']
  },
  {
    id: 'mines',
    title: 'Mines Saint-Étienne — Master of Engineering (ISMIN), Computer Science',
    kind: 'edu',
    href: '#education',
    text:
      'Computer science, microelectronics and embedded systems. Promotion representative. Mechatronics and robotics adjacent.',
    keywords: [
      'embedded','microelectronics','robot','robotics','mechatronics','electronics',
      'firmware','mcu','uc','microcontroller','fpga','c','cpp','c++','c/c++','hardware'
    ]
  }
];

/* ---------- Synonymes / expansions ---------- */
const SF_SYNONYMS = {
  llm: 'llm llms large language model language-model transformer transformers gpt bert',
  ml: 'ml machine-learning machine learning',
  dl: 'dl deep-learning deep learning neural nets neural network',
  recommender: 'recommender recommendation recsys',
  prototype: 'prototype prototyping proto',
  design: 'design-thinking design thinking',
  fx: 'fx forex foreign-exchange foreign exchange trading',
  finance: 'finance financial risk risk market quant',
  sql: 'sql database db postgres postgresql mysql datawarehouse',
  cybersecurity: 'cybersecurity security infosec cryptography cryptology',
  data: 'data big-data bigdata analytics datasets statistics stats',
  nlp: 'nlp language text transformer',
  genai: 'genai gen-ai generative ai',

  // Mines / embarqué / hard
  robot: 'robot robotics robotique mechatronics',
  microelectronics: 'microelectronics micro-electronics microelec micro-elec micro elec electronics semiconductors',
  embedded: 'embedded firmware iot microcontroller mcu uc µc baremetal',
  microcontroller: 'microcontroller mcu uc µc',
  fpga: 'fpga vhdl verilog hdl hardware',
  cpp: 'cpp c++ c/c++',
  c: 'c lang c-language',

  // Python eco
  python: 'python pandas numpy scipy sklearn scikit-learn pytorch tensorflow torch'
};

/* ---------- NLP utils ---------- */
const _norm = s => s
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9\s+/.-]/g,' ')
  .replace(/\s+/g,' ')
  .trim();

/* mini-correcteur d’expressions */
function aliasPhrases(q){
  return q
    .replace(/\bmicro\s*elec\b/g,'microelectronics')
    .replace(/\brobotique\b/g,'robotics')
    .replace(/\b(c\+\+|c\/c\+|\bcpp\b)\b/g,'cpp')
    .replace(/\bµc\b/gi,'microcontroller')
    .replace(/\bf¨pg\b/gi,'fpga')
    .replace(/^\s*fp\s*$/,'fpga')      // fp -> fpga
    .replace(/^\s*fpg\s*$/,'fpga');    // fpg -> fpga
}

const tokenize = s => _norm(s).split(' ').filter(Boolean);
const stem = w => w.replace(/(ing|ers|er|ions|ion|ies|es|s)$/i, m => (m==='ies'?'y':'')).replace(/[\/.+-]/g,'');

function editDistance(a,b){
  const dp = Array.from({length:a.length+1}, (_,i)=>[i]);
  for(let j=1;j<=b.length;j++) dp[0][j]=j;
  for(let i=1;i<=a.length;i++){
    for(let j=1;j<=b.length;j++){
      dp[i][j] = a[i-1]===b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }
  return dp[a.length][b.length];
}

/* Vocabulaire issu des keywords + synonyms */
const SF_VOCAB = new Set();
SF_ITEMS.forEach(it => (it.keywords||[]).forEach(k => tokenize(k).forEach(t => SF_VOCAB.add(stem(t)))));
Object.entries(SF_SYNONYMS).forEach(([k,exp])=>{
  SF_VOCAB.add(stem(k));
  exp.split(' ').forEach(t => SF_VOCAB.add(stem(t)));
});

function correctTypos(words){
  return words.map(w=>{
    if(SF_VOCAB.has(stem(w))) return w;
    let best=null, bestD=9;
    for(const cand of SF_VOCAB){
      const d = editDistance(stem(w), cand);
      if(d<bestD){ bestD=d; best=cand; if(d===0) break; }
    }
    // tolérance: 1 pour mots courts, 2 pour >=5
    const ok = (w.length<=4 ? bestD<=1 : bestD<=2);
    return ok ? best : w;
  });
}

/* enrichissement par synonymes */
const withSynonyms = words => {
  const set = new Set(words.map(stem));
  words.forEach(w => {
    const k = stem(w);
    for (const [key,exp] of Object.entries(SF_SYNONYMS)){
      const bag = exp.split(' ').map(stem);
      if (k===key || bag.includes(k)){
        bag.forEach(x => set.add(x));
        set.add(stem(key));
      }
    }
  });
  return [...set];
};

/* Tri-grammes + vecteurs pour “KNN-like” */
const trigrams = w => { const s = `^${w}$`; const out=[]; for (let i=0;i<s.length-2;i++) out.push(s.slice(i,i+3)); return out; };
const vectorize = text => {
  const toks = tokenize(text).map(stem);
  const grams = toks.flatMap(trigrams);
  const vec = new Map();
  [...toks,...grams].forEach(t => vec.set(t, (vec.get(t)||0)+1));
  const len = Math.hypot(...[...vec.values()]);
  return { vec, len };
};
const cos = (a,b) => { let dot=0; for (const [k,va] of a.vec){ dot += va * (b.vec.get(k)||0); } return a.len&&b.len ? dot/(a.len*b.len) : 0; };

/* Pré-embedding */
SF_ITEMS.forEach(it=>{
  const base = `${it.title} ${it.text} ${(it.keywords||[]).join(' ')}`;
  it._emb = vectorize(base);
});

/* stopwords ultra-courts -> on ignore (“a”, “e”, …) */
const SF_STOP = new Set(['a','e','i','o','u','le','la','de','et','the','of','to','in']);

/* ---------- Moteur de recherche ---------- */
function sfSearch(query){
  let raw = aliasPhrases(_norm(query));
  if(!raw || raw.length < 2) return null;               // anti “a”, “e”…
  if (SF_STOP.has(raw)) return null;

  // tokens -> correction -> enrichissement par synonymes
  const toks0 = tokenize(raw);
  if (!toks0.length) return null;
  const toks1 = correctTypos(toks0);
  const toks  = withSynonyms(toks1);

  const qEmb = vectorize(toks.join(' '));

  let best = null;
  for (const it of SF_ITEMS){
    const keySet = new Set((it.keywords||[]).flatMap(k => tokenize(k).map(stem)));

    // boost “dico” (match direct sur keywords/synonymes)
    let boost = 0;
    toks.forEach(t=>{
      if (keySet.has(t)) boost += 1;
      if (SF_SYNONYMS[t]) boost += .5;
    });
    boost = Math.min(1, boost/2); // 0..1

    const sim = cos(qEmb, it._emb);               // 0..1
    const score = Math.min(1, 0.55*sim + 0.45*boost);

    if(!best || score>best.score) best = {item:it, score, boost, sim};
  }
  if(!best) return null;

  // confiance “humaine” un peu moins agressive
  let conf = best.boost>=0.9 ? 1 : Math.min(1, 0.2 + 0.8*best.score);
  return {...best, confidence: Math.round(conf*100)};
}

/* ---------- UI (fab + tip + panel bottom-right) ---------- */
const sfCSS = `
.sf-overlay{position:fixed;inset:0;display:none;align-items:flex-end;justify-content:flex-end;z-index:9999;background:transparent;padding:18px;}
.sf-overlay.open{display:flex;}
.sf-modal{width:min(720px,92vw);max-height:min(80vh,720px);display:flex;flex-direction:column;border:1px solid var(--line);
  border-radius:18px;background:color-mix(in srgb,var(--card) 86%, transparent);backdrop-filter:blur(8px);box-shadow:var(--shadow)}
.sf-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--line)}
.sf-head h4{margin:0;font-size:18px;font-weight:700}
.sf-tag{font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:2px 8px;margin-left:8px}
.sf-body{padding:14px 16px;overflow:auto;scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--accent) 60%, transparent) transparent;}
.sf-body::-webkit-scrollbar{width:8px;height:8px}
.sf-body::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--accent) 70%, transparent);border-radius:999px}
.sf-body::-webkit-scrollbar-track{background:transparent}
.sf-chip{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0;word-break:break-word}
.sf-good{border-color:color-mix(in srgb,var(--accent) 45%, var(--line));}
.sf-form{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--line)}
.sf-form input{flex:1;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:999px;padding:14px 16px}
.sf-form button{border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:999px;padding:14px 18px}
.sf-x{border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:8px;padding:8px 10px;cursor:pointer}
#sf-fab{position:fixed;right:22px;bottom:22px;width:56px;height:56px;border-radius:999px;border:1px solid var(--line);
  background:var(--card);color:var(--fg);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow);z-index:9998}
#sf-fab::after{content:"";position:absolute;inset:0;border-radius:999px;box-shadow:0 0 0 0 rgba(125,146,172,.55);animation:sfPing 1.8s infinite}
#sf-fab.seen::after{display:none}
@keyframes sfPing{0%{box-shadow:0 0 0 0 rgba(125,146,172,.55)}70%{box-shadow:0 0 0 14px rgba(125,146,172,0)}100%{box-shadow:0 0 0 0 rgba(125,146,172,0)}}
.sf-tip{position:fixed;right:22px;bottom:90px;background:color-mix(in srgb,var(--card) 85%, transparent);color:var(--fg);border:1px solid var(--line);
  padding:6px 10px;border-radius:999px;box-shadow:var(--shadow);opacity:0;transform:translateY(6px);transition:all .35s ease;z-index:9998}
.sf-tip.show{opacity:1;transform:translateY(0)}
/* highlight précis sur la carte */
.sf-highlight{box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 60%, transparent) inset; transition: box-shadow .3s; border-radius:8px}
`;

const sfStyle = document.createElement('style');
sfStyle.textContent = sfCSS;
document.head.appendChild(sfStyle);

/* FAB + tip */
const sfFab = document.createElement('button');
sfFab.id = 'sf-fab';
sfFab.innerHTML = `
  <animated-icons
    src="https://animatedicons.co/get-icon?name=chat&style=minimalistic&token=aa724904-12c8-4d99-a7a1-cca76b7ddec0"
    trigger="loop" height="28" width="28"></animated-icons>
`;
document.body.appendChild(sfFab);

const sfTip = document.createElement('div');
sfTip.className = 'sf-tip';
sfTip.textContent = 'Try me';
document.body.appendChild(sfTip);
requestAnimationFrame(() => sfTip.classList.add('show')); // à chaque refresh

/* Panel bottom-right */
const overlay = document.createElement('div');
overlay.className = 'sf-overlay';
overlay.innerHTML = `
  <div class="sf-modal" role="dialog" aria-modal="true" aria-labelledby="sf-title">
    <div class="sf-head">
      <h4 id="sf-title">Skill Finder <span class="sf-tag">AI embeddings</span></h4>
      <button class="sf-x" aria-label="Close">×</button>
    </div>
    <div class="sf-body" id="sf-body"></div>
    <form class="sf-form" id="sf-form">
      <input id="sf-input" placeholder='Type a skill, e.g. "financial risk", "transformers", "LLM", "micro elec", "robot", "fpga", "c/c++", "python"…' />
      <button type="submit">Find</button>
    </form>
  </div>
`;
document.body.appendChild(overlay);

/* Open/close */
function sfOpen(){
  overlay.classList.add('open');
  document.getElementById('sf-input').focus();
  sfTip.classList.remove('show');
  sfFab.classList.add('seen');
}
function sfClose(){ overlay.classList.remove('open'); }
sfFab.addEventListener('click', sfOpen);
overlay.querySelector('.sf-x').addEventListener('click', sfClose);
overlay.addEventListener('click', e => { if (e.target === overlay) sfClose(); });

/* Render helpers */
const sfBody = overlay.querySelector('#sf-body');
const sfForm = overlay.querySelector('#sf-form');
const sfInput = overlay.querySelector('#sf-input');

function pushChip(html, good=false){
  const div = document.createElement('div');
  div.className = 'sf-chip' + (good?' sf-good':'');
  div.innerHTML = html;
  sfBody.appendChild(div);
  sfBody.scrollTop = sfBody.scrollHeight;
}
// --- remplace entièrement cette fonction ---
const resultToHTML = (res, low = false) => {
  const confTxt = `${res.confidence}%`;
  const lowBadge = low ? ` <span style="color:var(--muted)">(low confidence)</span>` : '';
  return `
    <strong>Top match:</strong> ${res.item.title.replace('—','–')}
    — <em>confidence: ${confTxt}</em>${lowBadge}
    <div style="margin-top:6px">
      <a class="text-link" href="${res.item.href}" data-sf-jump data-sf-id="${res.item.id}">
        Go to section
      </a>
    </div>
  `;
};


/* Scroll précis vers la CARTE (sans changer ton HTML) */
const SF_TARGET_SELECTORS = {
  smarttrade: 'img.logo[alt*="SmartTrade"]',
  siemens:    'img.logo[alt*="Siemens"]',
  jmp:        'img.logo[alt*="Junior Mines Provence"]',
  recsys:     'img.logo[alt*="RecSys"]',
  eurecom:    'img.logo[alt*="EURECOM"]',
  mines:      'img.logo[alt*="Mines"]'
};

function jumpToItem(id, fallbackHref){
  const sel = SF_TARGET_SELECTORS[id];
  let card = sel ? document.querySelector(sel) : null;
  card = card ? card.closest('.card') : null;

  if(card){
    card.scrollIntoView({behavior:'smooth', block:'center'});
    card.classList.add('sf-highlight');
    setTimeout(()=>card.classList.remove('sf-highlight'), 1600);
  }else if(fallbackHref){
    const el = document.querySelector(fallbackHref);
    if(!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
    el.classList.add('sf-highlight');
    setTimeout(()=>el.classList.remove('sf-highlight'), 1600);
  }
}

/* Message d’accueil */
pushChip('Ask where a skill fits best. Try: <em>financial risk</em>, <em>prototyping</em>, <em>SQL</em>, <em>LLM</em>, <em>micro elec</em>, <em>robot</em>, <em>fpga</em>, <em>c/c++</em>, <em>python</em>.');

// --- remplace tout le bloc sfForm.addEventListener('submit', ...) ---
const LOW_SCORE = 0.22;   // seuil "faible confiance" (affiche quand même le match)

sfForm.addEventListener('submit', e => {
  e.preventDefault();
  const q = sfInput.value.trim();
  if (!q) return;

  // anti-bruit : on ignore une lettre/stopword
  const raw = _norm(q);
  if (!raw || raw.length < 2 || SF_STOP.has(raw)) { sfInput.value = ''; return; }

  // echo de la requête
  pushChip(q);

  const res = sfSearch(q);

  if (res) {
    // On affiche toujours le meilleur match :
    const isLow = res.score <= LOW_SCORE;
    pushChip(resultToHTML(res, isLow), true);

    // et on scroll automatiquement vers la carte liée
    jumpToItem(res.item.id, res.item.href);
  } else {
    // Cas ultra rare (entrée vide après normalisation, etc.)
    pushChip('I could not interpret that query. Try another keyword such as “prototyping”, “financial risk”, or “transformers”.');
  }

  sfInput.value = '';
});


/* “Go to section” -> carte précise */
sfBody.addEventListener('click', e=>{
  const a = e.target.closest('a[data-sf-jump]');
  if(!a) return;
  e.preventDefault();
  jumpToItem(a.getAttribute('data-sf-id'), a.getAttribute('href'));
});
