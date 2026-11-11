import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import adobeLogo from "../assets/community/adobe.svg";
import anthropicLogo from "../assets/community/anthropic.svg";
import dropboxLogo from "../assets/community/dropbox.svg";
import figmaLogo from "../assets/community/figma.svg";
import githubLogo from "../assets/community/github.svg";
import microsoftLogo from "../assets/community/microsoft.svg";
import notionLogo from "../assets/community/notion.svg";
import slackLogo from "../assets/community/slack.svg";
import spotifyLogo from "../assets/community/spotify.svg";
import RotatingText from "./RotatingText";
import "./RotatingText.css";
import "./CommunitySection.css";
import { FlyingFadeBlock, FlyingRotationText } from "./shared/FlyingRotationText";
import { countFlyingChars, seededRandom, useStaggeredProgress } from "./shared/flyingRotation";

type CommunityTile =
  | {
      kind: "logo";
      badge: string;
      label: string;
      background: string;
      asset: string;
      logoScale?: string;
    }
  | {
      kind: "media";
      badge: string;
      label: string;
      image: string;
      objectPosition?: string;
    };

const tiles: CommunityTile[] = [
  {
    kind: "logo",
    badge: "Agencies",
    label: "GitHub",
    background: "#111111",
    asset: githubLogo,
    logoScale: "0.52",
  },
  {
    kind: "media",
    badge: "Founder Circle",
    label: "Founder conversation around a table",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "logo",
    badge: "Creative Ops",
    label: "Adobe",
    // The Adobe mark is red (#EB1000); a red tile hid it completely.
    background: "#f3eee5",
    asset: adobeLogo,
    logoScale: "0.56",
  },
  {
    kind: "media",
    badge: "After Hours",
    label: "Glass hallway and private office interiors",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "logo",
    badge: "Startup Tools",
    label: "Figma",
    background: "#111111",
    asset: figmaLogo,
    logoScale: "0.42",
  },
  {
    kind: "media",
    badge: "Client Meeting",
    label: "Operator presenting at a sticky-note wall",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "media",
    badge: "Team Review",
    label: "Shared table with laptops and conversation",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "logo",
    badge: "Music Teams",
    label: "Spotify",
    background: "#1ed760",
    asset: spotifyLogo,
    logoScale: "0.48",
  },
  {
    kind: "media",
    badge: "Presentations",
    label: "Evening event and conversation",
    image:
      "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "logo",
    badge: "Workspace Stack",
    label: "Slack",
    background: "#f3eee5",
    asset: slackLogo,
    logoScale: "0.38",
  },
  {
    kind: "media",
    badge: "Operations",
    label: "Workspace desk flat-lay with laptops",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "logo",
    badge: "Knowledge Base",
    label: "Notion",
    background: "#f3eee5",
    asset: notionLogo,
    logoScale: "0.5",
  },
  {
    kind: "logo",
    badge: "Corporate Teams",
    label: "Microsoft",
    background: "#1270d9",
    asset: microsoftLogo,
    logoScale: "0.5",
  },
  {
    kind: "media",
    badge: "Boardroom",
    label: "Long hallway and polished office shell",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "logo",
    badge: "Shared Drives",
    label: "Dropbox",
    background: "#0d54ff",
    asset: dropboxLogo,
    logoScale: "0.46",
  },
  {
    kind: "media",
    badge: "Quiet Focus",
    label: "Lounge seating and soft daylight",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
  {
    kind: "logo",
    badge: "Product Teams",
    label: "Anthropic",
    background: "#111111",
    asset: anthropicLogo,
    logoScale: "0.58",
  },
  {
    kind: "media",
    badge: "Private Office",
    label: "Team around a desk in a studio-like office",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    objectPosition: "center center",
  },
];

/* ---------- Heading: flying rotation (skills/flying-rotation) ---------- */

const HEADING_LINE_1 = "that's why Work Hall is where";
const HEADING_TOP = "Pakistan's Top";
const HEADING_COME = "come";
const HEADING_LINE_3 = "to work.";
const HEADING_LABEL =
  "That's why Work Hall is where Pakistan's top startups, agencies, creators and founders come to work.";

// Positions in one shared timeline, so the letters stagger across all lines in reading order.
const TOP_START = countFlyingChars(HEADING_LINE_1);
const BOX_INDEX = TOP_START + countFlyingChars(HEADING_TOP);
const COME_START = BOX_INDEX + 1;
const LINE_3_START = COME_START + countFlyingChars(HEADING_COME);
const HEADING_TOTAL = LINE_3_START + countFlyingChars(HEADING_LINE_3);

/* ---------- Wall: three rows that slide sideways, cards that fly in ---------- */

const ROW_COUNT = 3;
const UNIQUE_PER_ROW = 6;
// Repeats give the rows spare width to slide through without showing an empty edge.
const TILES_PER_ROW = 10;
const WALL_TILE_COUNT = ROW_COUNT * TILES_PER_ROW;

const wallRows = Array.from({ length: ROW_COUNT }, (_, row) => {
  const own = tiles.slice(row * UNIQUE_PER_ROW, (row + 1) * UNIQUE_PER_ROW);
  return Array.from({ length: TILES_PER_ROW }, (_, col) => ({
    tile: own[col % own.length],
    isRepeat: col >= own.length,
  }));
});

// Sideways travel per row, as a share of the row's spare width: [scroll start, scroll end].
// Alternating directions and different spans give the parallax.
const ROW_TRAVEL: Array<[number, number]> = [
  [0.1, 0.8],
  [0.88, 0.12],
  [0.32, 0.64],
];
// Gentle vertical parallax per row in px: [scroll start, scroll end].
const ROW_LIFT: Array<[number, number]> = [
  [22, -22],
  [0, 0],
  [-22, 22],
];

// Short spring "catch-up" on scroll progress, like GSAP's `scrub: 0.6`: smooth on mouse wheels.
const SCRUB_SPRING = { stiffness: 140, damping: 28, mass: 0.4, restDelta: 0.0005 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function ArrowLaunchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

interface CardMotionProps {
  enter: MotionValue<number>;
  exit: MotionValue<number>;
  reduced: boolean;
}

function CommunityCard({
  tile,
  isRepeat,
  row,
  col,
  enter,
  exit,
  reduced,
}: CardMotionProps & { tile: CommunityTile; isRepeat: boolean; row: number; col: number }) {
  // Fly-in: columns sweep in one after another; rows come from opposite sides.
  const order = col * ROW_COUNT + row;
  const t = useStaggeredProgress(enter, order, WALL_TILE_COUNT, 0.05);
  const seed = order + 1;
  const side = row % 2 === 0 ? 1 : -1;
  const fromTilt = (seededRandom(seed) * 2 - 1) * 16;
  const fromTurn = side * (26 + seededRandom(seed + 0.3) * 22); // sideways (Y-axis) rotation
  const fromX = side * (90 + seededRandom(seed + 0.6) * 140);
  const fromY = 70 + seededRandom(seed + 0.9) * 110;

  // Exit: as "Why WorkHall" rises over the wall, the bottom row leaves first.
  const exitOrder = (ROW_COUNT - 1 - row) * TILES_PER_ROW + col;
  const exitDelay = 0.03 + (exitOrder / (WALL_TILE_COUNT - 1)) * 0.46 + (row === 0 ? 0.2 : 0);
  const out = useTransform(exit, (value) => clamp01((value - exitDelay) / 0.13));

  const rotate = useTransform(t, (v) => (reduced ? 0 : (1 - v) * fromTilt));
  const rotateY = useTransform(t, (v) => (reduced ? 0 : (1 - v) * fromTurn));
  const x = useTransform(t, (v) => (reduced ? 0 : (1 - v) * fromX));
  const y = useTransform([t, out], ([v, o]: number[]) => (reduced ? 0 : (1 - v) * fromY + o * 110));
  const scale = useTransform([t, out], ([v, o]: number[]) =>
    reduced ? 1 : (0.62 + 0.38 * v) * (1 - 0.2 * o),
  );
  const opacity = useTransform([t, out], ([v, o]: number[]) => (reduced ? 1 : v * (1 - o)));

  return (
    <motion.article
      className={`community-card community-card--${tile.kind}`}
      style={{ x, y, rotate, rotateY, scale, opacity, transformPerspective: 900 }}
      aria-hidden={isRepeat || undefined}
    >
      <div className="community-card__face">
        <span className="community-tile__badge">{tile.badge}</span>

        {tile.kind === "logo" ? (
          <div className="community-tile__logo-surface" style={{ background: tile.background }}>
            <img
              className="community-tile__logo"
              src={tile.asset}
              alt={isRepeat ? "" : tile.label}
              style={{ transform: `scale(${tile.logoScale ?? "1"})` }}
            />
          </div>
        ) : (
          <img
            className="community-tile__photo"
            src={tile.image}
            alt={isRepeat ? "" : tile.label}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: tile.objectPosition ?? "center center" }}
          />
        )}
      </div>
    </motion.article>
  );
}

function CommunityRow({
  row,
  rowIndex,
  drift,
  ...cardMotion
}: CardMotionProps & {
  row: (typeof wallRows)[number];
  rowIndex: number;
  drift: MotionValue<number>;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  // How much wider the row is than the screen: the distance it can slide without a gap.
  const spareWidth = useMotionValue(0);

  useEffect(() => {
    const rowElement = rowRef.current;
    const wallElement = rowElement?.parentElement;
    if (!rowElement || !wallElement) return;

    const measure = () => spareWidth.set(Math.max(0, rowElement.scrollWidth - wallElement.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rowElement);
    observer.observe(wallElement);
    return () => observer.disconnect();
  }, [spareWidth]);

  const [travelFrom, travelTo] = ROW_TRAVEL[rowIndex];
  const [liftFrom, liftTo] = ROW_LIFT[rowIndex];
  const reduced = cardMotion.reduced;

  const x = useTransform([drift, spareWidth], ([progress, spare]: number[]) => {
    const share = reduced ? (travelFrom + travelTo) / 2 : travelFrom + (travelTo - travelFrom) * progress;
    return -share * spare;
  });
  const y = useTransform(drift, (progress) => (reduced ? 0 : liftFrom + (liftTo - liftFrom) * progress));

  return (
    <motion.div ref={rowRef} className="community-row" style={{ x, y }}>
      {row.map(({ tile, isRepeat }, col) => (
        <CommunityCard key={col} tile={tile} isRepeat={isRepeat} row={rowIndex} col={col} {...cardMotion} />
      ))}
    </motion.div>
  );
}

interface CommunityProps {
  targetRef: RefObject<HTMLElement | null>;
}

export default function CommunitySection({ targetRef }: CommunityProps) {
  const reduced = useReducedMotion() ?? false;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const wallWrapRef = useRef<HTMLDivElement>(null);

  // Heading letters: from the heading's top entering the screen until its bottom is 30% from the top.
  const { scrollYProgress: headingScroll } = useScroll({
    target: headingRef,
    offset: [[0, 1], [1, 0.3]],
  });
  // Cards fly in while the wall's top travels from the bottom of the screen to 12% from the top.
  const { scrollYProgress: wallEnterScroll } = useScroll({
    target: wallWrapRef,
    offset: [[0, 1], [0, 0.12]],
  });
  // Rows slide sideways for as long as the wall is on screen.
  const { scrollYProgress: wallDriftScroll } = useScroll({
    target: wallWrapRef,
    offset: ["start end", "end start"],
  });
  // Cards leave as the next section ("Why WorkHall") rises over them.
  const { scrollYProgress: exitProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start start"],
  });

  const headingProgress = useSpring(headingScroll, SCRUB_SPRING);
  const wallEnter = useSpring(wallEnterScroll, SCRUB_SPRING);
  const wallDrift = useSpring(wallDriftScroll, SCRUB_SPRING);

  const headingTimeline = { progress: headingProgress, total: HEADING_TOTAL, disabled: reduced };

  return (
    <section id="community" className="community-wrapper" aria-labelledby="community-title">
      <div className="community-inner">
        <div className="community-kicker">
          <span className="community-kicker__square" aria-hidden="true" />
          <span>Our Community</span>
        </div>

        <h2 ref={headingRef} className="community-heading" id="community-title" aria-label={HEADING_LABEL}>
          <span aria-hidden="true">
            <FlyingRotationText text={HEADING_LINE_1} startIndex={0} {...headingTimeline} />
          </span>
          <span className="community-heading__line" aria-hidden="true">
            <em>
              <FlyingRotationText text={HEADING_TOP} startIndex={TOP_START} {...headingTimeline} />
            </em>
            <FlyingFadeBlock
              className="community-rotating-slot"
              progress={headingProgress}
              index={BOX_INDEX}
              total={HEADING_TOTAL}
              disabled={reduced}
            >
              <RotatingText
                texts={["Startups", "Agencies", "Creators", "Founders"]}
                rotationInterval={2000}
                mainClassName="community-rotating-box"
                staggerFrom="last"
                initial={{ y: "150%" }}
                animate={{ y: 0 }}
                exit={{ y: "-158.4%" }}
                staggerDuration={0.025}
                splitLevelClassName="community-rotating-split"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
              />
            </FlyingFadeBlock>
            <strong>
              <FlyingRotationText text={HEADING_COME} startIndex={COME_START} {...headingTimeline} />
            </strong>
          </span>
          <span aria-hidden="true">
            <FlyingRotationText text={HEADING_LINE_3} startIndex={LINE_3_START} {...headingTimeline} />
          </span>
        </h2>

        <div ref={wallWrapRef} className="community-grid-wrap">
          <div className="community-stage">
            <div className="community-wall" role="group" aria-label="Teams and moments from the Work Hall community">
              {wallRows.map((row, rowIndex) => (
                <CommunityRow
                  key={rowIndex}
                  row={row}
                  rowIndex={rowIndex}
                  drift={wallDrift}
                  enter={wallEnter}
                  exit={exitProgress}
                  reduced={reduced}
                />
              ))}
            </div>

            <div className="community-cta-row">
              <a href="#book-tour" className="community-cta">
                <span>Become Part Of The Community</span>
                <span className="community-cta__badge" aria-hidden="true">
                  <ArrowLaunchIcon />
                </span>
              </a>
            </div>
          </div>

          <div className="community-handoff-trigger" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
