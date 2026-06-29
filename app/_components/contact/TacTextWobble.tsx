"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import TacText from "@/public/imgs/tac-text.png";

type WobbleStyle = CSSProperties & {
  "--tac-wobble-x": string;
  "--tac-wobble-y": string;
  "--tac-wobble-radius": string;
};

const WOBBLE_RADIUS = 100;

export default function TacTextWobble() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const initialWobbleStyle: WobbleStyle = {
    "--tac-wobble-x": "0px",
    "--tac-wobble-y": "0px",
    "--tac-wobble-radius": "0px",
  };

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reduceMotionQuery.matches) {
      return;
    }

    let frameId = 0;
    const startedAt = performance.now();
    const target = { x: 0, y: 0, radius: 0 };
    const current = { x: 0, y: 0, radius: 0 };

    const updatePointer = (event: PointerEvent) => {
      const wrapper = wrapperRef.current;

      if (!wrapper) {
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const isInside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      target.radius = isInside ? WOBBLE_RADIUS : 0;

      if (!isInside) {
        return;
      }

      target.x = event.clientX - rect.left;
      target.y = event.clientY - rect.top;
    };

    const animate = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const xFrequency = 0.018 + Math.sin(elapsed * 1.1) * 0.004;
      const yFrequency = 0.052 + Math.cos(elapsed * 1.35) * 0.008;
      const scale =
        30 + Math.sin(elapsed * 2.2) * 1.2 + Math.cos(elapsed * 1.4) * 0.7;

      current.x += (target.x - current.x) * 0.55;
      current.y += (target.y - current.y) * 0.55;
      current.radius += (target.radius - current.radius) * 0.5;

      wrapperRef.current?.style.setProperty(
        "--tac-wobble-x",
        `${current.x.toFixed(1)}px`,
      );
      wrapperRef.current?.style.setProperty(
        "--tac-wobble-y",
        `${current.y.toFixed(1)}px`,
      );
      wrapperRef.current?.style.setProperty(
        "--tac-wobble-radius",
        `${current.radius.toFixed(1)}px`,
      );

      turbulenceRef.current?.setAttribute(
        "baseFrequency",
        `${xFrequency.toFixed(4)} ${yFrequency.toFixed(4)}`,
      );
      displacementRef.current?.setAttribute("scale", scale.toFixed(2));

      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", updatePointer);
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative" style={initialWobbleStyle}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id="tac-text-wobble-filter"
            x="-4%"
            y="-8%"
            width="108%"
            height="116%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.018 0.052"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2="noise"
              scale="5.4"
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>
      <Image
        src={TacText}
        alt=""
        aria-hidden="true"
        priority
        height={663}
        width={1882}
        className="h-auto w-full object-contain opacity-[0.42]"
        style={{
          WebkitMaskImage:
            "radial-gradient(circle at var(--tac-wobble-x) var(--tac-wobble-y), transparent 0 var(--tac-wobble-radius), rgba(0, 0, 0, 0.35) calc(var(--tac-wobble-radius) + 8px), #000 calc(var(--tac-wobble-radius) + 16px))",
          maskImage:
            "radial-gradient(circle at var(--tac-wobble-x) var(--tac-wobble-y), transparent 0 var(--tac-wobble-radius), rgba(0, 0, 0, 0.35) calc(var(--tac-wobble-radius) + 8px), #000 calc(var(--tac-wobble-radius) + 16px))",
        }}
      />
      <Image
        src={TacText}
        alt=""
        aria-hidden="true"
        priority
        height={663}
        width={1882}
        className="absolute left-0 top-0 h-auto w-full object-contain opacity-[0.42] motion-reduce:hidden"
        style={{
          filter: "url(#tac-text-wobble-filter)",
          WebkitMaskImage:
            "radial-gradient(circle at var(--tac-wobble-x) var(--tac-wobble-y), #000 0 var(--tac-wobble-radius), rgba(0, 0, 0, 0.65) calc(var(--tac-wobble-radius) + 8px), transparent calc(var(--tac-wobble-radius) + 16px))",
          maskImage:
            "radial-gradient(circle at var(--tac-wobble-x) var(--tac-wobble-y), #000 0 var(--tac-wobble-radius), rgba(0, 0, 0, 0.65) calc(var(--tac-wobble-radius) + 8px), transparent calc(var(--tac-wobble-radius) + 16px))",
        }}
      />
    </div>
  );
}
