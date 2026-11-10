# Smart Sort · Mission 3 integration

The confirmed Smart Sort Laundry System model from Mission 2 now replaces the concept illustration in the Smart Sort overview hero and pricing product presentation. The existing React/Vite project, personal homepage, navigation, pricing ($179 USD), sorting demo, audience tabs, FAQ, feature explorer and Pages workflow remain in place.

## Model provenance

Confirmed on November 3, 2026, at 19:56:54 UTC. Schema: 1.0.0. SHA-256: `f60c9e6231b2c7e06b8e5089920b59fd944240f7129f8faea6651166f26a37f9`. The 1,908,552-byte GLB has 34 meshes and no external buffer or texture dependencies. The supplied open-lid model is used unchanged. Its full bounding dimensions include the raised lid; they are not closed-cabinet engineering dimensions.

Assets: `public/assets/smart-sort-3d/model.glb`, `model-manifest.json`, `preview.png`.

## Customer experience

Drag or swipe horizontally to turn the model. Use + / − to zoom without capturing normal page scrolling. Use Reset, Front, Side or Compartments to explore. The canvas also accepts arrow keys. Camera presets adapt the manifest's preferred orientation to available space. Lighting and the transparent background match the existing teal/lime brand.

3D code loads when the presentation approaches the viewport. Rendering pauses outside the viewport or when the tab is hidden; pixel density is capped. The preview image remains available while loading. Unsupported WebGL 2, load/integrity failure or context loss displays a clearly labeled static preview. View static preview is also available manually. Reduced-motion preferences disable entrance transitions, camera easing and orbit damping. There is no automatic rotation.

## Development and verification

Node 22+: `npm ci`, `npm run lint`, `npm run build`, `npm run preview`. Existing base path: `/creative-website/`. GitHub Actions continues to type-check, build and deploy all existing routes.

Local browser fixtures: start `npm run dev`; visit `/creative-website/qa/compatibility.html` to withhold WebGL and test the actual fallback path, or append `?reduced` to test reduced-motion behavior without changing device settings. These fixture pages are not production build entries.

Chrome checks covered 3D rendering, drag rotation, keyboard input, zoom, reset, camera views, static preview and restoration, original sorting demo/reset, audience tabs, pricing feature explorer, navigation, FAQ, 390px mobile layout and 1280px desktop layout. Both mobile routes fit without horizontal overflow. The fallback fixture showed the authoritative preview when WebGL was withheld. The reduced-motion fixture reported reduced mode and zero CSS transition durations.

The original site is recoverable from `backup/pre-mission-3-2026-11-10` (baseline commit `af1d3e0`). No original image asset was deleted.

## Updating from Mission 2

Reopen Venture Studio, import your editable project if needed, revise it and choose Confirm Model. Download a new Venture_3D_Confirmed_Handoff.zip into your Mission 3 folder, then ask Codex to rerun Mission 3 with that package. Validate schema, mesh data and checksum before replacing the three asset files above. Rebuild, test both routes and deploy. Do not hand-edit the manifest checksum to conceal an asset mismatch.

## Limits

The confirmed asset is a geometric concept prototype, not an operational sorting simulation. This integration does not add or verify product capabilities. Physical touchscreen testing and an exhaustive browser/device matrix were not performed. WebGL 2 is required for interaction; other environments receive the static image. Vite reports a bundle-size advisory for the separately loaded Three.js chunk (about 153 KB compressed).
