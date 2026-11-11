import type { ReactElement } from "react";

/*
 * Flat, soft-shadowed workspace illustrations for the amenity cards.
 * Each one is drawn on a 200 x 200 canvas and centred, so it stays fully visible
 * whatever the card's shape. The drop shadow comes from CSS (.amenity-art__scene).
 */

export type SceneName =
  | "clock"
  | "coffee"
  | "desk"
  | "charger"
  | "plant"
  | "car"
  | "bike"
  | "paw"
  | "lock"
  | "plate"
  | "calendar"
  | "wifi";

const stroke = { strokeLinecap: "round", strokeLinejoin: "round" } as const;

const scenes: Record<SceneName, ReactElement> = {
  // Open 24/7: a clock with a moon.
  clock: (
    <>
      <circle cx="98" cy="108" r="68" fill="#163a59" />
      <circle cx="98" cy="108" r="56" fill="#f7f0df" />
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={i}
          x1="98"
          y1="62"
          x2="98"
          y2={i % 3 === 0 ? 72 : 68}
          stroke="#163a59"
          strokeWidth={i % 3 === 0 ? 4 : 2.5}
          transform={`rotate(${i * 30} 98 108)`}
          {...stroke}
        />
      ))}
      <path d="M98 108V74" stroke="#163a59" strokeWidth="6" fill="none" {...stroke} />
      <path d="M98 108l22 14" stroke="#163a59" strokeWidth="7" fill="none" {...stroke} />
      <circle cx="98" cy="108" r="6" fill="#e8603e" />
      <path d="M160 30a24 24 0 1 0 20 38 19 19 0 0 1-20-38z" fill="#f7f0df" />
    </>
  ),

  // Service staff at your desk: a coffee cup with steam.
  coffee: (
    <>
      <ellipse cx="100" cy="158" rx="66" ry="12" fill="#2b0b1b" />
      <path d="M150 92h8a20 20 0 0 1 0 40h-14" fill="none" stroke="#3e0f25" strokeWidth="10" {...stroke} />
      <path d="M50 84h100v26c0 30-20 48-50 48S50 140 50 110z" fill="#3e0f25" />
      <ellipse cx="100" cy="84" rx="50" ry="8" fill="#6b1d3d" />
      <ellipse cx="100" cy="85" rx="41" ry="5" fill="#c98b5a" />
      <path d="M82 66c-9-9 9-15 0-26M100 66c-9-9 9-15 0-26M118 66c-9-9 9-15 0-26" fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="5" {...stroke} />
    </>
  ),

  // Custom office or desk layouts: a monitor on a desk.
  desk: (
    <>
      <rect x="40" y="36" width="120" height="82" rx="7" fill="#6b2a12" />
      <rect x="49" y="45" width="102" height="64" rx="3" fill="#f7e5c4" />
      <rect x="58" y="55" width="46" height="7" rx="3.5" fill="#d8952a" />
      <rect x="58" y="68" width="76" height="6" rx="3" fill="#e3ae56" />
      <rect x="58" y="80" width="58" height="6" rx="3" fill="#e3ae56" />
      <rect x="58" y="92" width="68" height="6" rx="3" fill="#e3ae56" />
      <path d="M90 118h20l4 24H86z" fill="#4b1d0c" />
      <rect x="72" y="140" width="56" height="7" rx="3.5" fill="#4b1d0c" />
      <rect x="20" y="146" width="160" height="12" rx="4" fill="#8a3a1c" />
      <rect x="34" y="158" width="9" height="30" rx="2" fill="#6b2a12" />
      <rect x="157" y="158" width="9" height="30" rx="2" fill="#6b2a12" />
      <circle cx="164" cy="126" r="9" fill="#26382a" />
      <path d="M164 134v12" stroke="#26382a" strokeWidth="4" fill="none" {...stroke} />
    </>
  ),

  // EV charging stations: a charger with its nozzle and cable.
  charger: (
    <>
      <rect x="62" y="26" width="76" height="130" rx="14" fill="#2a1a14" />
      <rect x="74" y="40" width="52" height="42" rx="6" fill="#f2a48c" />
      <path d="M105 46l-15 22h11l-4 16 17-24h-11z" fill="#2a1a14" />
      <rect x="86" y="98" width="28" height="38" rx="9" fill="#f2a48c" />
      <rect x="50" y="156" width="100" height="12" rx="5" fill="#1b100c" />
      <path d="M100 136c0 22 36 12 40 32" fill="none" stroke="#2a1a14" strokeWidth="7" {...stroke} />
    </>
  ),

  // Real green spaces: a potted plant.
  plant: (
    <>
      <ellipse cx="100" cy="86" rx="14" ry="44" fill="#26382a" />
      <ellipse cx="100" cy="88" rx="13" ry="42" fill="#3a5a40" transform="rotate(-36 100 128)" />
      <ellipse cx="100" cy="88" rx="13" ry="42" fill="#3a5a40" transform="rotate(36 100 128)" />
      <ellipse cx="100" cy="92" rx="11" ry="34" fill="#26382a" transform="rotate(-66 100 128)" />
      <ellipse cx="100" cy="92" rx="11" ry="34" fill="#26382a" transform="rotate(66 100 128)" />
      <path d="M66 134h68l-9 50H75z" fill="#8a3a1c" />
      <rect x="60" y="124" width="80" height="14" rx="5" fill="#a64a2a" />
    </>
  ),

  // Free gated parking: a car and a parking sign.
  car: (
    <>
      <rect x="22" y="106" width="158" height="38" rx="12" fill="#43122a" />
      <path d="M58 108l22-32c3-4 8-6 14-6h38c6 0 11 2 15 6l20 32z" fill="#43122a" />
      <path d="M71 106l16-23c2-3 5-4 9-4h18v27z" fill="#f7c9bd" />
      <path d="M124 79h17c4 0 7 1 9 4l16 23h-42z" fill="#f7c9bd" />
      <circle cx="62" cy="146" r="18" fill="#1d0814" />
      <circle cx="62" cy="146" r="7" fill="#c8577a" />
      <circle cx="144" cy="146" r="18" fill="#1d0814" />
      <circle cx="144" cy="146" r="7" fill="#c8577a" />
      <rect x="166" y="114" width="14" height="8" rx="3" fill="#f6dc8a" />
      <rect x="22" y="22" width="42" height="42" rx="8" fill="#f7efe3" />
      <text x="43" y="54" textAnchor="middle" fontSize="32" fontWeight="800" fill="#43122a" fontFamily="sans-serif">P</text>
    </>
  ),

  // On-site car and bike cleaning: a bicycle, bubbles and sparkles.
  bike: (
    <>
      <circle cx="50" cy="128" r="34" fill="none" stroke="#29235f" strokeWidth="7" />
      <circle cx="150" cy="128" r="34" fill="none" stroke="#29235f" strokeWidth="7" />
      <path d="M50 128h50L84 84 50 128m34-44h42l-26 44m26-44l24 44" fill="none" stroke="#29235f" strokeWidth="6" {...stroke} />
      <path d="M76 76h18M118 72h16M126 84V72" fill="none" stroke="#29235f" strokeWidth="6" {...stroke} />
      <circle cx="100" cy="128" r="7" fill="#29235f" />
      <circle cx="50" cy="128" r="5" fill="#e3c3e8" />
      <circle cx="150" cy="128" r="5" fill="#e3c3e8" />
      <circle cx="40" cy="52" r="13" fill="none" stroke="#ffffff" strokeWidth="4" strokeOpacity="0.9" />
      <circle cx="62" cy="34" r="7" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeOpacity="0.9" />
      <path d="M164 38l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="#ffffff" />
    </>
  ),

  // Pets allowed: a paw print.
  paw: (
    <>
      <path d="M100 98c-27 0-46 23-46 42 0 15 13 21 28 19 9-1 13-4 18-4s9 3 18 4c15 2 28-4 28-19 0-19-19-42-46-42z" fill="#8a3a1c" />
      <ellipse cx="50" cy="92" rx="13" ry="19" fill="#8a3a1c" transform="rotate(-24 50 92)" />
      <ellipse cx="78" cy="64" rx="13" ry="20" fill="#8a3a1c" transform="rotate(-8 78 64)" />
      <ellipse cx="122" cy="64" rx="13" ry="20" fill="#8a3a1c" transform="rotate(8 122 64)" />
      <ellipse cx="150" cy="92" rx="13" ry="19" fill="#8a3a1c" transform="rotate(24 150 92)" />
    </>
  ),

  // Quiet and secure: a padlock.
  lock: (
    <>
      <path d="M68 94V72a32 32 0 0 1 64 0v22" fill="none" stroke="#2d2a26" strokeWidth="15" {...stroke} />
      <rect x="46" y="90" width="108" height="86" rx="14" fill="#2d2a26" />
      <circle cx="100" cy="126" r="12" fill="#ece4d3" />
      <rect x="96" y="130" width="8" height="26" rx="4" fill="#ece4d3" />
    </>
  ),

  // Indoor and outdoor dining: a plate with a fork and a knife.
  plate: (
    <>
      <circle cx="100" cy="100" r="56" fill="#23453a" />
      <circle cx="100" cy="100" r="43" fill="#f6e7c0" />
      <circle cx="100" cy="100" r="31" fill="none" stroke="#e4cf9c" strokeWidth="3" />
      <path d="M18 40v28M26 40v28M34 40v28M18 68c0 14 16 14 16 0M26 82v84" fill="none" stroke="#23453a" strokeWidth="5" {...stroke} />
      <path d="M180 40c-14 6-14 38-4 52h4z" fill="#23453a" />
      <path d="M180 92v74" fill="none" stroke="#23453a" strokeWidth="7" {...stroke} />
    </>
  ),

  // Member-only events and workshops: a calendar.
  calendar: (
    <>
      <rect x="32" y="38" width="136" height="128" rx="12" fill="#f7f1e4" />
      <path d="M32 50a12 12 0 0 1 12-12h112a12 12 0 0 1 12 12v26H32z" fill="#d8952a" />
      <rect x="62" y="26" width="10" height="26" rx="5" fill="#3a2a10" />
      <rect x="128" y="26" width="10" height="26" rx="5" fill="#3a2a10" />
      {[100, 124, 148].flatMap((y) =>
        [54, 77, 100, 123, 146].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="#c9bfa6" />
        )),
      )}
      <circle cx="100" cy="124" r="13" fill="#d8952a" />
      <path d="M94 124l5 5 9-10" fill="none" stroke="#f7f1e4" strokeWidth="4" {...stroke} />
    </>
  ),

  // High-speed internet and backup power: Wi-Fi with a power badge.
  wifi: (
    <>
      <path d="M30 84a96 96 0 0 1 136 0M54 108a62 62 0 0 1 88 0M77 132a30 30 0 0 1 42 0" fill="none" stroke="#16304d" strokeWidth="13" {...stroke} />
      <circle cx="98" cy="156" r="9" fill="#16304d" />
      <circle cx="154" cy="148" r="28" fill="#e8a33a" />
      <path d="M158 126l-15 25h12l-4 19 17-28h-12z" fill="#16304d" />
    </>
  ),
};

export function AmenityScene({ name }: { name: SceneName }) {
  return (
    <svg
      className="amenity-art__scene"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {scenes[name]}
    </svg>
  );
}
