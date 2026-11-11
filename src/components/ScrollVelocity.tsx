import React, { useRef, useLayoutEffect, useState } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from 'motion/react';

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: React.ReactNode;
  baseVelocity: number;
  paused?: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

interface ScrollVelocityProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
  texts: React.ReactNode[];
  velocity?: number;
  paused?: boolean;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    function updateWidth() {
      if (ref.current) setWidth(ref.current.offsetWidth);
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [ref]);
  return width;
}

// Defined at module level: declaring it inside ScrollVelocity made React remount every
// row (and snap the marquee back to the start) whenever the parent re-rendered.
function VelocityText({ children, baseVelocity, paused = false, ...rest }: VelocityTextProps) {
    const baseX = useMotionValue(0);
    // 1 = full speed, 0 = stopped. Eases between the two so pausing glides to a halt.
    const speed = useRef(1);
    const scrollOptions = rest.scrollContainerRef ? { container: rest.scrollContainerRef } : {};
    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: rest.damping ?? 50,
      stiffness: rest.stiffness ?? 400,
    });
    const velocityFactor = useTransform(
      smoothVelocity,
      rest.velocityMapping?.input || [0, 1000],
      rest.velocityMapping?.output || [0, 5],
      { clamp: false }
    );
    const copyRef = useRef<HTMLSpanElement>(null);
    const copyWidth = useElementWidth(copyRef);

    function wrap(min: number, max: number, v: number): number {
      const range = max - min;
      const mod = (((v - min) % range) + range) % range;
      return mod + min;
    }

    const x = useTransform(baseX, v => {
      if (copyWidth === 0) return '0px';
      return `${wrap(-copyWidth, 0, v)}px`;
    });

    const directionFactor = useRef<number>(1);
    useAnimationFrame((_t, delta) => {
      const targetSpeed = paused ? 0 : 1;
      speed.current += (targetSpeed - speed.current) * (1 - Math.pow(0.9, delta / (1000 / 60)));
      if (Math.abs(targetSpeed - speed.current) < 0.001) speed.current = targetSpeed;
      if (speed.current === 0) return;
      let moveBy = directionFactor.current * baseVelocity * speed.current * (delta / 1000);
      if (velocityFactor.get() < 0) directionFactor.current = -1;
      else if (velocityFactor.get() > 0) directionFactor.current = 1;
      moveBy += directionFactor.current * moveBy * velocityFactor.get();
      baseX.set(baseX.get() + moveBy);
    });

    const spans = [];
    for (let i = 0; i < (rest.numCopies ?? 6); i++) {
      spans.push(
        // Copies after the first are visual repeats only; hide them from screen readers.
        <span className={rest.className} key={i} ref={i === 0 ? copyRef : null} aria-hidden={i > 0 || undefined}>
          {children}
        </span>
      );
    }

    return (
      <div className={rest.parallaxClassName} style={rest.parallaxStyle}>
        <motion.div className={rest.scrollerClassName} style={{ x, ...rest.scrollerStyle }}>
          {spans}
        </motion.div>
      </div>
    );
}

export const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
  texts = [],
  velocity = 100,
  paused = false,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName = 'amenity-parallax',
  scrollerClassName = 'amenity-scroller',
  parallaxStyle,
  scrollerStyle,
  scrollContainerRef,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: 0, padding: 0 }}>
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          paused={paused}
          className={className}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}
        </VelocityText>
      ))}
    </div>
  );
};

export default ScrollVelocity;
