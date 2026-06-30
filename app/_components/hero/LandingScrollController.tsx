"use client";

import { PropsWithChildren, useEffect, useRef } from "react";
import { animateWindowScroll } from "./scrollAnimation";

const HERO_ID = "hero";
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

    const getTargetBounds = (id: string) => {
      const target = document.getElementById(id);

      if (!target) return null;

      const rect = target.getBoundingClientRect();
      const top = rect.top + window.scrollY;

      return {
        top,
        bottom: top + rect.height,
      };
    };

    const snapTo = (top: number) => {
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
          isSnappingRef.current = false;
          cancelScrollAnimationRef.current = null;
        },
      });
    };

    const maybeSnapDown = () => {
      if (isSnappingRef.current) return false;

      const cardContainerTop = getTargetTop(HOW_TO_CARD_CONTAINER_ID);

      if (cardContainerTop === null) return false;

      const scrollY = window.scrollY;

      if (scrollY < cardContainerTop - SNAP_TOLERANCE) {
        snapTo(cardContainerTop);
        return true;
      }

      return false;
    };

    const maybeSnapUp = () => {
      if (isSnappingRef.current) return false;

      const heroTop = getTargetTop(HERO_ID);
      const cardContainerBounds = getTargetBounds(HOW_TO_CARD_CONTAINER_ID);

      if (heroTop === null || cardContainerBounds === null) {
        return false;
      }

      const scrollY = window.scrollY;
      const isInCardContainer =
        scrollY >= cardContainerBounds.top - SNAP_TOLERANCE &&
        scrollY <= cardContainerBounds.bottom - SNAP_TOLERANCE;

      if (scrollY > heroTop + SNAP_TOLERANCE && isInCardContainer) {
        snapTo(heroTop);
        return true;
      }

      return false;
    };

    const handleWheel = (event: WheelEvent) => {
      if (isSnappingRef.current) {
        event.preventDefault();
        return;
      }

      if (event.deltaY < 0) {
        if (maybeSnapUp()) {
          event.preventDefault();
        }

        return;
      }

      if (event.deltaY === 0) return;

      if (maybeSnapDown()) {
        event.preventDefault();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (isSnappingRef.current) {
        event.preventDefault();
        return;
      }

      if (touchStartYRef.current === null) return;

      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;

      const deltaY = touchStartYRef.current - currentY;

      if (deltaY < -TOUCH_DELTA_THRESHOLD && maybeSnapUp()) {
        event.preventDefault();
        touchStartYRef.current = null;
        return;
      }

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
