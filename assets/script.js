// Theme toggle with persisted state
const root = document.documentElement;
const saved = localStorage.getItem('theme');
if(saved === 'light') root.classList.add('light');
const themeSwitch = document.getElementById('themeSwitch');
if(saved === 'light') themeSwitch.checked = true;
themeSwitch.addEventListener('change', () => {
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
function tick(){
  const current = words[wi];
  if(pause > 0){ pause--; return setTimeout(tick, 50); }
  ci += dir;
  target.textContent = current.slice(0, ci);
  if(ci === current.length){ pause = 12; dir = -1; }
  if(ci === 0){ dir = 1; wi = (wi + 1) % words.length; }
  setTimeout(tick, dir > 0 ? 55 : 35);
}
tick();

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
document.getElementById('copyEmail').addEventListener('click', async ()=>{
  try { await navigator.clipboard.writeText('enzo.charolois@gmail.com'); alert('Email copied'); } catch(e){}
});

// Skills carousel — compact, auto-scroll robust
const carousel = document.getElementById('skillsCarousel');
const track = document.getElementById('skillTrack');
const dotsWrap = document.getElementById('skillDots');
const slides = Array.from(track.children);
let idx = 0, autoTimer = null, hovering = false;

function setActive(i){
  idx = (i + slides.length) % slides.length;
  const slide = slides[idx];
  const x = slide.offsetLeft - (track.clientWidth - slide.clientWidth)/2;
  track.scrollTo({left: x, behavior: 'smooth'});
  const dots = dotsWrap.querySelectorAll('button');
  dots.forEach((d,n)=>d.classList.toggle('active', n===idx));
}
function buildDots(){
  dotsWrap.innerHTML='';
  slides.forEach((_,i)=>{
    const b = document.createElement('button');
    b.addEventListener('click', ()=>{ setActive(i); restartAuto(); });
    dotsWrap.appendChild(b);
  });
}
function next(){ setActive(idx+1); }
function prev(){ setActive(idx-1); }

function startAuto(){
  stopAuto();
  autoTimer = setInterval(()=>{
    if(!hovering) next();
  }, 1400);
}
function stopAuto(){ if(autoTimer){ clearInterval(autoTimer); autoTimer = null; } }
function restartAuto(){ startAuto(); }

buildDots();
setActive(0);
carousel.querySelector('.cnav.next').addEventListener('click', ()=>{ next(); restartAuto(); });
carousel.querySelector('.cnav.prev').addEventListener('click', ()=>{ prev(); restartAuto(); });

['mouseenter','focusin','pointerdown'].forEach(ev => carousel.addEventListener(ev, ()=>{ hovering = true; }));
['mouseleave','focusout','pointerup'].forEach(ev => carousel.addEventListener(ev, ()=>{ hovering = false; }));
startAuto();
