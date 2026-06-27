"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 100%", "end 35%"],
  });

  const firstProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const secondProgress = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  const firstGradient = useTransform(firstProgress, getRevealGradient);
  const secondGradient = useTransform(secondProgress, getRevealGradient);

  return (
    <div ref={ref} className="relative">
      <span
        aria-hidden="true"
        className="font-arial pointer-events-none absolute -left-8 -top-10 z-0 text-[130px] font-black leading-none text-neutral-800 md:-left-16 md:-top-16 md:text-[210px]"
      >
        “
      </span>

      <p className="relative z-10 text-[38px] font-semibold md:text-[72px]">
        {/* 첫 줄 */}
        <span className="relative block">
          {/* 기본 회색 */}
          <span className="text-neutral-800">Where artists stay</span>

          <motion.span
            style={{
              backgroundImage: firstGradient,
            }}
            aria-hidden="true"
            className="
              absolute left-0 top-0
              bg-clip-text text-transparent
            "
          >
            Where artists stay
          </motion.span>
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
              bg-clip-text text-transparent
            "
          >
            Where their stories begin.
          </motion.span>
        </span>
      </p>
    </div>
  );
}
