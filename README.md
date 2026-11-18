# The Three Facets

A static bilingual portfolio for Enzo Charolois. The site runs from the repository root or a GitHub Pages project prefix. The ten English and French HTML entry points are checked in. All runtime assets are local.

## Edit and preview

Run `node src/build.mjs` from the checkout after changing templates or content. Serve the checkout with a static HTTP server, for example `python -m http.server 4173 --bind 127.0.0.1`. Open `http://127.0.0.1:4173/` or `/fr/`. The build uses Node’s standard library.

- `facets/content.js` holds shared labels, the home introduction and facet previews.
- `src/world-content.mjs` holds the bilingual case studies, interactive observations and publication records.
- `src/build.mjs`, `src/worlds.mjs` and `src/graphics.mjs` generate semantic pages and the three environmental drawings.
- `facets/mesh.js` constructs the rounded triangular perimeter, fluted foot, three main faces and inclined crown. `facets/studio.js` draws the rear normals and depth to a texture, then shades the visible surface using thickness, refraction, absorption and studio reflections. The three language-specific inscriptions use a mipmapped engraving atlas. Their masks follow physical face coordinates as the sculpture turns.
- `facets/home.js` owns the gesture, yaw stops, independent pitch, environment and selected preview. Horizontal dragging chooses the nearest 120° stop on release. Vertical mouse movement, the tilt slider and the up/down keys adjust pitch. Home levels the sculpture when it has focus. Vertical touch gestures scroll the document.
- `facets/stills/` contains browser renders of the same mesh for reduced motion, data saving and graphics fallback. `facets/world.js` progressively enhances the static checkpoint and project views.

## Content provenance

The banking account uses the supplied brief. Its four checkpoints and all ticket values are fictional. The recommendation illustration ranks a small set of invented vectors by cosine similarity. Public project descriptions and CVs come from the original portfolio at commit `8f77747`.

Publication dates use the publisher’s Crossref deposits. The conference took place later in September 2025. EURECOM’s institutional deposit for the journal article predates ACM’s online publication date. Titles and author order follow the individual publications.

- [ACM research paper](https://doi.org/10.1145/3705328.3748053)
- [ACM demonstration paper](https://doi.org/10.1145/3705328.3759336)
- [ACM journal article](https://doi.org/10.1145/3859880)

This checkout is for local review on `design/three-facets`. The existing Pages configuration is preserved. Publication requires the owner’s approval.
