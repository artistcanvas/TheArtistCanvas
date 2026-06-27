"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const MD_BREAKPOINT = 768;
const MOBILE_CARD_WIDTH = 335;
const MOBILE_CARD_HEIGHT = 188;
const MOBILE_CARD_GAP = 16;
const DESKTOP_CARD_STEP_PERCENT = 33.78;
const DESKTOP_HIDDEN_TOP_PERCENT = 67.55;

const cards = [
  {
    src: "",
    alt: "Off shot card",
    backgroundColor: "#26242A",
    borderColor: "#3A3841",
  },
  {
    src: "",
    alt: "Making film card",
    backgroundColor: "#20262E",
    borderColor: "#343D49",
  },
  {
    src: "",
    alt: "Making film card",
    backgroundColor: "#30242A",
    borderColor: "#46343D",
  },
];

type HowToCardProps = {
  shouldReveal: boolean;
};

export default function HowToCard({ shouldReveal }: HowToCardProps) {
  const stackRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [cardWidth, setCardWidth] = useState(MOBILE_CARD_WIDTH);

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

  const mobileCardHeight =
    (cardWidth / MOBILE_CARD_WIDTH) * MOBILE_CARD_HEIGHT;
  const mobileCardStep = mobileCardHeight + MOBILE_CARD_GAP;
  const mobileStackHeight = mobileCardHeight * cards.length + MOBILE_CARD_GAP * 2;
  const cardStepPercent = isDesktop
    ? DESKTOP_CARD_STEP_PERCENT
    : mobileCardStep;
  const hiddenTopPercent = isDesktop
    ? DESKTOP_HIDDEN_TOP_PERCENT
    : mobileCardStep * 2;
  const shouldShowCards = !isDesktop || shouldReveal;

  return (
    <div className="flex w-full self-end justify-center md:justify-end">
      <motion.div
        ref={stackRef}
        initial="hidden"
        animate={shouldShowCards ? "show" : "hidden"}
        style={{ height: isDesktop ? undefined : mobileStackHeight }}
        className="relative w-full md:aspect-[523/894] md:max-w-[523px]"
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: {
                top: `${hiddenTopPercent}${isDesktop ? "%" : "px"}`,
                zIndex: cards.length - index,
              },
              show: {
                top: `${index * cardStepPercent}${isDesktop ? "%" : "px"}`,
                zIndex: cards.length - index,
                transition: {
                  duration: isDesktop ? 0.9 : 0,
                  delay: isDesktop ? 0.1 + index * 0.08 : 0,
                  ease: [0.1, 1, 0.36, 1],
                },
              },
            }}
            className="absolute left-0 w-full"
          >
            {card.src ? (
              <Image
                src={card.src}
                alt={card.alt}
                width={523}
                height={293}
                className="aspect-[335/188] w-full rounded-lg border border-zinc-900 object-cover md:aspect-[523/293]"
              />
            ) : (
              <div
                style={{
                  backgroundColor: card.backgroundColor,
                  borderColor: card.borderColor,
                }}
                className="flex aspect-[335/188] w-full items-center justify-center rounded-lg border md:aspect-[523/293]"
              >
                <span className="text-sm font-semibold tracking-wide text-zinc-300">
                  Example Card
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
