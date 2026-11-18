import { ids, languages } from './content.js'

const cover = document.querySelector('.cover'),
  stage = document.querySelector('.stage'),
  canvas = stage.querySelector('canvas')
const choices = [...document.querySelectorAll('[data-select]')],
  posters = stage.querySelector('.poster')
const t = languages[document.documentElement.lang],
  reduced = matchMedia('(prefers-reduced-motion: reduce)')
const saveData = !!navigator.connection?.saveData
const stillBase = new URL(
  document.documentElement.lang === 'fr' ? './stills/fr/' : './stills/',
  import.meta.url,
)
const tiltControl = document.querySelector('.tilt-control'),
  slider = tiltControl.querySelector('input')
const step = (Math.PI * 2) / 3
const idleDuration = 4700
const wrap = (n) => ((n % 3) + 3) % 3
const clamp = (x, min, max) => Math.min(max, Math.max(min, x))
const palette = [
  [114, 149, 179],
  [185, 137, 101],
  [124, 155, 133],
]
const tones = [
  [17, 24, 31],
  [34, 24, 21],
  [19, 29, 24],
]
const initial = ids.indexOf(location.hash.slice(1))
const state = {
  angle: (initial >= 0 ? initial : wrap(history.state?.facet || 0)) * step,
  active: -1,
  phase: 'idle',
  visible: true,
  preview: false,
  tilt: 0,
}
let gesture = null,
  motion = null,
  renderer = null,
  frame = 0,
  idleTimer = 0,
  idleStart = 0,
  revision = 0
function select(index) {
  if (state.active === index) return
  state.active = index
  cover.dataset.active = index
  choices.forEach((node, i) =>
    node.setAttribute('aria-pressed', String(i === index)),
  )
  document
    .querySelectorAll('[data-preview]')
    .forEach((node, i) => (node.hidden = i !== index))
  document
    .querySelectorAll('[data-other]')
    .forEach((node, i) => (node.hidden = i === index))
  const cta = document.querySelector('[data-explore]')
  cta.href = choices[index].href
  cta.firstElementChild.textContent = t.explore[index]
  const number = '0' + (index + 1)
  document.querySelector('.story-number').textContent = number
  document.querySelector('[data-story]').textContent = t.captions[index]
  document.querySelector('.preview-no').textContent = number + ' / 03'
  document.querySelector('[data-status]').textContent =
    t.selected + ' · ' + t.names[index] + '. ' + t.captions[index]
  document
    .querySelectorAll('[data-language]')
    .forEach((a) => (a.hash = ids[index]))
  posters.src = new URL(ids[index] + '.webp', stillBase)
}
function idleProgress(now) {
  return clamp((now - idleStart) / idleDuration, 0, 1)
}
function paint(now = performance.now()) {
  const position = state.angle / step,
    base = Math.floor(position),
    f = position - base,
    a = wrap(base),
    b = wrap(base + 1)
  const blend = (arr) =>
    arr[a].map((n, i) => Math.round(n + (arr[b][i] - n) * f))
  const color = blend(palette)
  const progress = clamp(
    -cover.getBoundingClientRect().top / cover.clientHeight,
    0,
    1,
  )
  stage.style.setProperty(
    '--scroll-offset',
    reduced.matches ? '0px' : progress * 23 + 'px',
  )
  cover.style.setProperty(
    '--assembly',
    1 - ((a === 2 ? 1 - f : 0) + (b === 2 ? f : 0)),
  )
  cover.style.setProperty('--ambient', color.join(','))
  cover.style.setProperty('--ink-rgb', blend(tones).join(','))
  document
    .querySelectorAll('.drawings .motif')
    .forEach(
      (el, i) =>
        (el.style.opacity = 0.22 * ((i === a ? 1 - f : 0) + (i === b ? f : 0))),
    )
  if (renderer && state.visible && !document.hidden) {
    try {
      const progress = idleProgress(now)
      const sway = !motion && !gesture ? Math.sin(Math.PI * progress) ** 2 : 0
      // Move the rendered pose only. Selection still uses the exact magnetic stop.
      renderer(
        state.angle + sway * 0.082 * Math.sin(progress * 2 * Math.PI),
        clamp(
          state.tilt - sway * 0.038,
          (-38 * Math.PI) / 180,
          (38 * Math.PI) / 180,
        ),
        color.map((c) => c / 255),
        Math.sin(now / 4800) * 0.014,
      )
    } catch (error) {
      console.warn('Sculpture switched to its static view.', error)
      fallback()
      return
    }
  }
  if (
    state.phase === 'dragging' &&
    Math.abs(position - Math.round(position)) < 0.445
  )
    select(wrap(Math.round(position)))
}
function schedule() {
  clearTimeout(idleTimer)
  if (!frame && state.visible && !document.hidden)
    frame = requestAnimationFrame(tick)
}
function tick(now) {
  frame = 0
  if (renderer && reduced.matches) {
    fallback()
    return
  }
  if (motion) {
    const u = clamp((now - motion.start) / 560, 0, 1)
    // Hermite endpoint, with a bounded release tangent and zero terminal velocity.
    const ease = 1 - (1 - u) ** 4 * (1 + 2 * u)
    state.angle =
      motion.from +
      (motion.to - motion.from) * ease +
      motion.velocity * u * (1 - u) ** 3
    // Pitch is independent of yaw and survives the magnetic stop.
    if (u === 1) {
      state.angle = motion.to
      motion = null
      settled()
    }
  }
  paint(now)
  if (motion) schedule()
  else if (renderer && !gesture && state.visible && !document.hidden)
    idleTimer = setTimeout(schedule, idleProgress(now) < 1 ? 21 : 320)
}
function settled() {
  idleStart = performance.now()
  state.phase = state.preview ? 'previewRevealed' : 'facetSelected'
  select(wrap(Math.round(state.angle / step)))
  const locationState = new URL(location.href)
  if (ids.includes(locationState.hash.slice(1)))
    locationState.hash = ids[state.active]
  history.replaceState(
    { ...history.state, facet: state.active },
    '',
    locationState,
  )
  stage.dataset.stop = String(state.active * 120)
}
function snap(to, velocity = 0) {
  gesture = null
  stage.classList.remove('dragging')
  select(wrap(Math.round(to / step)))
  if (
    reduced.matches ||
    saveData ||
    !renderer ||
    Math.abs(to - state.angle) < 0.00001
  ) {
    motion = null
    state.angle = to
    settled()
    paint()
    schedule()
    return
  }
  state.phase = 'snapping'
  delete stage.dataset.stop
  motion = {
    from: state.angle,
    to,
    tilt: state.tilt,
    velocity: clamp(velocity * 150, -0.42, 0.42),
    start: performance.now(),
  }
  schedule()
}
function choose(i) {
  const current = Math.round(state.angle / step)
  let delta = wrap(i - wrap(current))
  if (delta === 2) delta = -1
  snap((current + delta) * step)
}
choices.forEach((a, i) => {
  a.setAttribute('role', 'button')
  a.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    choose(i)
  })
  a.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault()
      choose(i)
    }
  })
})
function tiltTo(degrees) {
  if (!renderer || reduced.matches) return
  const value = clamp(degrees, -38, 38)
  state.tilt = (value * Math.PI) / 180
  slider.value = String(Math.round(value))
  slider.setAttribute('aria-valuetext', Math.round(value) + '°')
  schedule()
}
slider.addEventListener('input', () => tiltTo(Number(slider.value)))
cover.addEventListener('keydown', (e) => {
  if (
    e.target === stage &&
    renderer &&
    ['ArrowUp', 'ArrowDown', 'Home'].includes(e.key)
  ) {
    e.preventDefault()
    tiltTo(
      e.key === 'Home'
        ? 0
        : (state.tilt * 180) / Math.PI + (e.key === 'ArrowUp' ? -5 : 5),
    )
    return
  }
  if (
    !['ArrowLeft', 'ArrowRight'].includes(e.key) ||
    !(stage.contains(e.target) || choices.includes(e.target))
  )
    return
  e.preventDefault()
  const i = wrap(state.active + (e.key === 'ArrowRight' ? 1 : -1))
  choose(i)
  if (choices.includes(e.target)) choices[i].focus()
})
stage.addEventListener('pointerdown', (e) => {
  if (!e.isPrimary || e.button !== 0 || !renderer || reduced.matches || gesture)
    return
  gesture = {
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    angle: state.angle,
    tilt: state.tilt,
    last: state.angle,
    time: e.timeStamp,
    speed: 0,
    locked: false,
  }
})
stage.addEventListener('pointermove', (e) => {
  if (!gesture || e.pointerId !== gesture.id) return
  const dx = e.clientX - gesture.x,
    dy = e.clientY - gesture.y
  if (!gesture.locked) {
    if (Math.hypot(dx, dy) < 6) return
    if (e.pointerType === 'touch' && Math.abs(dy) > Math.abs(dx)) {
      gesture = null
      return
    }
    gesture.locked = true
    motion = null
    gesture.angle = state.angle
    stage.setPointerCapture(e.pointerId)
    stage.classList.add('dragging')
    state.phase = 'dragging'
    delete stage.dataset.stop
  }
  state.angle = gesture.angle + (dx / (stage.clientWidth * 0.46)) * step
  const elapsed = Math.max(1, e.timeStamp - gesture.time)
  gesture.speed =
    0.35 * gesture.speed + (0.65 * (state.angle - gesture.last)) / elapsed
  gesture.time = e.timeStamp
  gesture.last = state.angle
  tiltTo((gesture.tilt * 180) / Math.PI + (dy / stage.clientHeight) * 95)
})
function release(e) {
  if (
    !gesture ||
    e.pointerId !== gesture.id ||
    (e.type === 'lostpointercapture' && e.target !== stage)
  )
    return
  const drag = gesture
  gesture = null
  if (drag.locked)
    snap(
      Math.round(state.angle / step) * step,
      e.timeStamp - drag.time < 90 ? drag.speed : 0,
    )
  else schedule()
}
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
  stage.addEventListener(type, release)
stage.addEventListener('pointerleave', () => {
  if (gesture && !gesture.locked) {
    gesture = null
    schedule()
  }
})
function stopFrames() {
  cancelAnimationFrame(frame)
  frame = 0
  clearTimeout(idleTimer)
}
new IntersectionObserver(([entry]) => {
  const wasVisible = state.visible
  state.visible = entry.isIntersecting
  if (state.visible && !wasVisible) idleStart = performance.now()
  if (state.visible) schedule()
  else stopFrames()
}).observe(stage)
new IntersectionObserver(([entry]) => {
  state.preview = entry.isIntersecting
  if (entry.isIntersecting) {
    document
      .querySelectorAll('[data-preview]')
      .forEach((el) => el.classList.add('revealed'))
    if (!motion && !gesture) state.phase = 'previewRevealed'
  }
}).observe(document.querySelector('#preview'))
document.addEventListener('visibilitychange', () =>
  document.hidden ? stopFrames() : schedule(),
)
new ResizeObserver(schedule).observe(stage)
window.addEventListener(
  'scroll',
  () => {
    if (state.visible && !reduced.matches) schedule()
  },
  { passive: true },
)
function fallback() {
  renderer?.dispose()
  renderer = null
  tiltControl.hidden = true
  slider.value = '0'
  stopFrames()
  motion = null
  gesture = null
  stage.classList.remove('live', 'dragging')
  stage.classList.add('static')
  state.angle = Math.round(state.angle / step) * step
  state.tilt = 0
  settled()
  paint()
  const hint = document.querySelector('.drag-hint')
  hint.textContent = t.choose
  state.phase = reduced.matches ? 'reducedMotionFallback' : 'webglFallback'
}
async function setup() {
  const version = ++revision
  fallback()
  if (reduced.matches || saveData) return
  try {
    const { createStudio } = await import('./studio.js')
    if (version !== revision) return
    renderer = createStudio(canvas)
    if (!renderer) return
    stage.classList.remove('static')
    stage.classList.add('live')
    tiltControl.hidden = false
    document.querySelector('.drag-hint').innerHTML =
      '<span aria-hidden="true">↔</span> ' + t.drag
    state.phase = 'idle'
    idleStart = performance.now()
    schedule()
  } catch (err) {
    console.warn('Static sculpture selected.', err)
    fallback()
  }
}
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault()
  ++revision
  fallback()
})
canvas.addEventListener('webglcontextrestored', setup)
reduced.addEventListener('change', setup)
document.querySelectorAll('.enter').forEach((a) =>
  a.addEventListener('click', (e) => {
    if (
      e.button ||
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey ||
      reduced.matches ||
      !renderer ||
      !state.visible
    )
      return
    e.preventDefault()
    state.phase = 'navigating'
    cover.classList.add('navigating')
    setTimeout(() => location.assign(a.href), 160)
  }),
)
window.addEventListener('pageshow', () => cover.classList.remove('navigating'))
select(wrap(Math.round(state.angle / step)))
setup()
