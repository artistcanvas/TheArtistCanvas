"use client";

import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HeroVideoCard } from "./heroVideoCardTypes";

const MD_BREAKPOINT = 768;
const MOBILE_CARD_WIDTH = 335;
const MOBILE_CARD_HEIGHT = 188;
const MOBILE_CARD_GAP = 16;
const DESKTOP_CARD_STEP_PERCENT = 33.78;
const DESKTOP_HIDDEN_TOP_PERCENT = 67.55;

type HowToCardProps = {
  cards: HeroVideoCard[];
  shouldReveal: boolean;
};

function getYouTubeVideoId(youtubeUrl: string) {
  try {
    const url = new URL(youtubeUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (!hostname.endsWith("youtube.com")) {
      return null;
    }

    if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    }

    const [route, videoId] = url.pathname.split("/").filter(Boolean);

    if (["embed", "shorts", "live"].includes(route)) {
      return videoId ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export default function HowToCard({ cards, shouldReveal }: HowToCardProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [cardWidth, setCardWidth] = useState(MOBILE_CARD_WIDTH);
  const [activeCard, setActiveCard] = useState<HeroVideoCard | null>(null);
  const visibleCards = useMemo(
    () => cards.slice(0, 3).sort((a, b) => a.position - b.position),
    [cards],
  );
  const embedUrl = useMemo(() => {
    if (!activeCard) {
      return null;
    }

    const videoId = getYouTubeVideoId(activeCard.youtubeUrl);

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      : null;
  }, [activeCard]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);

    updateIsDesktop();
    mediaQuery.addEventListener("change", updateIsDesktop);

    return () => mediaQuery.removeEventListener("change", updateIsDesktop);
  }, []);

  useEffect(() => {
    if (!stackRef.current) return;

    const updateCardWidth = () => {
      if (stackRef.current) {
        setCardWidth(stackRef.current.offsetWidth);
      }
    };
    const resizeObserver = new ResizeObserver(updateCardWidth);

    updateCardWidth();
    resizeObserver.observe(stackRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!activeCard) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCard(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCard]);

  const mobileCardHeight = (cardWidth / MOBILE_CARD_WIDTH) * MOBILE_CARD_HEIGHT;
  const mobileCardStep = mobileCardHeight + MOBILE_CARD_GAP;
  const mobileStackHeight =
    mobileCardHeight * visibleCards.length +
    MOBILE_CARD_GAP * Math.max(0, visibleCards.length - 1);
  const cardStepPercent = isDesktop
    ? DESKTOP_CARD_STEP_PERCENT
    : mobileCardStep;
  const hiddenTopPercent = isDesktop
    ? DESKTOP_HIDDEN_TOP_PERCENT
    : mobileCardStep * 2;
  const shouldShowCards = !isDesktop || shouldReveal;

  return (
    <>
      <div className="flex w-full self-end justify-center md:justify-end">
        <motion.div
          ref={stackRef}
          initial="hidden"
          animate={shouldShowCards ? "show" : "hidden"}
          style={{ height: isDesktop ? undefined : mobileStackHeight }}
          className="relative w-full md:aspect-[523/894] md:max-w-[475px]"
        >
          {visibleCards.map((card, index) => (
            <motion.div
              key={card.id}
              variants={{
                hidden: {
                  top: `${hiddenTopPercent}${isDesktop ? "%" : "px"}`,
                  zIndex: visibleCards.length - index,
                },
                show: {
                  top: `${index * cardStepPercent}${isDesktop ? "%" : "px"}`,
                  zIndex: visibleCards.length - index,
                  transition: {
                    duration: isDesktop ? 0.7 : 0,
                    delay: isDesktop ? 0.05 + index * 0.08 : 0,
                    ease: [0.1, 1, 0.36, 1],
                  },
                },
              }}
              className="absolute left-0 w-full"
            >
              <button
                type="button"
                aria-label={`${card.title} video`}
                onClick={() => setActiveCard(card)}
                className="group relative block aspect-[335/188] w-full overflow-hidden rounded-[8px] border border-[#16161A] bg-[#17171A] text-left shadow-[0_18px_42px_rgba(0,0,0,0.36)] md:aspect-[523/293]"
              >
                {card.thumbnailUrl ? (
                  <span
                    aria-hidden="true"
                    className="absolute -inset-px scale-[1.025] bg-cover bg-center transition duration-300 group-hover:scale-[1.055] group-hover:opacity-70"
                    style={{ backgroundImage: `url(${card.thumbnailUrl})` }}
                  />
                ) : (
                  <span className="absolute -inset-px scale-[1.025] bg-[linear-gradient(116deg,#202026_0%,#151519_42%,#060607_72%,#020203_100%)]" />
                )}
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.64)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute inset-0 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute left-1/2 top-1/2 inline-flex h-[39px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/45 bg-white/20 px-5 text-[13px] font-medium text-white opacity-0 shadow-[0_12px_36px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Play
                    aria-hidden="true"
                    size={14}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                  지금 재생하기
                </span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {activeCard ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeCard.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 py-8 backdrop-blur-sm"
          onClick={() => setActiveCard(null)}
        >
          <div
            className="relative w-full max-w-[1100px] min-[1921px]:max-w-[calc((1100/1920)*100vw)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close video"
              onClick={() => setActiveCard(null)}
              className="absolute right-0 top-[-46px] flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X aria-hidden="true" size={18} strokeWidth={2} />
            </button>

            {embedUrl ? (
              <div className="overflow-hidden rounded-[8px] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <iframe
                  title={activeCard.title}
                  src={embedUrl}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={activeCard.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[220px] items-center justify-center rounded-[8px] bg-[#101012] px-6 text-center text-[15px] font-bold text-white"
              >
                YouTube
              </a>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
