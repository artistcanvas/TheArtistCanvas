"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { HOW_TO_QUOTE_PLAY_EVENT } from "./landingScrollEvents";

const QUOTE_REVEAL_DURATION = 1.25;

const getRevealGradient = (value: number) => {
  if (value <= 0) {
    return "linear-gradient(90deg, #262626 0%, #262626 100%)";
  }

  if (value >= 0.98) {
    return "linear-gradient(90deg, #ffffff 0%, #ffffff 100%)";
  }

  const progress = value * 100;
  const fade = 18;
  const whiteStop = Math.max(0, progress - fade);
  const darkStop = Math.min(100, progress + fade);

  return `linear-gradient(90deg, #ffffff 0%, #ffffff ${whiteStop}%, #d4d4d4 ${progress}%, #262626 ${darkStop}%, #262626 100%)`;
};

export default function AnimatedQuote() {
  const ref = useRef<HTMLDivElement>(null);
  const hasPlayedRef = useRef(false);
  const revealProgress = useMotionValue(0);

  useEffect(() => {
    const playReveal = () => {
      if (hasPlayedRef.current) return;

      hasPlayedRef.current = true;

      animate(revealProgress, 1, {
        duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0
          : QUOTE_REVEAL_DURATION,
        ease: [0.22, 1, 0.36, 1],
      });
    };

    window.addEventListener(HOW_TO_QUOTE_PLAY_EVENT, playReveal);

    return () => {
      window.removeEventListener(HOW_TO_QUOTE_PLAY_EVENT, playReveal);
    };
  }, [revealProgress]);

  const firstProgress = useTransform(revealProgress, [0, 0.52], [0, 1]);
  const secondProgress = useTransform(revealProgress, [0.48, 1], [0, 1]);

  const firstGradient = useTransform(firstProgress, getRevealGradient);
  const secondGradient = useTransform(secondProgress, getRevealGradient);

  return (
    <div ref={ref} className="relative">
      <p className="relative z-10 max-w-full text-end text-[clamp(24px,calc((80/1920)*100vw),80px)] font-semibold leading-[1.15] md:text-start">
        {/* 첫 줄 */}
        <span className="relative block">
          {/* 기본 회색 */}
          <span className="relative inline-block">
            <span
              aria-hidden="true"
              className="font-arial pointer-events-none absolute left-0 top-0 z-0 -translate-x-[0.33em] -translate-y-[0.4em] text-[3.00625em] font-black leading-none text-neutral-800"
            >
              “
            </span>
            <span className="relative z-10 text-neutral-800">
              Where artists stay
            </span>

            <motion.span
              style={{
                backgroundImage: firstGradient,
              }}
              aria-hidden="true"
              className="absolute left-0 top-0 z-10 bg-clip-text leading-[inherit] text-transparent"
            >
              Where artists stay
            </motion.span>
          </span>
        </span>

        {/* 둘째 줄 */}
        <span className="relative block">
          <span className="text-neutral-800">Where their stories begin.</span>

          <motion.span
            style={{
              backgroundImage: secondGradient,
            }}
            aria-hidden="true"
            className="
              absolute left-0 top-0
              bg-clip-text leading-[inherit] text-transparent
            "
          >
            Where their stories begin.
          </motion.span>
        </span>
      </p>
    </div>
  );
}
