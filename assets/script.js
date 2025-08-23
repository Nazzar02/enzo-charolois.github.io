// Theme toggle with persisted state
const root = document.documentElement;
const saved = localStorage.getItem('theme');
if(saved === 'light') root.classList.add('light');
const themeSwitch = document.getElementById('themeSwitch');
if (saved === 'light' && themeSwitch) themeSwitch.checked = true;
themeSwitch?.addEventListener('change', () => {
  root.classList.toggle('light', themeSwitch.checked);
  localStorage.setItem('theme', themeSwitch.checked ? 'light' : 'dark');
});

// Mobile menu
const menuBtn = document.getElementById('menuToggle');
const navLinks = document.getElementById('navlinks');
menuBtn.addEventListener('click', ()=> navLinks.classList.toggle('open'));
document.addEventListener('click', (e)=>{
  if(!navLinks.contains(e.target) && !menuBtn.contains(e.target)) navLinks.classList.remove('open');
});

// Typing effect
const words = ['AI Engineer','Recommender Systems','Project manager'];
const target = document.getElementById('typing');
let wi = 0, ci = 0, dir = 1, pause = 0;

function positionCaret() {
  const caret = document.querySelector('.role .caret');
  const container = document.querySelector('.role');
  if (!caret || !container) return;

  const t = document.getElementById('typing');
  const range = document.createRange();
  range.selectNodeContents(t);
  range.collapse(false); // fin du texte

  const rects = range.getClientRects();
  const rect = rects.length ? rects[rects.length - 1] : t.getBoundingClientRect();
  const crect = container.getBoundingClientRect();

  // place le caret à la fin du dernier line box
  caret.style.left = (rect.right - crect.left) + 'px';
  caret.style.top  = (rect.top   - crect.top)  + 'px';
  caret.style.height = rect.height + 'px';
}
function tick(){
  const current = words[wi];
  if(pause > 0){ pause--; return setTimeout(() => { positionCaret(); tick(); }, 50); }
  ci += dir;
  target.textContent = current.slice(0, ci);
  // Reposition après que le DOM se soit peint
  requestAnimationFrame(positionCaret);

  if(ci === current.length){ pause = 12; dir = -1; }
  if(ci === 0){ dir = 1; wi = (wi + 1) % words.length; }
  setTimeout(tick, dir > 0 ? 55 : 35);
}
tick();
window.addEventListener('resize', () => requestAnimationFrame(positionCaret));
requestAnimationFrame(positionCaret);

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
},{
  // start revealing when the top of the card is ~10% below the viewport top,
  // and when only 80% of the viewport remains (i.e., earlier than before)
  rootMargin: "10% 0px -20% 0px",
  threshold: 0
});


document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Scrollspy active link
const links = navLinks.querySelectorAll('a[href^="#"]');
function setActiveById(id){ links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id)); }
links.forEach(a => a.addEventListener('click', () => setActiveById(a.getAttribute('href'))));
const targets = Array.from(links).map(a => document.querySelector(a.getAttribute('href')));
const spy = new IntersectionObserver((ents)=>{
  let best = null;
  ents.forEach(ent=>{ if(ent.isIntersecting && (!best || ent.intersectionRatio > best.intersectionRatio)) best = ent; });
  if(best){ setActiveById('#'+best.target.id); }
},{rootMargin: "-45% 0px -50% 0px", threshold: [0,.2,.5,.8,1]});
targets.forEach(sec => sec && spy.observe(sec));

// Copy email same-size buttons handled in CSS via min-width
const copyBtn = document.getElementById('copyEmail');
if (copyBtn) {
  copyBtn.addEventListener('click', async ()=>{
    try {
      await navigator.clipboard.writeText('enzo.charolois@gmail.com');
      alert('Email copied');
    } catch(e){}
  });
}


// ===== Skills carousel — auto + flèches =====
(() => {
  const carousel = document.getElementById('skillsCarousel');
  if (!carousel) return;

  const track = document.getElementById('skillTrack');
  const dotsWrap = document.getElementById('skillDots');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('.cnav.prev');
  const nextBtn = carousel.querySelector('.cnav.next');

  let index = 0;
  let autoId = 0, unpauseId = 0;
  let paused = false;

  const AUTOPLAY_MS = 2200;   // fréquence d’auto-défilement
  const PAUSE_MS = 3800;      // pause après interaction

  function center(i){
    index = (i + slides.length) % slides.length;
    const s = slides[index];
    const x = s.offsetLeft - (track.clientWidth - s.clientWidth)/2;
    track.scrollTo({ left: x, behavior: 'smooth' });
    const dots = [...dotsWrap.children];
    dots.forEach((d,n)=>d.classList.toggle('active', n===index));
  }

  function buildDots(){
    dotsWrap.innerHTML = '';
    slides.forEach((_,i)=>{
      const b = document.createElement('button');
      b.addEventListener('click', ()=>{ center(i); resetAuto(PAUSE_MS); });
      dotsWrap.appendChild(b);
    });
  }

  function next(n=1){ center(index + n); }
  function prev(){ next(-1); }

  function startAuto(){
    clearInterval(autoId);
    autoId = setInterval(()=>{ if(!paused) next(); }, AUTOPLAY_MS);
  }
  function resetAuto(temp=0){
    if (temp){
      paused = true;
      clearTimeout(unpauseId);
      unpauseId = setTimeout(()=>{ paused=false; }, temp);
    }
    startAuto();
  }

  // Events flèches
  nextBtn.addEventListener('click', ()=>{ next(); resetAuto(PAUSE_MS); });
  prevBtn.addEventListener('click', ()=>{ prev(); resetAuto(PAUSE_MS); });

  // Pause quand on interagit, reprise ensuite
  ['mouseenter','focusin','pointerdown','touchstart'].forEach(ev=>{
    carousel.addEventListener(ev, ()=>{ paused = true; });
  });
  ['mouseleave','focusout','pointerup','touchend','touchcancel'].forEach(ev=>{
    carousel.addEventListener(ev, ()=>{ paused = false; });
  });

  // Recentrer si la taille change
  window.addEventListener('resize', ()=> center(index));
  document.addEventListener('visibilitychange', ()=> { paused = document.hidden; });

  buildDots();
  center(0);
  startAuto();
})();
