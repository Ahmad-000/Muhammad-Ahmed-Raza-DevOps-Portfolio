import { identity } from '../../data/identity'
import './identity.css'

const icons = {
  github: (
    <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
  ),
  linkedin: (
    <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" />
  ),
  email: (
    <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1.6 2 7.4 5.6L19.4 7H4.6zM4 17h16V9.3l-8 6-8-6V17z" />
  ),
}

/** Corner brackets that frame the portrait like a hologram projection. */
function Brackets() {
  return (
    <span className="idc-brackets" aria-hidden="true">
      <i className="tl" />
      <i className="tr" />
      <i className="bl" />
      <i className="br" />
    </span>
  )
}

/** Decorative cluster of linked nodes, echoing the 3D scene. Purely visual. */
function NetworkMotif() {
  const nodes: [number, number, number][] = [
    [14, 44, 3.2],
    [48, 14, 2.6],
    [88, 34, 3.4],
    [64, 66, 2.4],
    [112, 70, 2.8],
    [34, 78, 2.2],
  ]
  const links = [
    [0, 1],
    [1, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [0, 5],
    [5, 3],
  ]
  return (
    <svg className="idc-net" viewBox="0 0 126 90" aria-hidden="true">
      <g stroke="rgb(0 240 255)" strokeOpacity="0.4" strokeWidth="0.8" fill="none">
        {links.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} />
        ))}
      </g>
      {nodes.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={i % 3 === 0 ? 'rgb(185 139 255)' : 'rgb(0 240 255)'} />
          {i % 2 === 0 && (
            <circle className="pulse" cx={x} cy={y} r={r + 2} fill="none" stroke="rgb(0 240 255)" strokeOpacity="0.5" />
          )}
        </g>
      ))}
    </svg>
  )
}

function CertMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 20.5 7v10L12 22 3.5 17V7z"
        fill="rgba(121,40,202,0.35)"
        stroke="rgb(185 139 255)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m8 12.2 2.8 2.8L16.2 9.4" fill="none" stroke="rgb(232 238 247)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The card face. Plain HTML so the text stays crisp and the links work.
 * `staged` means the 3D scene supplies the glass, so the face stays transparent;
 * otherwise it draws its own glass so it still looks right with no WebGL.
 */
export function IdentityCard({ staged }: { staged: boolean }) {
  const { education: edu } = identity

  return (
    <div
      className={`idc ${staged ? '' : 'glass edge'}`}
      role="group"
      aria-label="Digital identity card"
    >
      <NetworkMotif />

      <div className="idc-photo-wrap">
        <div className="idc-photo">
          <img
            src={identity.photo.src}
            alt={identity.photo.alt}
            width={identity.photo.width}
            height={identity.photo.height}
            decoding="async"
            draggable={false}
          />
        </div>
        <Brackets />
      </div>

      <div className="idc-head">
        <p className="idc-eyebrow">
          <span className="led" aria-hidden="true" />
          {identity.eyebrow}
        </p>
        <h3 className="idc-name">{identity.name}</h3>
        <p className="idc-title">{identity.title}</p>
      </div>

      <div className="idc-rest">
        <hr className="idc-rule" />
        <div>
          <p className="idc-uni">{edu.university}</p>
          <p className="idc-sub">
            {edu.campus} &middot; {edu.degree}
          </p>
          <p className="idc-sub">
            {edu.status} {edu.year}
          </p>
        </div>

        <p className="idc-cert">
          <CertMark />
          {identity.certification}
        </p>

        <ul className="idc-links" aria-label="Contact links">
          {identity.links.map((l) => (
            <li key={l.key}>
              <a
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {icons[l.key]}
                </svg>
                {l.label}
                {l.external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="idc-sheen" aria-hidden="true" />
    </div>
  )
}
