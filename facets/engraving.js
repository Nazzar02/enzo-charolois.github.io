import { languages } from './content.js'

// One atlas, three physical engravings. Each row travels with a lateral face.
// The unused fourth row keeps this texture power-of-two for mipmapped minification.
export function engravingPlate(locale) {
  const labels = languages[locale].short
  const plate = document.createElement('canvas')
  plate.width = 1024
  plate.height = 1024
  const ctx = plate.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 1024, 1024)
  function stroke(points) {
    ctx.beginPath()
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.stroke()
  }
  function node(x, y, r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let face = 0; face < 3; face++) {
    ctx.save()
    ctx.translate(512, face * 256 + 68)
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#fff'
    ctx.lineWidth = 7
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    if (face === 0) {
      // Two records travelling through the same reconciliation point.
      stroke([
        [-61, 17],
        [-34, 17],
        [-10, -8],
        [11, -8],
        [35, -31],
        [58, -31],
      ])
      stroke([
        [-58, 32],
        [-26, 32],
        [0, 6],
        [21, 6],
        [45, -18],
        [61, -18],
      ])
      node(-61, 17, 5)
      node(58, -31, 5)
    } else if (face === 1) {
      // A query and its three neighbours in an embedding space.
      for (const [x, y] of [
        [-44, 19],
        [9, -32],
        [47, 15],
      ]) {
        stroke([
          [0, 5],
          [x, y],
        ])
        node(x, y, 7.5)
      }
      node(0, 5, 10)
    } else {
      // The same modular construction shown in the engineering world.
      stroke([
        [-39, -6],
        [0, -29],
        [39, -6],
        [39, 23],
        [0, 45],
        [-39, 23],
        [-39, -6],
        [0, 16],
        [39, -6],
      ])
      stroke([
        [0, 16],
        [0, 45],
      ])
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '500 82px Arial, sans-serif'
    ctx.letterSpacing = '7px'
    ctx.fillText(labels[face].toLocaleUpperCase(locale), 0, 111, 930)
    ctx.restore()
  }
  return plate
}
