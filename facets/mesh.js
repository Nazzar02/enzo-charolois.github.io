// A rounded triangular section lofted into a leaning, obliquely cut blade.
// Lower sections follow a sloping parting line. Each rib has a recessed root,
// an inclined flank and a narrow polished crest; the silhouette changes with light.
const TAU = Math.PI * 2
const mix = (a, b, t) => a + (b - a) * t
const corner = (i) => [
  Math.sin((i * TAU) / 3 + 0.21),
  Math.cos((i * TAU) / 3 + 0.21),
]
const lerp = (a, b, t) => a.map((n, i) => mix(n, b[i], t))
const unit = (v) => v.map((n) => n / (Math.hypot(...v) || 1))
const sub = (a, b) => a.map((v, i) => v - b[i])
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

function perimeter() {
  const path = []
  for (let i = 0; i < 3; i++) {
    const c = corner(i),
      prev = corner(i - 1),
      next = corner(i + 1)
    const left = lerp(c, prev, 0.045),
      right = lerp(c, next, 0.045)
    for (let s = 0; s < 7; s++) {
      const t = s / 7
      path.push(lerp(lerp(left, c, t), lerp(c, right, t), t))
    }
    const end = lerp(next, c, 0.045)
    for (let s = 0; s < 20; s++) {
      const u = s / 20,
        p = lerp(right, end, u)
      const crown = 1 + 0.038 * Math.sin(Math.PI * u)
      path.push(p.map((n) => n * crown))
    }
  }
  return path
}
export function strataMesh(opticalHull = false) {
  const path = perimeter()
  const rows = []
  function ring(level, radius, metal, upper = false) {
    rows.push(
      path.map(([x, z]) => {
        const cut = 0.29 + 0.16 * x + 0.042 * z
        const shoulder = 0.7 + 0.095 * x - 0.07 * z
        const h = upper
          ? level <= 0.58
            ? mix(cut, shoulder, level / 0.58)
            : mix(shoulder, 1, (level - 0.58) / 0.42)
          : level * cut
        const foot = 0.7 + 0.3 * Math.min(1, h / 0.155)
        const outline =
          upper && level > 0.58
            ? mix(1 - 0.52 * shoulder, 0.065, (level - 0.58) / 0.42)
            : 1 - 0.52 * h
        const width = foot * outline * radius
        return {
          p: [
            x * width * 1.39 + 0.33 * h,
            -1.31 + h * (2.67 + 0.25 * x - 0.16 * z),
            z * width * 1.39 - 0.06 * h,
          ],
          metal: upper ? metal : -1 - metal,
        }
      }),
    )
  }
  ring(0, 0.982, 0.25)
  // The rear optical interface follows the polished envelope beneath the grooves.
  if (opticalHull) {
    for (const level of [0.15, 0.35, 0.55, 0.75, 0.92]) ring(level, 0.99, 0.6)
  } else
    for (let i = 0; i < 21; i++) {
      for (const [phase, radius, metal] of [
        [0, 0.997, 0.18],
        [0.14, 1.003, 0.78],
        [0.29, 1.003, 0.93],
        [0.76, 0.98, 0.26],
        [0.91, 0.981, 0.16],
      ]) {
        ring((i + phase) / 21, radius, metal)
      }
    }
  ring(1, 1, 0.85)
  for (const h of [0.004, 0.2, 0.575, 0.58, 0.586, 0.8, 0.985, 0.998])
    ring(h, 1, 0.6, true)
  ring(1, 0.94, 0.88, true)
  const vertices = []
  function vertex(row, i, normal) {
    const { p, metal } = rows[row][i]
    vertices.push(...p, ...normal, metal)
  }
  for (let r = 0; r < rows.length - 1; r++) {
    const normals = path.map((_, i) => {
      const left = (i + path.length - 1) % path.length,
        right = (i + 1) % path.length
      return unit(
        cross(
          sub(rows[r][right].p, rows[r][left].p),
          sub(rows[r + 1][i].p, rows[r][i].p),
        ),
      )
    })
    for (let i = 0; i < path.length; i++) {
      const j = (i + 1) % path.length
      vertex(r, i, normals[i])
      vertex(r, j, normals[j])
      vertex(r + 1, i, normals[i])
      vertex(r, j, normals[j])
      vertex(r + 1, j, normals[j])
      vertex(r + 1, i, normals[i])
    }
  }
  for (const r of [0, rows.length - 1]) {
    const n = r
      ? unit(
          cross(
            sub(rows[r][20].p, rows[r][0].p),
            sub(rows[r][42].p, rows[r][0].p),
          ),
        )
      : [0, -1, 0]
    for (let i = 1; i < path.length - 1; i++)
      for (const k of r ? [0, i, i + 1] : [0, i + 1, i]) vertex(r, k, n)
  }
  return new Float32Array(vertices)
}
