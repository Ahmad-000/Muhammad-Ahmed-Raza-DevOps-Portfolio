import * as THREE from 'three'

/** Small deterministic PRNG so layouts are identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Renders a short mono label into a texture for use on a sprite. */
export function makeLabelTexture(text: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 80
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(13, 17, 23, 0.82)'
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(4, 4, 312, 72, 18)
  ctx.fill()
  ctx.stroke()
  ctx.font = '600 30px "IBM Plex Mono", ui-monospace, Menlo, monospace'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 160, 42)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
