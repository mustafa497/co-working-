# WorkHall website (2026)

The marketing site for **WorkHall**, a coworking company with five branches in Karachi. One page
sells the spaces (hero, amenities, plans, community, locations map) and each branch has its own
page.

## Run it locally

```bash
npm install        # first time only
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-checks (`tsc -b`) and builds to `dist/` |
| `npm run preview` | Serves the built site |
| `npm run lint` | ESLint |

Built and tested with Node 24. The page uses 3D (Three.js) and a map, so the dev server can use a
lot of memory; close heavy apps if it gets stopped.

## Stack

React 19 · TypeScript · Vite 8 · React Router 7 · Motion (animation) · Lenis (smooth scroll) ·
Three.js with React Three Fiber and Rapier (3D) · MapLibre GL (map) · lucide-react (icons).

## Pages

| URL | Page |
|---|---|
| `/` | Home |
| `/locations/shahrah-e-faisal`, `/zamzama`, `/tipu-sultan`, `/pechs`, `/gulshan` | One page per branch |
| `/text-effects-lab` | Internal test page for text effects |

`vercel.json` rewrites `/locations/*` and `/text-effects-lab` to `index.html`, so those URLs work
when deployed to Vercel. An unknown `/locations/...` address currently shows the home page.

## Home page, top to bottom

1. **Nav** (`components/layout/FigmaFunctionalNav.tsx`): maroon bar. After about 90px of
   scrolling it glides to the top-right corner and stays on screen. On screens 1280px wide and
   under it becomes a floating menu button.
2. **Hero** (`App.tsx`): headline, booking bar, stats, and the **folding cards** photo
   (`components/FoldingCards.tsx`). Each photo's top half folds down like a flip-calendar page to
   show the next one.
3. **Amenities** (`components/AmenitiesMarquee.tsx`): a scrolling strip of illustrated cards that
   flip on hover to show details. Illustrations are in `components/AmenityScenes.tsx`.
4. **Plans** (`components/PlansScrollSection.tsx`): Individuals, Teams and Enterprises cards that
   slide sideways as you scroll.
5. **Purpose Halls** (`components/PurposeHallsSection.tsx`): meeting rooms, studios, day pass,
   virtual office, stepping through with a photo frame.
6. **Community** (`components/CommunitySection.tsx`): a heading whose letters fly into place, and
   rows of logo and photo cards that slide sideways while you scroll.
7. **Why WorkHall**, **Promise**, **Testimonials**, **Workspace quiz**.
8. **Locations map** (`components/locations/LocationsMapSection.tsx`): the five branches on a
   map. Map pictures come from OpenFreeMap (free, no API key).
9. **Footer**.

## Where to change things

| To change | Edit |
|---|---|
| Hero photos (the folding cards) | `src/data/heroSlides.ts` |
| Hero stats (06 / 07+ / 800+ / 40k+) | `stats` at the top of `src/App.tsx` |
| Amenity names and descriptions | `amenities` in `src/components/AmenitiesMarquee.tsx` |
| Plan names, descriptions, photos | `individualCards`, `teamCards`, `enterpriseCards` in `PlansScrollSection.tsx` |
| Purpose hall names and text | `steps` in `PurposeHallsSection.tsx` |
| Community cards | `tiles` in `CommunitySection.tsx` |
| Branches and prices | `src/data/siteContent.ts`, `src/data/locationPages.ts` |
| Testimonials | `src/components/testimonialData.ts` |
| Footer links | `src/components/Footer/footerData.ts` |
| Docking nav timing | `DOCK_ON`, `DOCK_OFF` in `FigmaFunctionalNav.tsx` |
| Folding card timing | `--fold-ms`, `--hold-ms` in `FoldingCards.css` (and `FOLD_MS` in the `.tsx`) |

## Styling notes

- Main colours: orange `#d26d45`, maroon `#9d2b30` (nav), ink `#15110d`, page `#fbfaf7`.
- `src/styles/figma-match.css` is loaded after `App.css` and holds the changes made to match the
  Figma design (hero layout, booking bar, plans cards, nav docking, spacing under the compact
  bar). If something looks different from `App.css`, look there first.
- Motion respects the visitor's "reduce motion" setting: folding cards, flying text, the dock glide
  and card animations switch off or become instant.
- `skills/flying-rotation/SKILL.md` describes the "flying letters" text effect used on the
  Community heading.

## Design source (Figma)

File: **Work Hall and Work Town**
https://www.figma.com/design/AglWc5LOeHWtNYYdkSOEBP/Work-Hall-and-Work-Town

- **Page 1:** the WorkHall homepage designs (hero, amenities strip, Plans) plus a mood board.
  This is what the site was matched to.
- **Page 2:** Work Town designs (a video and animation studio look).
- **Page 3:** an unrelated SaaS design agency page. Not part of this site.
- **Not all words in the Figma are WorkHall's.** Page 1 has pieces of a third-party coworking
  template (`workscape.framer.website`: "Private Office – Secluded, secure, and fully furnished.",
  "Pricing Plan", "Explore Spaces"), and Page 3 is another company's copy. Treat Figma text as a
  layout guide, not final wording.
- There is no testimonials design in the Figma.
- Figma's heading colour measures about `#050505` (near-black); the site uses the warmer `#15110d`.
- About twelve comment threads sit on the hero frame. They need a signed-in Figma account to read
  and haven't been read.

## To confirm with the team

- **Wording copied from Figma** that may not be WorkHall's own: the hero bar labels ("How Many
  Friends?", "Make Enquiry"), the 12 amenity names, the Individuals and Teams plan names and
  descriptions (Desk, Nox, Suite and so on), and the plans intro line. The original wording is
  still in git history (`git show HEAD:src/components/...`).
- **Draft copy written during development:** the one-line descriptions on the back of each amenity
  card, and the short labels in Purpose Halls ("Production & recording" and so on).
- **"6 locations"** in the hero, but only 5 branches are listed.
- **Photos** in the hero, plans and community are stock images (Unsplash) except `public/cowork.jpg`.
  Replace them with real WorkHall photos.

## Known issues

- ESLint reports a few older problems: an unused `PageLoader` import in `App.tsx`, an unused
  `_description` in `PlansScrollSection.tsx`, and `setState`-inside-effect warnings in
  `PlansScrollSection.tsx` and `PurposeHallsSection.tsx`.
- The console shows two THREE.js deprecation warnings, and occasionally a `MeshLineGeometry`
  "radius is NaN" error from a 3D effect; its source hasn't been traced.
- The free map service CARTO now requires an API key, which is why the map moved to OpenFreeMap. For
  heavy traffic, consider a paid provider or self-hosting.
