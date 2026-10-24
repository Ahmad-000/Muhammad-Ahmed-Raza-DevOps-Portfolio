# DevOps portfolio, 3D scroll experience

A single-page portfolio where scrolling flies a camera through a 3D infrastructure: a Kubernetes-style
cluster, server racks, pipeline gates and a floor grid with terminal windows. Built with React,
react-three-fiber (three.js), Motion (the successor to Framer Motion) and Tailwind CSS v4.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve the build locally
```

## Make it yours

Everything personal lives in `src/data/`. All of it is placeholder content, so replace it before publishing.

| File | What it controls |
| --- | --- |
| `profile.ts` | Name, handle, title, intro, email, GitHub and LinkedIn links, hero stats |
| `skills.ts` | The four tool categories, proficiency scores, notes and the pipeline stages shown per category |
| `projects.ts` | Project cards, metrics, architecture diagrams (nodes and edges) and repo links |
| `career.ts` | The lines printed by `cat career.txt` in the terminal |

Also replace `public/resume.pdf` (currently a placeholder) and the title and description in `index.html`.
The numbers (99.99% uptime, 80% faster deployments and so on) are illustrative: use your own.

## How the scroll journey works

- `src/lib/scrollStore.ts` is a plain module that holds scroll progress and pointer position. The 3D render
  loop reads it directly, so scrolling never triggers React renders.
- Each page section marked `data-station="0..4"` is a stop on the camera path. `useScrollBridge` measures
  where each one sits, so the 3D stations line up with the sections however tall they are.
- `src/three/constants.ts` defines the camera spline. `CameraRig.tsx` damps the camera along it.
- To add a scene element, create a component in `src/three/`, then mount it in `Scene.tsx` at a z position
  along the spline.

## Performance

- three.js lives in its own lazily loaded chunk, so the page text paints before the 3D scene.
- Nodes, packets, LEDs and gate artifacts are instanced meshes. The ambient particle stream, floor grid and
  terminal panels animate in shaders on the GPU.
- A device tier (`high` or `low`) scales node counts, particle counts and pixel ratio, and drops the
  backdrop blur on weaker devices.
- A frame governor lowers the pixel ratio if the frame rate falls below roughly 42 fps. It only steps down.
- With motion off, the canvas renders on demand and only the hero cluster is mounted.

Frame rate depends on the GPU, so profile on your target devices (Chrome DevTools, Performance panel).

## Accessibility

- Respects `prefers-reduced-motion`, and a "Motion on/off" toggle in the nav lets visitors choose.
- Skip link, landmarks, visible focus rings, 44px touch targets and labelled form fields.
- The terminal is a real input with a live-region log. Tab completes, arrow keys browse history, and
  Ctrl+C stops a running script. Every command also has a tap-to-run button.
- If WebGL is unavailable or the scene fails to start, a static gradient backdrop is shown instead.
- An automated axe-core audit (WCAG 2.2 AA plus best practices) reported no violations on desktop and mobile.

## Things to know

- The contact form has no server. Sending opens the visitor's email app with the message filled in.
- "All systems operational" and the latency numbers are decorative and simulated, not wired to real monitoring.
- Terminal commands: `help`, `whoami`, `ls`, `cat skills.txt`, `cat career.txt`, `cat contact.txt`,
  `kubectl get projects`, `kubectl describe <name>`, `ping status`, `./deploy.sh`, `clear`, and one hidden extra.

## Structure

```
src/
  components/   page sections and UI pieces (Hero, TechStack, Projects, Terminal, Contact ...)
  three/        3D scene: CameraRig, ClusterSphere, ServerRacks, PipelineGates, HoloGrid, DataStream ...
  hooks/        useEffects (device tier, reduced motion, WebGL check), useScrollBridge
  lib/          scrollStore (shared scroll state), terminal (command engine)
  data/         the content you edit
```
