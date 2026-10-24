/** CSS-only stand-in for the 3D scene: shown while it loads, if WebGL is missing, or if it crashes. */
export function StaticBackdrop() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(60% 50% at 72% 38%, rgba(0,240,255,0.15), transparent 70%), radial-gradient(50% 45% at 22% 82%, rgba(121,40,202,0.22), transparent 70%), #0d1117',
      }}
    />
  )
}
