"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type HowToCarouselControlsProps = {
  activeIndex: number;
  totalCards: number;
  onPrevious: () => void;
  onNext: () => void;
};

export default function HowToCarouselControls({
  activeIndex,
  totalCards,
  onPrevious,
  onNext,
}: HowToCarouselControlsProps) {
  if (totalCards <= 1) {
    return null;
  }

  const isFirstCard = activeIndex === 0;
  const isLastCard = activeIndex === totalCards - 1;

  return (
    <div className="mt-5 flex items-center justify-center gap-3 md:hidden">
      <button
        type="button"
        aria-label="Previous making film card"
        disabled={isFirstCard}
        onClick={onPrevious}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-[12px] font-medium text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronLeft aria-hidden="true" size={16} strokeWidth={2} />
        PREV
      </button>

      <span className="min-w-[44px] text-center text-[12px] text-white/55">
        {activeIndex + 1}/{totalCards}
      </span>

      <button
        type="button"
        aria-label="Next making film card"
        disabled={isLastCard}
        onClick={onNext}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-[12px] font-medium text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 disabled:cursor-not-allowed disabled:opacity-35"
      >
        NEXT
        <ChevronRight aria-hidden="true" size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
