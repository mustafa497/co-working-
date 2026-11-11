import { useTransform, type MotionValue } from "motion/react";

/*
 * Helpers for the "flying rotation" effect (skills/flying-rotation), shared by
 * FlyingRotationText and the Community card wall.
 */

/** Deterministic 0–1 pseudo-random number, so angles stay the same between renders. */
export function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Progress (0 → 1, eased) of item `index` of `total` in a staggered, scroll-scrubbed timeline.
 * Each item's tween lasts 1 unit and starts `stagger` units after the previous one, eased
 * fast-then-settle like GSAP's "power4".
 */
export function useStaggeredProgress(
  progress: MotionValue<number>,
  index: number,
  total: number,
  stagger = 0.03,
) {
  const span = 1 + stagger * Math.max(total - 1, 0);
  const start = (index * stagger) / span;
  const end = (index * stagger + 1) / span;
  return useTransform(progress, (value) => easeOutQuart(clamp01((value - start) / (end - start))));
}

/** Characters in `text` that animate (spaces are not split out). */
export function countFlyingChars(text: string) {
  return [...text.replace(/\s+/g, "")].length;
}
