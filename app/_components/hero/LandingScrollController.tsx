"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { HOW_TO_QUOTE_PLAY_EVENT } from "./landingScrollEvents";
import { animateWindowScroll } from "./scrollAnimation";

const HOW_TO_ID = "how-to";
const HOW_TO_CARD_CONTAINER_ID = "how-to-card-container";
const SNAP_TOLERANCE = 24;
const TOUCH_DELTA_THRESHOLD = 12;
const SNAP_SCROLL_DURATION = 700;

export default function LandingScrollController({
  children,
}: PropsWithChildren) {
  const isSnappingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const cancelScrollAnimationRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const getTargetTop = (id: string) => {
      const target = document.getElementById(id);

      if (!target) return null;

      return target.getBoundingClientRect().top + window.scrollY;
    };

    const playHowToQuote = () => {
      window.dispatchEvent(new Event(HOW_TO_QUOTE_PLAY_EVENT));
    };

    const snapTo = (id: string, top: number) => {
      isSnappingRef.current = true;

      if (cancelScrollAnimationRef.current) {
        cancelScrollAnimationRef.current();
      }

      const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 0
        : SNAP_SCROLL_DURATION;

      cancelScrollAnimationRef.current = animateWindowScroll({
        top,
        duration,
        onComplete: () => {
          if (id === HOW_TO_ID) {
            playHowToQuote();
          }

          isSnappingRef.current = false;
          cancelScrollAnimationRef.current = null;
        },
      });
    };

    const maybeSnapDown = () => {
      if (isSnappingRef.current) return false;

      const howToTop = getTargetTop(HOW_TO_ID);
      const cardContainerTop = getTargetTop(HOW_TO_CARD_CONTAINER_ID);

      if (howToTop === null || cardContainerTop === null) return false;

      const scrollY = window.scrollY;

      if (scrollY < howToTop - SNAP_TOLERANCE) {
        snapTo(HOW_TO_ID, howToTop);
        return true;
      }

      if (
        Math.abs(scrollY - howToTop) <= SNAP_TOLERANCE ||
        (scrollY > howToTop && scrollY < cardContainerTop - SNAP_TOLERANCE)
      ) {
        snapTo(HOW_TO_CARD_CONTAINER_ID, cardContainerTop);
        return true;
      }

      return false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;

      if (maybeSnapDown()) {
        event.preventDefault();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (touchStartYRef.current === null) return;

      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;

      const deltaY = touchStartYRef.current - currentY;

      if (deltaY > TOUCH_DELTA_THRESHOLD && maybeSnapDown()) {
        event.preventDefault();
        touchStartYRef.current = null;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);

      if (cancelScrollAnimationRef.current) {
        cancelScrollAnimationRef.current();
      }
    };
  }, []);

  return <>{children}</>;
}
