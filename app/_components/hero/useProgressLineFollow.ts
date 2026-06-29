"use client";

import { RefObject, useEffect, useRef, useState } from "react";

const LINE_DRAW_DURATION = 1000;
const MD_BREAKPOINT = 768;
const START_TOLERANCE = 8;
const VIEWPORT_TOLERANCE = 24;

type UseProgressLineFollowParams = {
  lineTrackRef: RefObject<HTMLDivElement | null>;
};

const canAutoScroll = () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isDesktop = window.matchMedia(
    `(min-width: ${MD_BREAKPOINT}px)`,
  ).matches;

  return !prefersReducedMotion && isDesktop;
};

export default function useProgressLineFollow({
  lineTrackRef,
}: UseProgressLineFollowParams) {
  const hasStartedRef = useRef(false);
  const previousScrollYRef = useRef(0);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const [isLineActive, setIsLineActive] = useState(false);
  const [isLineComplete, setIsLineComplete] = useState(false);

  useEffect(() => {
    const lineTrack = lineTrackRef.current;

    if (!lineTrack) return;

    const cancelLineFollowScroll = () => {
      if (!scrollAnimationFrameRef.current) return;

      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    };

    const resetLine = () => {
      hasStartedRef.current = false;
      setIsLineActive(false);
      setIsLineComplete(false);
      cancelLineFollowScroll();
    };

    const isBeforeLineStart = () => {
      const lineTrackTop =
        lineTrack.getBoundingClientRect().top + window.scrollY;

      return window.scrollY < lineTrackTop - START_TOLERANCE;
    };

    const isLineNearViewport = () => {
      const rect = lineTrack.getBoundingClientRect();

      return (
        rect.top < window.innerHeight + VIEWPORT_TOLERANCE &&
        rect.bottom > -VIEWPORT_TOLERANCE
      );
    };

    const startLineFollowScroll = () => {
      if (!canAutoScroll()) return;

      const startY = window.scrollY;
      const lineTrackTop = lineTrack.getBoundingClientRect().top + startY;
      const lineTrackHeight = lineTrack.offsetHeight + 20;
      const followPoint = window.innerHeight - 10;
      const startTime = performance.now();

      const animateScroll = (time: number) => {
        const elapsed = Math.min((time - startTime) / LINE_DRAW_DURATION, 1);
        const currentLineEnd = lineTrackTop + lineTrackHeight * elapsed;
        const nextY = Math.max(startY, currentLineEnd - followPoint);

        window.scrollTo(0, nextY);

        if (elapsed < 1) {
          scrollAnimationFrameRef.current =
            window.requestAnimationFrame(animateScroll);
          return;
        }

        scrollAnimationFrameRef.current = null;
      };

      scrollAnimationFrameRef.current =
        window.requestAnimationFrame(animateScroll);
    };

    const startLine = () => {
      if (hasStartedRef.current) return;

      hasStartedRef.current = true;
      setIsLineActive(true);
      startLineFollowScroll();
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > previousScrollYRef.current;
      const isAutoScrolling = scrollAnimationFrameRef.current !== null;
      previousScrollYRef.current = currentScrollY;

      if (!hasStartedRef.current) {
        if (isLineNearViewport() && !isBeforeLineStart() && isScrollingDown) {
          startLine();
        }

        return;
      }

      if (!isScrollingDown && !isAutoScrolling) {
        resetLine();
      }
    };

    previousScrollYRef.current = window.scrollY;

    const lineObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        if (!entry.isIntersecting) {
          const isLineBelowViewport = entry.boundingClientRect.top > 0;

          if (isLineBelowViewport) {
            resetLine();
          }

          return;
        }

        startLine();
      },
      {
        rootMargin: "0px 0px -10px 0px",
        threshold: 0.01,
      },
    );

    lineObserver.observe(lineTrack);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      lineObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      cancelLineFollowScroll();
    };
  }, [lineTrackRef]);

  return {
    durationSeconds: LINE_DRAW_DURATION / 1000,
    isLineActive,
    isLineComplete,
    setIsLineComplete,
  };
}
