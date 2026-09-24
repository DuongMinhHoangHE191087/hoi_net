/**
 * Generates the before/after showcase images used on the homepage's
 * "Kết Quả Thực Tế" section (components/sections/SocialProofSection.tsx).
 *
 * These are illustrative mockups, not real customer photos - we don't
 * have real restoration results to show, and using stock photos of
 * unknown license/consent as fake "before/after" marketing claims would
 * be dishonest. Instead this draws a simple abstract family-portrait
 * silhouette twice: once styled to look aged/damaged (sepia tone, film
 * grain, scratches, vignette, soft blur), once styled clean and vivid,
 * so the pair reads clearly as "restoration demo art", not a claim
 * about a specific photo.
 *
 * Re-run with: node scripts/generate-showcase-images.js
 * Requires the `sharp` dependency already used elsewhere in the app.
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'showcase')
const WIDTH = 800
const HEIGHT = 600

// Deterministic pseudo-random so re-running the script reproduces the
// same grain/scratch pattern instead of a new one every time.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Three classic avatar-style busts (head + shoulders), spaced apart so
 * each reads distinctly as "a person" - overlapping blobs looked like a
 * single amorphous cloud instead of a family group. */
function bust(cx, headY, headR, shoulderW, shoulderH) {
  return `
    <circle cx="${cx}" cy="${headY}" r="${headR}" />
    <path d="M ${cx - shoulderW / 2} ${headY + headR + shoulderH}
             Q ${cx - shoulderW / 2} ${headY + headR * 0.7} ${cx} ${headY + headR * 0.7}
             Q ${cx + shoulderW / 2} ${headY + headR * 0.7} ${cx + shoulderW / 2} ${headY + headR + shoulderH}
             Z" />
  `
}

function familySilhouette({ fill, opacity = 1 }) {
  return `
    <g fill="${fill}" opacity="${opacity}">
      ${bust(280, 300, 58, 150, 190)}
      ${bust(400, 260, 66, 175, 220)}
      ${bust(520, 300, 58, 150, 190)}
    </g>
  `
}

function grainDots(rand, count, opacityRange) {
  let dots = ''
  for (let i = 0; i < count; i++) {
    const x = rand() * WIDTH
    const y = rand() * HEIGHT
    const r = rand() * 1.4 + 0.3
    const o = opacityRange[0] + rand() * (opacityRange[1] - opacityRange[0])
    const shade = rand() > 0.5 ? '#000000' : '#ffffff'
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${shade}" opacity="${o.toFixed(2)}" />`
  }
  return dots
}

function scratches(rand, count) {
  let lines = ''
  for (let i = 0; i < count; i++) {
    const x1 = rand() * WIDTH
    const y1 = rand() * HEIGHT * 0.3
    const x2 = x1 + (rand() - 0.5) * 60
    const y2 = y1 + HEIGHT * (0.5 + rand() * 0.5)
    const o = 0.15 + rand() * 0.25
    lines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#fff8ec" stroke-width="${(0.6 + rand()).toFixed(2)}" opacity="${o.toFixed(2)}" />`
  }
  return lines
}

function beforeSVG({ seed, bgFrom, bgTo, silhouetteFill }) {
  const rand = mulberry32(seed)
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgFrom}" />
      <stop offset="100%" stop-color="${bgTo}" />
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#2b1a0f" stop-opacity="0.55" />
    </radialGradient>
    <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.6" />
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <g filter="url(#soften)" opacity="0.9">
    ${familySilhouette({ fill: silhouetteFill, opacity: 0.85 })}
  </g>
  ${grainDots(rand, 900, [0.05, 0.22])}
  ${scratches(rand, 5)}
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#vignette)" />
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="none" stroke="#f5e9d6" stroke-width="14" opacity="0.5" />
</svg>`
}

function afterSVG({ bgFrom, bgTo, silhouetteFill }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgFrom}" />
      <stop offset="100%" stop-color="${bgTo}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)" />
  ${familySilhouette({ fill: silhouetteFill, opacity: 1 })}
</svg>`
}

const PAIRS = [
  {
    name: 'family-restore',
    before: beforeSVG({
      seed: 42,
      bgFrom: '#d9c39a',
      bgTo: '#b99b68',
      silhouetteFill: '#6b5238',
    }),
    after: afterSVG({
      bgFrom: '#818cf8',
      bgTo: '#c084fc',
      silhouetteFill: '#2f2350',
    }),
  },
  {
    name: 'quality-upgrade',
    before: beforeSVG({
      seed: 7,
      bgFrom: '#e8ddc7',
      bgTo: '#cbb98f',
      silhouetteFill: '#8a7654',
    }),
    after: afterSVG({
      bgFrom: '#10b981',
      bgTo: '#06b6d4',
      silhouetteFill: '#053b3b',
    }),
  },
]

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const pair of PAIRS) {
    const beforePath = path.join(OUT_DIR, `${pair.name}-before.png`)
    const afterPath = path.join(OUT_DIR, `${pair.name}-after.png`)

    await sharp(Buffer.from(pair.before)).png({ quality: 90 }).toFile(beforePath)
    await sharp(Buffer.from(pair.after)).png({ quality: 90 }).toFile(afterPath)

    console.log(`Generated ${beforePath}`)
    console.log(`Generated ${afterPath}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
