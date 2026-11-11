import { Fragment } from "react";
import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { seededRandom, useStaggeredProgress } from "./flyingRotation";
import "./FlyingRotationText.css";

/*
 * "Flying rotation" text (see skills/flying-rotation/SKILL.md), built on Motion instead of GSAP.
 * Each character starts tilted at its own angle, shrunk, faded and pushed sideways, then flies
 * into place as the scroll progress runs 0 → 1. Characters follow one another (stagger) and
 * ease out fast-then-settle, like GSAP's "power4".
 *
 * Accessibility: put the full sentence on the parent element as aria-label and mark the
 * split text aria-hidden, so screen readers read it once, as a whole.
 */

interface FlyingProps {
  progress: MotionValue<number>;
  /** Position of the first character in the whole timeline. */
  startIndex: number;
  /** Total animated items in the whole timeline (for stagger spacing). */
  total: number;
  /** Max tilt in degrees (±). 8 is subtle, 20 is lively. */
  angle?: number;
  /** Max sideways scatter in px (±). */
  scatter?: number;
  disabled?: boolean;
}

function FlyingChar({
  char,
  index,
  progress,
  total,
  angle = 20,
  scatter = 70,
}: Omit<FlyingProps, "startIndex" | "disabled"> & { char: string; index: number }) {
  const t = useStaggeredProgress(progress, index, total);
  const fromRotate = (seededRandom(index) * 2 - 1) * angle;
  const fromX = (seededRandom(index + 0.37) * 2 - 1) * scatter;
  const fromY = 18 + seededRandom(index + 0.71) * 46;

  const rotate = useTransform(t, [0, 1], [fromRotate, 0]);
  const x = useTransform(t, [0, 1], [fromX, 0]);
  const y = useTransform(t, [0, 1], [fromY, 0]);
  const scale = useTransform(t, [0, 1], [0.6, 1]);
  const opacity = useTransform(t, [0, 1], [0.12, 1]);

  return (
    <motion.span className="flying-text__char" style={{ rotate, x, y, scale, opacity }}>
      {char}
    </motion.span>
  );
}

/** Splits `text` into words (kept unbreakable) and characters that fly into place. */
export function FlyingRotationText({ text, startIndex, disabled, ...timeline }: FlyingProps & { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);

  // Index of each word's first character in the shared timeline.
  const offsets: number[] = [];
  let next = startIndex;
  for (const word of words) {
    offsets.push(next);
    next += [...word].length;
  }

  return (
    <>
      {words.map((word, wordIndex) => (
        <Fragment key={wordIndex}>
          <span className="flying-text__word">
            {disabled
              ? word
              : [...word].map((char, charIndex) => (
                  <FlyingChar
                    key={charIndex}
                    char={char}
                    index={offsets[wordIndex] + charIndex}
                    {...timeline}
                  />
                ))}
          </span>
          {wordIndex < words.length - 1 && " "}
        </Fragment>
      ))}
    </>
  );
}

/**
 * A block (e.g. a pill or badge) that joins the same timeline as one item. It only fades,
 * so children using Motion layout animations are not distorted by a transformed parent.
 */
export function FlyingFadeBlock({
  children,
  progress,
  index,
  total,
  disabled,
  className,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  index: number;
  total: number;
  disabled?: boolean;
  className?: string;
}) {
  const t = useStaggeredProgress(progress, index, total);
  const opacity = useTransform(t, [0, 1], [0, 1]);

  return (
    <motion.span className={className} style={disabled ? undefined : { opacity }}>
      {children}
    </motion.span>
  );
}
