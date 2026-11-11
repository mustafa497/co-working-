import type { FoldSlide } from "../components/FoldingCards";

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1100&q=80`;

// Photos for the hero's folding cards, in the order they appear.
// Stock photos for now: swap in real WorkHall photos (e.g. /hero/1.jpg) when they are ready.
export const heroSlides: FoldSlide[] = [
  {
    src: unsplash("1524758631624-e2822e304c36"),
    alt: "Lounge with armchairs and a floor lamp",
    position: "40% center",
  },
  {
    src: "/cowork.jpg",
    alt: "Two people working at a shared table under pendant lights",
    position: "45% center",
  },
  {
    src: unsplash("1497366216548-37526070297c"),
    alt: "A long corridor of glass-walled private offices",
  },
  {
    src: unsplash("1497366811353-6870744d04b2"),
    alt: "A meeting room with a long table in daylight",
    position: "55% center",
  },
  {
    src: unsplash("1497366412874-3415097a27e7"),
    alt: "Glass-walled team office with a lounge beyond",
    position: "60% center",
  },
  {
    src: unsplash("1497366754035-f200968a6e72"),
    alt: "A hallway lined with glass partitions",
  },
];
