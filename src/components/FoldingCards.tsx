import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import "./FoldingCards.css";

export interface FoldSlide {
  src: string;
  alt: string;
  /** CSS background-position: which part of the photo stays in view when it is cropped. */
  position?: string;
}

/*
 * Photos shown one by one as folding cards (like the page of a flip calendar).
 *
 * Each photo is cut into a top half and a bottom half. The top half of the current card is a
 * "flap" hinged at the middle crease: it folds down toward the viewer, and as it falls the next
 * photo's top half is uncovered underneath while the flap's back (the next photo's bottom half)
 * lands over the current bottom half. When the fold ends the next photo becomes the current one.
 */

// How long one fold takes, in ms. Keep in sync with --fold-ms in FoldingCards.css.
// How long a card stays up is --hold-ms there: the active progress bar fills over that time,
// and the fold starts when the bar is full (its animationend event).
const FOLD_MS = 1100;

const pad = (value: number) => String(value).padStart(2, "0");

function Half({
  slide,
  part,
  className,
}: {
  slide: FoldSlide;
  part: "top" | "bottom";
  className: string;
}) {
  return (
    <div className={`fold__half fold__half--${part} ${className}`} aria-hidden="true">
      <span
        className="fold__img"
        style={{ backgroundImage: `url("${slide.src}")`, backgroundPosition: slide.position ?? "center" }}
      />
      <span className="fold__shade" />
    </div>
  );
}

export default function FoldingCards({ slides, label }: { slides: FoldSlide[]; label: string }) {
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [folding, setFolding] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(true);
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const foldingRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const next = (index + 1) % total;

  // Fold to the next card. With reduced motion the card simply changes, without the fold.
  const advance = useCallback(() => {
    if (foldingRef.current || total < 2) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIndex((current) => (current + 1) % total);
      return;
    }

    foldingRef.current = true;
    setFolding(true);
    timerRef.current = window.setTimeout(() => {
      setIndex((current) => (current + 1) % total);
      setFolding(false);
      foldingRef.current = false;
      timerRef.current = null;
    }, FOLD_MS + 80);
  }, [total]);

  // Load every photo up front so no fold ever reveals an empty card.
  useEffect(() => {
    slides.forEach((slide) => {
      const image = new Image();
      image.decoding = "async";
      image.src = slide.src;
    });
  }, [slides]);

  // Pause while the hero is off screen.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Follow the visitor's reduced-motion setting if it changes while the page is open.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const classes = ["fold"];
  if (folding) classes.push("is-folding");
  if (hovered || !inView) classes.push("is-paused");
  if (reduced) classes.push("is-reduced");

  return (
    <div
      ref={rootRef}
      className={classes.join(" ")}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      // Mouse only: the card stays up while the pointer rests on it.
      onPointerEnter={(event: ReactPointerEvent) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <span className="fold__deck fold__deck--far" aria-hidden="true" />
      <span className="fold__deck fold__deck--near" aria-hidden="true" />

      <div className="fold__clip">
        <div className="fold__stage">
          {/* Uncovered as the flap falls: the next card's top half. */}
          <Half slide={slides[next]} part="top" className="fold__static fold__static--top" />
          {/* Stays put until the flap lands on it: the current card's bottom half. */}
          <Half slide={slides[index]} part="bottom" className="fold__static fold__static--bottom" />

          <div className="fold__flap">
            <Half slide={slides[index]} part="top" className="fold__face fold__face--front" />
            <Half slide={slides[next]} part="bottom" className="fold__face fold__face--back" />
          </div>

          <span className="fold__crease" aria-hidden="true" />
        </div>

        <div className="fold__bars" aria-hidden="true">
          {slides.map((slide, bar) => (
            <span
              key={slide.src}
              className="fold__bar"
              data-state={bar < index ? "done" : bar === index ? "active" : "idle"}
            >
              {bar === index && (
                <span
                  key={index}
                  className="fold__bar-fill"
                  onAnimationEnd={(event) => event.target === event.currentTarget && advance()}
                />
              )}
            </span>
          ))}
        </div>

        <p className="fold__count" aria-hidden="true">
          {pad(index + 1)} / {pad(total)}
        </p>

        <button type="button" className="fold__next" onClick={advance} aria-label="Show the next photo">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p className="fold__sr">{`Photo ${index + 1} of ${total}: ${slides[index].alt}`}</p>
      </div>
    </div>
  );
}
