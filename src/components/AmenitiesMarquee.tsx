import React, { useEffect, useRef, useState } from "react";
import ScrollVelocity from "./ScrollVelocity";
import { AmenityScene, type SceneName } from "./AmenityScenes";
import "./AmenitiesMarquee.css";
import {
  CalendarDays,
  CarFront,
  Clock3,
  Heart,
  House,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

type Tone = "magenta" | "green" | "blue" | "orange";
interface CardArt {
  /** CSS background for the card: a soft gradient, or a hard two-tone split. */
  background: string;
  /** The workspace illustration drawn on the card. */
  scene: SceneName;
  /** Loose white dots: [x %, y %, size px]. */
  dots: Array<[number, number, number]>;
}

interface Amenity {
  tag: string;
  title: string;
  body: string;
  tone: Tone;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  art: CardArt;
}

// Back face colours (brand): card background, then the darker icon tile.
const tones: Record<Tone, { bg: string; tile: string }> = {
  magenta: { bg: "#B24C8B", tile: "#8E3570" },
  green: { bg: "#296549", tile: "#1D4733" },
  blue: { bg: "#3F5FAA", tile: "#2C4277" },
  orange: { bg: "#C8562C", tile: "#A2421F" },
};

const split = (band: string, rest: string, at = 54) =>
  `linear-gradient(90deg, ${band} 0 ${at}%, ${rest} ${at}% 100%)`;

// Amenity names follow Figma. The one-line descriptions are draft copy: confirm them with WorkHall.
const amenities: Amenity[] = [
  {
    tag: "Open 24/7",
    title: "Open 24/7, 365 Days\nWith Full Access",
    body: "Early starts, late finishes, weekends: your access works every hour of every day.",
    tone: "magenta",
    Icon: Clock3,
    art: {
      background: "linear-gradient(180deg, #a3d3f0 0%, #cfe6dc 52%, #f7f0a8 100%)",
      scene: "clock",
      dots: [[18, 47, 16], [44, 32, 8], [80, 70, 6]],
    },
  },
  {
    tag: "Desk Service",
    title: "Service Staff At Your\nOwn Desks",
    body: "Coffee, printing and small asks come to you, so your focus stays where it is.",
    tone: "green",
    Icon: Users,
    art: {
      background: "linear-gradient(160deg, #f2ae9c 0%, #f8d2c5 100%)",
      scene: "coffee",
      dots: [[78, 22, 12], [70, 76, 8]],
    },
  },
  {
    tag: "Custom Layouts",
    title: "Custom Office Or\nDesk Layouts",
    body: "Desks, storage and privacy arranged around how your team actually works.",
    tone: "blue",
    Icon: Star,
    art: {
      background: split("#e3ae56", "#f7e5c4"),
      scene: "desk",
      dots: [[36, 26, 18], [28, 46, 14], [88, 90, 12]],
    },
  },
  {
    tag: "EV Charging",
    title: "EV Charging Stations\nFor All Wheelers",
    body: "Charge your car, bike or scooter while you work.",
    tone: "orange",
    Icon: Zap,
    art: {
      background: "linear-gradient(150deg, #e8603e 0%, #f2a48c 48%, #f8cdbd 100%)",
      scene: "charger",
      dots: [[86, 52, 16]],
    },
  },
  {
    tag: "Green Spaces",
    title: "Real Green\nSpaces",
    body: "Living plants and open-air corners to reset between tasks.",
    tone: "magenta",
    Icon: House,
    art: {
      background: split("#a3c3a1", "#f1e8d5", 58),
      scene: "plant",
      dots: [[20, 18, 14], [26, 62, 18], [84, 6, 10]],
    },
  },
  {
    tag: "Free Parking",
    title: "Free Gated Parking\nAt Every Location",
    body: "Secure, gated parking on site at no extra cost.",
    tone: "orange",
    Icon: CarFront,
    art: {
      background: split("#c8577a", "#f7c9bd", 38),
      scene: "car",
      dots: [[70, 24, 10], [24, 34, 8]],
    },
  },
  {
    tag: "Car & Bike Wash",
    title: "On-Site Car and Bike\nCleaning",
    body: "Your vehicle gets cleaned while you are at your desk.",
    tone: "green",
    Icon: Sparkles,
    art: {
      background: "linear-gradient(170deg, #8f90e0 0%, #b7a6e6 50%, #e3c3e8 100%)",
      scene: "bike",
      dots: [[16, 72, 14], [30, 86, 8], [86, 82, 10]],
    },
  },
  {
    tag: "Pet Friendly",
    title: "Permission To Bring\nYour Pets",
    body: "Pet-friendly spaces, so nobody has to wait at home.",
    tone: "blue",
    Icon: Heart,
    art: {
      background: "linear-gradient(180deg, #70d0c0 0%, #b9e4cf 55%, #eef2d6 100%)",
      scene: "paw",
      dots: [[22, 22, 14], [76, 30, 9], [64, 84, 12]],
    },
  },
  {
    tag: "Quiet & Secure",
    title: "Quiet and Secure\nPeaceful Environment",
    body: "Controlled access and calm floors built for deep focus.",
    tone: "orange",
    Icon: ShieldCheck,
    art: {
      background: "linear-gradient(165deg, #ece4d3 0%, #dccfb8 100%)",
      scene: "lock",
      dots: [[82, 18, 10], [80, 78, 16]],
    },
  },
  {
    tag: "Indoor & Outdoor Dining",
    title: "Indoor & Outdoor\nDining Spaces",
    body: "Eat in, or take lunch outside, without leaving the building.",
    tone: "magenta",
    Icon: MapPin,
    art: {
      background: "linear-gradient(155deg, #f6dc8a 0%, #f4c3a0 100%)",
      scene: "plate",
      dots: [[20, 24, 12], [86, 26, 8], [30, 84, 14]],
    },
  },
  {
    tag: "Member Events",
    title: "Member-Only Events\n& Workshops",
    body: "Talks, workshops and meetups for the WorkHall community.",
    tone: "green",
    Icon: CalendarDays,
    art: {
      background: split("#5f7fd8", "#c7d3f4", 46),
      scene: "calendar",
      dots: [[78, 20, 14], [22, 78, 10]],
    },
  },
  {
    tag: "Wi-Fi & Backup Power",
    title: "High-Speed Internet\n& Backup Power",
    body: "Fast internet with backup power, so load-shedding never stops your day.",
    tone: "blue",
    Icon: Wifi,
    art: {
      background: "linear-gradient(175deg, #b8d8bf 0%, #e9eed9 100%)",
      scene: "wifi",
      dots: [[24, 30, 16], [32, 50, 8], [84, 22, 10]],
    },
  },
];

// Columns that fill the whole strip height with no gaps: stacked pairs, and tall single cards.
// `grow` sets each card's share of the column height.
type Column = { cards: Array<{ index: number; grow: number }> };

const columns: Column[] = [
  { cards: [{ index: 0, grow: 5 }, { index: 1, grow: 6 }] },
  { cards: [{ index: 2, grow: 1 }] },
  { cards: [{ index: 3, grow: 1 }] },
  { cards: [{ index: 4, grow: 6 }, { index: 5, grow: 5 }] },
  { cards: [{ index: 6, grow: 5 }, { index: 7, grow: 6 }] },
  { cards: [{ index: 8, grow: 1 }] },
  { cards: [{ index: 9, grow: 1 }] },
  { cards: [{ index: 10, grow: 6 }, { index: 11, grow: 5 }] },
];

const AmenityArtCard: React.FC<{ amenity: Amenity; grow: number }> = ({ amenity, grow }) => {
  const { tag, title, body, tone, Icon, art } = amenity;
  const { bg, tile } = tones[tone];

  return (
    <article className="amenity-art-card" style={{ flexGrow: grow }} tabIndex={0}>
      <div className="amenity-art-card__inner">
        <div className="amenity-art-card__face amenity-art" style={{ background: art.background }} aria-hidden="true">
          {art.dots.map(([x, y, size], dotIndex) => (
            <span
              key={dotIndex}
              className="amenity-art__dot"
              style={{ left: `${x}%`, top: `${y}%`, width: size, height: size }}
            />
          ))}
          <AmenityScene name={art.scene} />
          <span className="amenity-art__grain" />
          <span className="amenity-art__tag">{tag}</span>
        </div>

        <div className="amenity-art-card__face amenity-art-card__back" style={{ background: bg }}>
          <span className="amenity-art-card__icon" style={{ background: tile }} aria-hidden="true">
            <Icon size={22} color="#FFFFFF" strokeWidth={2.1} />
          </span>
          <h3 className="amenity-art-card__title">{title}</h3>
          <p className="amenity-art-card__body">{body}</p>
          <span className="amenity-art__grain amenity-art__grain--soft" aria-hidden="true" />
        </div>
      </div>
    </article>
  );
};

const AmenitiesMarquee: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.05, rootMargin: "120px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const row = columns.map((column, columnIndex) => (
    <div key={columnIndex} className="amenity-art-column">
      {column.cards.map(({ index, grow }) => (
        <AmenityArtCard key={amenities[index].tag} amenity={amenities[index]} grow={grow} />
      ))}
    </div>
  ));

  return (
    <section
      ref={sectionRef}
      className="amenities-marquee-section"
      aria-label="Amenities at every Work Hall"
      // Mouse only: the strip glides to a stop so a hovered card can flip and be read.
      onPointerEnter={(event) => event.pointerType === "mouse" && setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
    >
      <ScrollVelocity
        texts={[row]}
        velocity={42}
        paused={!isInView || isHovering}
        className="amenity-row"
        numCopies={3}
        parallaxClassName="amenity-parallax"
        scrollerClassName="amenity-scroller"
      />
    </section>
  );
};

export default AmenitiesMarquee;
