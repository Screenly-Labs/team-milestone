// Browser entry. Bun bundles this (inlining ./milestone) into a self-contained
// classic script with no exports, so it loads from a plain <script>. Keep it
// export-free and free of top-level await.

import { buildConfetti, type ConfettiPiece, parseConfig } from './milestone'

// Shown when the page is opened with no settings (e.g. the store preview or a
// bare visit), so the screen is never blank and demonstrates the format. Real
// deployments carry the milestone in the launch URL's query string.
const EXAMPLE =
  'team=Team+Phoenix&value=5+Years&label=of+building+together&message=Thank+you+for+every+late+night,+every+launch,+and+every+win.&date=July+2026'

// How many scraps of confetti to scatter. Static count — plenty for a festive
// screen without overwhelming a low-powered signage player.
const CONFETTI_COUNT = 60

const text = (id: string, value: string): void => {
  const el = document.getElementById(id)
  if (el) el.textContent = value
}

// Reveal an element only when it has content; otherwise take it out of the flow
// so an absent field doesn't leave a gap.
const setLine = (id: string, value: string): void => {
  const el = document.getElementById(id)
  if (!el) return
  el.textContent = value
  el.hidden = value.length === 0
}

const render = (params: URLSearchParams): void => {
  const config = parseConfig(params)

  setLine('team', config.team)
  text('value', config.value)
  setLine('label', config.label)
  setLine('message', config.message)
  setLine('date', config.date)

  const title = config.team ? `${config.team} — ${config.value}` : config.value
  document.title = `${title} | Team Milestone`

  scatterConfetti()
  document.documentElement.dataset.state = 'ready'
}

// Build the confetti DOM from the pure layout helper, handing each scrap its
// geometry via custom properties the stylesheet animates.
const scatterConfetti = (): void => {
  const field = document.getElementById('confetti')
  if (!field) return
  const pieces = buildConfetti(CONFETTI_COUNT)
  const nodes = pieces.map((piece: ConfettiPiece) => {
    const el = document.createElement('span')
    el.className = piece.round ? 'confetti__bit confetti__bit--round' : 'confetti__bit'
    el.style.setProperty('--left', `${piece.left * 100}%`)
    el.style.setProperty('--delay', `${piece.delay}s`)
    el.style.setProperty('--duration', `${piece.duration}s`)
    el.style.setProperty('--drift', `${piece.drift * 12}vw`)
    el.style.setProperty('--rotate', `${piece.rotate}deg`)
    el.style.setProperty('--size', `${piece.size}`)
    // Colour is a reference to a palette token defined in the stylesheet.
    el.style.setProperty('--bit-color', `var(--confetti-${piece.hue})`)
    return el
  })
  field.replaceChildren(...nodes)
}

// On a Screenly player the viewer is already a Screenly customer, so the
// promotional Screenly badge is removed. The 'screenly-viewer' token in the user
// agent marks these devices; every other browser keeps the badge.
const removeScreenlyBranding = (): void => {
  if (navigator.userAgent.includes('screenly-viewer')) {
    document.querySelector('.brand')?.remove()
  }
}

const init = (): void => {
  removeScreenlyBranding()
  render(new URLSearchParams(window.location.search || `?${EXAMPLE}`))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
