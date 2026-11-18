// The HTML already contains every observation. Enhance the checkpoint links
// into an in-place comparison only when the browser can run the interaction.
const picks = [...document.querySelectorAll('[data-pick]')]
const panels = [...document.querySelectorAll('[data-result]')]
function activate(i) {
  picks.forEach((a, j) => a.setAttribute('aria-pressed', String(i === j)))
  panels.forEach((p, j) => (p.hidden = i !== j))
}
if (picks.length) {
  picks.forEach((a, i) => {
    a.setAttribute('role', 'button')
    a.setAttribute('aria-controls', panels[i].id)
    a.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      activate(i)
    })
    a.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault()
        activate(i)
        return
      }
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
      e.preventDefault()
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? picks.length - 1
            : (i + (e.key === 'ArrowLeft' ? -1 : 1) + picks.length) %
              picks.length
      activate(next)
      picks[next].focus()
    })
  })
  activate(
    Math.max(
      0,
      panels.findIndex((p) => '#' + p.id === location.hash),
    ),
  )
}
