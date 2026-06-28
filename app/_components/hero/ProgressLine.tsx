"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

type ProgressLineProps = {
  isActive: boolean;
  duration: number;
  onComplete: () => void;
};

export default function ProgressLine({
  isActive,
  duration,
  onComplete,
}: ProgressLineProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="hidden md:block absolute bottom-0 left-0 top-0 w-[3px] overflow-hidden md:w-[5px]"
    >
      <motion.div
        initial={false}
        animate={
          isActive
            ? {
                height: "100%",
                background:
                  "linear-gradient(to bottom, #ffffff 0%, #ffffff 54%, #d7d7d7 78%, rgba(255,255,255,0) 100%)",
              }
            : {
                height: 0,
                background:
                  "linear-gradient(to bottom, #ffffff 0%, #ffffff 54%, #d7d7d7 78%, rgba(255,255,255,0) 100%)",
              }
        }
        transition={{ duration, ease: "linear" }}
        onAnimationComplete={() => {
          if (isActive) {
            onComplete();
          }
        }}
        className="
          w-full origin-top
        "
      />
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={
          isActive ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="absolute left-1/2 top-0 block size-[9px] -translate-x-1/2 rounded-full bg-white md:size-[13px]"
      />
      {isActive ? (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: duration, duration: 0.2 }}
          className="absolute inset-0 bg-white"
        />
      ) : null}
    </div>
  );
}
