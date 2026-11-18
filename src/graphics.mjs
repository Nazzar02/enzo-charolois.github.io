// Each drawing shares the same field of view as the sculpture.
export const mark =
  '<svg viewBox="0 0 30 32" fill="none" aria-hidden="true"><path d="M3 25 17 2l10 25-14-5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M17 2 13 22m0 0L3 25m10-3 9 5" stroke="currentColor" stroke-width="1.2"/></svg>'
export function motif(i) {
  const group = (body) =>
    '<svg class="motif motif-' +
    i +
    '" viewBox="0 0 640 450" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
    body +
    '</svg>'
  if (i === 0) {
    let paths = ''
    for (let j = 0; j < 15; j++) {
      const y = 233 + j * 8
      paths +=
        '<path d="M-50 ' +
        (y + 62) +
        ' L' +
        (142 + j * 3) +
        ' ' +
        (y + 62) +
        ' l60 -38 h' +
        (100 + j * 4) +
        ' l80 -54 h300"/>'
    }
    return group(
      '<g stroke="currentColor" stroke-width=".85">' +
        paths +
        '</g><g fill="currentColor"><circle cx="200" cy="259" r="2"/><circle cx="446" cy="253" r="2"/><circle cx="472" cy="198" r="2"/></g>',
    )
  }
  if (i === 1) {
    let dots = '',
      edges = ''
    for (let k = 0; k < 3; k++) {
      const cx = [150, 414, 486][k],
        cy = [262, 165, 315][k]
      for (let j = 1; j < 54; j++) {
        const a = j * 2.399,
          r = Math.sqrt(j) * 6.4
        const x = (cx + Math.cos(a) * r * 1.3).toFixed(1),
          y = (cy + Math.sin(a) * r * 0.65).toFixed(1)
        dots +=
          '<circle cx="' +
          x +
          '" cy="' +
          y +
          '" r="' +
          (j % 8 === 0 ? 2.1 : 1.2) +
          '"/>'
        if (j % 9 === 0)
          edges += '<path d="M' + cx + ' ' + cy + 'L' + x + ' ' + y + '"/>'
      }
    }
    return group(
      '<g stroke="currentColor" opacity=".6">' +
        edges +
        '</g><g fill="currentColor">' +
        dots +
        '</g>',
    )
  }
  let blocks = ''
  for (let j = 0; j < 7; j++) {
    const x = 100 + 55 * j,
      y = 285 - j * 13
    blocks +=
      '<path style="--lift:' +
      (j - 3) * 8 +
      'px" d="M' +
      x +
      ' ' +
      y +
      'l30 -17 30 17 -30 17z m0 0v32l30 17 30 -17v-32 m-30 17v32"/>'
  }
  return group('<g stroke="currentColor" stroke-width="1.1">' + blocks + '</g>')
}
