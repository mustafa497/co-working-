import { useEffect, useRef, useState, type Ref } from "react";
import Card from "./Card/Card";
import type { CarouselImage } from "../types";
import { ShuffleText } from "./shared/ShuffleText";

const SCROLL_BUDGET = 1320;
const DESKTOP_MEDIA_QUERY = "(min-width: 1025px)";
const MIN_SCROLL_BUDGET = 420;

interface PlanCardProps {
  planName: string;
  title: string;
  description: string;
  tags: string[];
  learnMoreUrl: string;
  images: CarouselImage[];
}

const PLANS_MIN_OPACITY = 0.18;
const PLANS_MAX_OPACITY = 1;
// Vertical scroll distance per pixel of horizontal travel (higher = slower, calmer track).
const SCROLL_TO_TRAVEL_RATIO = 0.85;
// Share of the remaining distance the track covers each 60fps frame (lower = softer glide).
const TRACK_SMOOTHING = 0.14;
// Scroll progress at which each group (Individuals, Teams, Enterprises) is fully in focus.
const GROUP_FOCUS_POINTS = [0, 0.5, 1] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getGroupOpacity(progress: number, focusPoint: number) {
  const distance = Math.abs(progress - focusPoint);
  const fadeSpan = 0.5;
  const normalized = clamp(1 - distance / fadeSpan, 0, 1);
  const eased = normalized * normalized * (3 - 2 * normalized);

  return PLANS_MIN_OPACITY + (PLANS_MAX_OPACITY - PLANS_MIN_OPACITY) * eased;
}

// const individualCards: PlanCardProps[] = [
//   {
//     categoryPath: "INDIVIDUALS PATH",
//     price: "From Rs 20,000/mo",
//     overline: "FLEXIBLE COWORKING",
//     planName: "AIR PLAN",
//     tagline:
//       "Best for freelancers, founders, and small teams who need a reliable everyday work base.",
//     attributes: [
//       { label: "Flex", fill: 90 },
//       { label: "Privacy", fill: 20 },
//       { label: "Commitment", fill: 30 },
//     ],
//     primaryCTA: "View plan",
//     secondaryCTA: "Book a tour",
//   },
//   {
//     categoryPath: "INDIVIDUALS PATH",
//     price: "From Rs 30,000/mo",
//     overline: "ASSIGNED DESK",
//     planName: "X PLAN",
//     tagline:
//       "Same seat, same rhythm, fewer daily decisions. Consistency with the energy of a community.",
//     attributes: [
//       { label: "Flex", fill: 60 },
//       { label: "Privacy", fill: 40 },
//       { label: "Commitment", fill: 70 },
//     ],
//     primaryCTA: "View plan",
//     secondaryCTA: "Book a tour",
//   },
//   {
//     categoryPath: "INDIVIDUALS PATH",
//     price: "From Rs 10,000/mo",
//     overline: "BUSINESS ADDRESS",
//     planName: "VIRTUAL",
//     tagline:
//       "A credible Karachi presence for remote-friendly businesses. Physical address, meeting room access.",
//     attributes: [
//       { label: "Flex", fill: 80 },
//       { label: "Privacy", fill: 50 },
//       { label: "Commitment", fill: 20 },
//     ],
//     primaryCTA: "View plan",
//     secondaryCTA: "Book a tour",
//   },
// ] as const;

// const teamCards: PlanCardProps[] = [
//   {
//     categoryPath: "TEAMS PATH",
//     price: "From Rs 50,000/mo",
//     overline: "PRIVATE OFFICE",
//     planName: "BOX PLAN",
//     tagline:
//       "A private office for growing teams who need their own room without managing one alone.",
//     attributes: [
//       { label: "Flex", fill: 40 },
//       { label: "Privacy", fill: 85 },
//       { label: "Commitment", fill: 80 },
//     ],
//     primaryCTA: "View plan",
//     secondaryCTA: "Book a tour",
//   },
//   {
//     categoryPath: "TEAMS PATH",
//     price: "Custom pricing",
//     overline: "AUTONOMOUS SUITES",
//     planName: "ENTERPRISE",
//     tagline:
//       "Fully autonomous private suites shaped around company size, access needs, and team operations.",
//     attributes: [
//       { label: "Flex", fill: 30 },
//       { label: "Privacy", fill: 95 },
//       { label: "Commitment", fill: 90 },
//     ],
//     primaryCTA: "View plan",
//     secondaryCTA: "Book a tour",
//   },
//   {
//     categoryPath: "TEAMS PATH",
//     price: "Custom pricing",
//     overline: "TAILORED OFFICES",
//     planName: "CUSTOM",
//     tagline:
//       "Built around your workflow. Layout, storage, branding, and tempo configured for your team.",
//     attributes: [
//       { label: "Flex", fill: 70 },
//       { label: "Privacy", fill: 90 },
//       { label: "Commitment", fill: 60 },
//     ],
//     primaryCTA: "View plan",
//     secondaryCTA: "Book a tour",
//     locked: true,
//   },
// ] as const;

// Photos used on the Figma plan cards (Unsplash).
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=75`;
const CORRIDOR = photo("1497366216548-37526070297c");
const LOUNGE = photo("1524758631624-e2822e304c36");
const GLASS_OFFICE = photo("1497366412874-3415097a27e7");
const GLASS_HALL = photo("1497366754035-f200968a6e72");
const MEETING_ROOM = photo("1497366811353-6870744d04b2");

// Copy and card order follow Figma (Page 1: "Individuals" and "Teams" frames).
const individualCards: PlanCardProps[] = [
  {
    planName: "Air",
    title: "Air",
    description:
      "Access to shared seating whenever you need focused work. Plug in, settle down, and get moving without the commitment of a fixed desk.",
    tags: ["Freelancers", "Consultants", "Students", "Remote Employees"],
    learnMoreUrl: "#air",
    images: [
      { src: CORRIDOR, alt: "Corridor of glass-walled offices" },
      { src: LOUNGE, alt: "Lounge with armchairs and a floor lamp" },
      { src: GLASS_HALL, alt: "Hallway lined with glass partitions" },
    ],
  },
  {
    planName: "Desk",
    title: "Desk",
    description:
      "Your own dedicated desk, ready every day. Leave your monitor, keep your setup intact, and work with consistency in a premium shared space.",
    tags: ["Creators", "Founders", "Analysts", "Solo Operators"],
    learnMoreUrl: "#desk",
    images: [
      { src: LOUNGE, alt: "Lounge with armchairs and a floor lamp" },
      { src: MEETING_ROOM, alt: "Meeting room with a long table" },
      { src: CORRIDOR, alt: "Corridor of glass-walled offices" },
    ],
  },
  {
    planName: "Nox",
    title: "Nox",
    description:
      "Shared or fixed desk access at a reduced rate. Same space, same amenities, same great community, just during the quieter hours of the night.",
    tags: [
      "Budget-Conscious Freelancers",
      "Overseas Client Work",
      "Part-Time Workers",
      "Night Owls",
    ],
    learnMoreUrl: "#nox",
    images: [
      { src: CORRIDOR, alt: "Corridor of glass-walled offices" },
      { src: GLASS_HALL, alt: "Hallway lined with glass partitions" },
      { src: LOUNGE, alt: "Lounge with armchairs and a floor lamp" },
    ],
  },
];

const teamCards: PlanCardProps[] = [
  {
    planName: "Base",
    title: "Base",
    description:
      "Dedicated desks for your whole team in a shared environment. Sit together, collaborate freely, and stay close to the energy of a full community.",
    tags: ["Startups", "Growing Businesses", "Small Team Pods", "Agencies"],
    learnMoreUrl: "#base",
    images: [
      { src: GLASS_OFFICE, alt: "Glass-walled team office" },
      { src: MEETING_ROOM, alt: "Meeting room with a long table" },
      { src: CORRIDOR, alt: "Corridor of glass-walled offices" },
    ],
  },
  {
    planName: "Box",
    title: "Box",
    description:
      "A private, lockable office that is entirely yours. Confidential, personal, and set up exactly the way your team wants it.",
    tags: ["Studios", "Founder Teams", "Client-Facing Teams", "Operations"],
    learnMoreUrl: "#box",
    images: [
      { src: GLASS_OFFICE, alt: "Glass-walled team office" },
      { src: GLASS_HALL, alt: "Hallway lined with glass partitions" },
      { src: MEETING_ROOM, alt: "Meeting room with a long table" },
    ],
  },
  {
    planName: "Suite",
    title: "Suite",
    description:
      "A fully private suite with room to grow. Build out leadership cabins, collaboration areas, and custom layouts around your workflow.",
    tags: ["Product Teams", "Sales Teams", "Support Teams", "Scaling Startups"],
    learnMoreUrl: "#suite",
    images: [
      { src: CORRIDOR, alt: "Corridor of glass-walled offices" },
      { src: MEETING_ROOM, alt: "Meeting room with a long table" },
      { src: GLASS_OFFICE, alt: "Glass-walled team office" },
    ],
  },
];

const enterpriseCards: PlanCardProps[] = [
  {
    planName: "Core",
    title: "Core",
    description:
      "Placeholder enterprise offer for larger organizations that need a managed private footprint, cleaner access control, and room to scale across teams.",
    tags: ["Multi-floor Teams", "HQ Ops", "Security Needs", "Admin Support"],
    learnMoreUrl: "#enterprise-core",
    images: [
      {
        src: "https://picsum.photos/seed/enterprise-core-1/900/700",
        alt: "Enterprise workspace placeholder one",
      },
      {
        src: "https://picsum.photos/seed/enterprise-core-2/900/700",
        alt: "Enterprise workspace placeholder two",
      },
      {
        src: "https://picsum.photos/seed/enterprise-core-3/900/700",
        alt: "Enterprise workspace placeholder three",
      },
    ],
  },
  {
    planName: "Campus",
    title: "Campus",
    description:
      "Placeholder enterprise suite designed for distributed departments that need connected rooms, breakout zones, and an operations-first setup.",
    tags: ["Departments", "Breakout Rooms", "Managed Access", "Custom Fit"],
    learnMoreUrl: "#enterprise-campus",
    images: [
      {
        src: "https://picsum.photos/seed/enterprise-campus-1/900/700",
        alt: "Enterprise campus placeholder one",
      },
      {
        src: "https://picsum.photos/seed/enterprise-campus-2/900/700",
        alt: "Enterprise campus placeholder two",
      },
      {
        src: "https://picsum.photos/seed/enterprise-campus-3/900/700",
        alt: "Enterprise campus placeholder three",
      },
    ],
  },
];

// function PlanCard({
//   categoryPath,
//   price,
//   overline,
//   planName,
//   tagline,
//   attributes,
//   primaryCTA,
//   secondaryCTA,
//   locked = false,
// }: PlanCardProps) {
//   return (
//     // <article className={locked ? 'plan-card plan-card--locked' : 'plan-card'}>
//     //   <img src="/cowork.jpg" alt="workspace" />
//     //   <span className="plan-card-overlay" aria-hidden="true" />

//     //   <div className="plan-card-content">
//     //     <div className="card-top-row">
//     //       <span className="category-path">{categoryPath}</span>
//     //       <span className="price-pill">{price}</span>
//     //     </div>

//     //     <div className="card-middle">
//     //       <span className="card-overline">{overline}</span>
//     //       <h4>{planName}</h4>
//     //       <p>{tagline}</p>
//     //     </div>

//     //     <div className="card-bottom-stack">
//     //       <div className="attribute-bars" aria-label={`${planName} attributes`}>
//     //         {attributes.map((attribute) => (
//     //           <div key={attribute.label} className="attribute-row">
//     //             <span className="attribute-label">{attribute.label}</span>
//     //             <span className="attribute-track">
//     //               <span className="attribute-fill" style={{ width: `${attribute.fill}%` }} />
//     //             </span>
//     //           </div>
//     //         ))}
//     //       </div>

//     //       <div className="card-cta-row">
//     //         <a href="#plans" className="card-cta-primary">
//     //           <span>{primaryCTA}</span>
//     //           <ArrowLaunchIcon />
//     //         </a>
//     //         <a href="#book-tour" className="card-cta-secondary">
//     //           <span>{secondaryCTA}</span>
//     //           <ArrowLaunchIcon />
//     //         </a>
//     //       </div>
//     //     </div>
//     //   </div>
//     // </article>

//     <>
//     </>
//   );
// }

function PlansGroup({
  title,
  cards,
  description: _description,
  mobile = false,
  groupRef,
}: {
  title: string;
  cards: ReadonlyArray<PlanCardProps>;
  description: string;
  mobile?: boolean;
  groupRef?: Ref<HTMLElement>;
}) {
  return (
    <section
      ref={groupRef}
      className={mobile ? "plans-group plans-group--mobile" : "plans-group"}
    >
      <div className="plans-header__kicker plans-group__kicker">
        <span className="plans-header__square" aria-hidden="true" />
        <span>Plans</span>
      </div>
      <h3>{title}</h3>

      <div className={mobile ? "cards-row cards-row--mobile" : "cards-row"}>
        {cards.map((card) => (
          <div
            key={card.planName}
            className={mobile ? "card-slot card-slot--mobile" : "card-slot"}
          >
            <Card {...card} variant="plans-glow" />
          </div>
        ))}
      </div>

      {/* <div className="plans-group__footer">
        <p>{description}</p>
        <a href="#book-tour" className="plans-group__link">
          <span>Book now</span>
          <span aria-hidden="true">&gt;</span>
        </a>
      </div> */}
    </section>
  );
}

export function PlansScrollSection() {
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);
  const individualsRef = useRef<HTMLElement>(null);
  const teamsRef = useRef<HTMLElement>(null);
  const enterprisesRef = useRef<HTMLElement>(null);
  const [scrollBudget, setScrollBudget] = useState(SCROLL_BUDGET);
  const scrollBudgetRef = useRef(SCROLL_BUDGET);
  const maxTranslateRef = useRef(0);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined"
      ? true
      : window.matchMedia(DESKTOP_MEDIA_QUERY).matches,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const updateDesktop = () => setIsDesktop(mediaQuery.matches);

    updateDesktop();
    mediaQuery.addEventListener("change", updateDesktop);

    return () => mediaQuery.removeEventListener("change", updateDesktop);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      if (trackRef.current) {
        trackRef.current.style.transform = "translate3d(0, 0, 0)";
      }
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let target = 0;
    let frame = 0;
    let lastTime = 0;

    // Writes the track position, group fades and progress bar straight to the DOM:
    // no React re-render per frame, so all three move in lockstep.
    const apply = (value: number) => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-value * maxTranslateRef.current}px, 0, 0)`;
      }
      const groups = [individualsRef.current, teamsRef.current, enterprisesRef.current];
      GROUP_FOCUS_POINTS.forEach((focusPoint, index) => {
        const group = groups[index];
        if (group) group.style.opacity = String(getGroupOpacity(value, focusPoint));
      });
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${value})`;
      }
    };

    const readTarget = () => {
      const outer = outerRef.current;
      if (!outer || scrollBudgetRef.current <= 0) return 0;
      return clamp(-outer.getBoundingClientRect().top / scrollBudgetRef.current, 0, 1);
    };

    // Eases toward the scroll position; frame-rate independent, stops once settled.
    const tick = (time: number) => {
      // Cap long gaps (tab switch) but let slow devices still catch up in real time.
      const elapsed = lastTime ? Math.min(250, time - lastTime) : 1000 / 60;
      lastTime = time;
      const ease = 1 - Math.pow(1 - TRACK_SMOOTHING, elapsed / (1000 / 60));
      current += (target - current) * ease;
      if (Math.abs(target - current) < 0.0004) current = target;
      apply(current);

      if (current === target) {
        frame = 0;
        lastTime = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      target = readTarget();
      if (reducedMotion.matches) {
        current = target;
        apply(current);
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const calculateTrackMetrics = () => {
      const track = trackRef.current;
      if (!track) return;

      const viewportWidth = window.innerWidth;
      const nextMaxTranslate = Math.max(
        0,
        track.scrollWidth - viewportWidth,
      );
      maxTranslateRef.current = nextMaxTranslate;

      const nextBudget =
        nextMaxTranslate > 0
          ? Math.max(MIN_SCROLL_BUDGET, Math.round(nextMaxTranslate * SCROLL_TO_TRAVEL_RATIO))
          : 0;

      if (scrollBudgetRef.current !== nextBudget) {
        scrollBudgetRef.current = nextBudget;
        setScrollBudget(nextBudget);
      }
    };

    const handleResize = () => {
      calculateTrackMetrics();
      handleScroll();
    };

    calculateTrackMetrics();
    current = target = readTarget();
    apply(current);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return (
      <section
        className="plans-scroll-section plans-scroll-section--mobile"
        aria-labelledby="plans-title"
      >
        <div className="plans-header plans-header--mobile">
          <PlansIntroHeading />
        </div>

        <div className="plans-mobile-groups">
          <PlansGroup
            title="Individuals"
            cards={individualCards}
            description="Flexible coworking, assigned desks, and virtual setup for people who need a reliable everyday base without committing to more room than the day needs."
            mobile
          />
          <PlansGroup
            title="Teams"
            cards={teamCards}
            description="Private offices, enterprise setups, and tailored room to grow for teams that need more privacy, more structure, and a base that can scale with them."
            mobile
          />
          <PlansGroup
            title="Enterprises"
            cards={enterpriseCards}
            description="Placeholder enterprise offers for larger organizations that need scale, private infrastructure, and bespoke operational setups."
            mobile
          />
        </div>
      </section>
    );
  }

  return (
    <>
      {/* In Figma the intro heading scrolls away before the sticky plan track. */}
      <div className="plans-intro">
        <PlansIntroHeading />
      </div>

    <section
      ref={outerRef}
      className="plans-scroll-section"
      style={{ height: `calc(100vh + ${scrollBudget}px)` }}
      aria-labelledby="plans-title"
    >
      <div className="plans-scroll-section__sticky">
        <div className="plans-track-zone">
          <div ref={trackRef} className="plans-track">
            <PlansGroup
              title="Individuals"
              cards={individualCards}
              description="Flexible coworking, assigned desks, and virtual setup for people who need a reliable everyday base without committing to more room than the day needs."
              groupRef={individualsRef}
            />

            <div className="group-divider" aria-hidden="true" />

            <PlansGroup
              title="Teams"
              cards={teamCards}
              description="Private offices, enterprise setups, and tailored room to grow for teams that need more privacy, more structure, and a base that can scale with them."
              groupRef={teamsRef}
            />

            <div className="group-divider" aria-hidden="true" />

            <PlansGroup
              title="Enterprises"
              cards={enterpriseCards}
              description="Placeholder enterprise offers for larger organizations that need scale, private infrastructure, and bespoke operational setups."
              groupRef={enterprisesRef}
            />
          </div>
        </div>

        <span
          ref={progressBarRef}
          className="plans-scroll-section__progress"
          style={{ width: "100%", transform: "scaleX(0)", transformOrigin: "left center" }}
          aria-hidden="true"
        />
      </div>
    </section>
    </>
  );
}

function PlansIntroHeading() {
  return (
    <>
      <h2 className="plans-header__heading" id="plans-title">
        <span><ShuffleText text="Because we've got a space" finalColor="#15110d" /></span>
        <span className="is-accent"><ShuffleText text="for every way you work." startDelay={120} finalColor="#15110d" /></span>
      </h2>
      <p className="plans-intro__copy">
        Whether you&apos;re a freelancer who needs a desk or an enterprise that needs a floor,
        we have a plan built around you, not the other way around.
      </p>
    </>
  );
}

