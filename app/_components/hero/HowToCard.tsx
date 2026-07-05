"use client";

import { motion } from "framer-motion";
import { Play, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { HeroVideoCard } from "./heroVideoCardTypes";
import { animateWindowScroll } from "./scrollAnimation";

const WHEEL_COOLDOWN_MS = 420;
const EDGE_EXIT_DELAY_MS = 720;
const WHEEL_THRESHOLD = 24;
const CENTER_CARD_FALLBACK_WIDTH = 640;
const HOW_TO_CARD_CONTAINER_ID = "how-to-card-container";
const SNAP_SCROLL_DURATION = 520;

type HowToCardProps = {
  cards: HeroVideoCard[];
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

function getCardOffset(index: number, activeIndex: number, total: number) {
  let offset = (index - activeIndex + total) % total;

  if (offset > total / 2) {
    offset -= total;
  }

  return offset;
}

export default function HowToCard({ cards }: HowToCardProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const lastWheelAtRef = useRef(0);
  const edgeExitAfterRef = useRef(0);
  const isSnappingToSectionRef = useRef(false);
  const cancelSectionSnapRef = useRef<(() => void) | null>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCard, setActiveCard] = useState<HeroVideoCard | null>(null);
  const visibleCards = useMemo(
    () => [...cards].sort((a, b) => a.position - b.position).slice(0, 10),
    [cards],
  );
  const totalCards = visibleCards.length;
  const centerCardWidth =
    carouselWidth > 0
      ? Math.min(carouselWidth * (carouselWidth >= 768 ? 0.42 : 0.76), 640)
      : CENTER_CARD_FALLBACK_WIDTH;
  const sideStep = centerCardWidth * 0.62;
  const farStep = centerCardWidth * 1.16;
  const embedUrl = useMemo(() => {
    if (!activeCard) {
      return null;
    }

    const videoId = getYouTubeVideoId(activeCard.youtubeUrl);

    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      : null;
  }, [activeCard]);

  const goToCard = useCallback(
    (nextIndex: number) => {
      if (totalCards === 0) return;

      setActiveIndex(Math.min(Math.max(nextIndex, 0), totalCards - 1));
    },
    [totalCards],
  );

  const goBy = useCallback(
    (direction: number) => {
      setActiveIndex((currentIndex) => {
        if (totalCards === 0) return currentIndex;

        return Math.min(Math.max(currentIndex + direction, 0), totalCards - 1);
      });
    },
    [totalCards],
  );

  useEffect(() => {
    if (!carouselRef.current) return;

    const updateCarouselWidth = () => {
      setCarouselWidth(carouselRef.current?.offsetWidth ?? 0);
    };
    const resizeObserver = new ResizeObserver(updateCarouselWidth);

    updateCarouselWidth();
    resizeObserver.observe(carouselRef.current);

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

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (activeCard || totalCards <= 1 || !carouselRef.current) {
        return;
      }

      const rect = carouselRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionIsPinned =
        rect.top < viewportHeight * 0.74 && rect.bottom > viewportHeight * 0.28;

      if (!sectionIsPinned) {
        return;
      }

      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;

      if (Math.abs(delta) < WHEEL_THRESHOLD) return;

      const direction = delta > 0 ? 1 : -1;
      const now = window.performance.now();
      const section = document.getElementById(HOW_TO_CARD_CONTAINER_ID);
      const sectionTop = section
        ? section.getBoundingClientRect().top + window.scrollY
        : null;

      if (
        direction < 0 &&
        activeIndex === totalCards - 1 &&
        sectionTop !== null &&
        window.scrollY > sectionTop + 24 &&
        rect.top < viewportHeight * 0.24
      ) {
        event.preventDefault();
        event.stopPropagation();

        if (isSnappingToSectionRef.current) {
          return;
        }

        isSnappingToSectionRef.current = true;
        cancelSectionSnapRef.current?.();
        cancelSectionSnapRef.current = animateWindowScroll({
          top: sectionTop,
          duration: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? 0
            : SNAP_SCROLL_DURATION,
          onComplete: () => {
            isSnappingToSectionRef.current = false;
            cancelSectionSnapRef.current = null;
            edgeExitAfterRef.current =
              window.performance.now() + EDGE_EXIT_DELAY_MS;
          },
        });

        return;
      }

      if (direction < 0 && activeIndex === 0) {
        if (now < edgeExitAfterRef.current) {
          event.preventDefault();
          event.stopPropagation();
        }

        return;
      }

      if (direction > 0 && activeIndex === totalCards - 1) {
        if (now < edgeExitAfterRef.current) {
          event.preventDefault();
          event.stopPropagation();
        }

        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (now - lastWheelAtRef.current < WHEEL_COOLDOWN_MS) {
        return;
      }

      lastWheelAtRef.current = now;
      const nextIndex = activeIndex + direction;

      if (nextIndex === 0 || nextIndex === totalCards - 1) {
        edgeExitAfterRef.current = now + EDGE_EXIT_DELAY_MS;
      }

      goBy(direction);
    };

    window.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      cancelSectionSnapRef.current?.();
    };
  }, [activeCard, activeIndex, goBy, totalCards]);

  const handleCardClick = (card: HeroVideoCard, index: number) => {
    if (index !== activeIndex) {
      goToCard(index);
      return;
    }

    setActiveCard(card);
  };

  if (totalCards === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={carouselRef}
        className="relative ml-[calc(50%_-_50vw)] mt-[clamp(28px,calc((56/1920)*100vw),56px)] h-[clamp(300px,calc((560/1920)*100vw),560px)] w-screen self-start touch-pan-y overflow-visible"
        aria-label="Making film carousel"
      >
        {visibleCards.map((card, index) => {
          const offset = getCardOffset(index, activeIndex, totalCards);
          const distance = Math.abs(offset);
          const isVisible = distance <= 2;
          const isActive = index === activeIndex;
          const translateX =
            offset === 0 ? 0 : Math.sign(offset) * (distance === 1 ? sideStep : farStep);

          return (
            <motion.div
              key={card.id}
              initial={false}
              animate={{
                x: translateX,
                scale: distance === 0 ? 1 : distance === 1 ? 0.74 : 0.54,
                opacity: isVisible ? (distance === 2 ? 0.66 : 1) : 0,
                zIndex: 10 - distance,
                filter: distance === 0 ? "brightness(1)" : "brightness(0.72)",
              }}
              transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-1/2 w-[min(76vw,360px)] [translate:-50%_-50%] md:w-[min(42vw,640px)]"
              style={{ pointerEvents: isVisible ? "auto" : "none" }}
            >
              <button
                type="button"
                aria-label={`${card.title} video`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  handleCardClick(card, index);
                }}
                className="group relative block aspect-[335/188] w-full overflow-hidden rounded-[8px] border border-[#16161A] bg-[#17171A] text-left shadow-[0_24px_68px_rgba(0,0,0,0.42)] outline-none transition focus-visible:ring-2 focus-visible:ring-white/70 md:aspect-[523/293]"
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
                {isActive ? (
                  <span className="absolute left-1/2 top-1/2 inline-flex h-[39px] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/45 bg-white/20 px-5 text-[13px] font-medium text-white opacity-0 shadow-[0_12px_36px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Play
                      aria-hidden="true"
                      size={14}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                    지금 재생하기
                  </span>
                ) : null}
              </button>
            </motion.div>
          );
        })}
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
