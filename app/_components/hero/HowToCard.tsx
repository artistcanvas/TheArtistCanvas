"use client";

import { motion } from "framer-motion";
import Image from "next/image";

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
  return (
    <div className="flex w-full self-end justify-center md:justify-end">
      <motion.div
        initial="hidden"
        animate={shouldReveal ? "show" : "hidden"}
        className="relative aspect-[523/903] w-full max-w-[523px]"
      >
        {cards.map((card, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: {
                top: "67.55%",
                zIndex: cards.length - index,
              },
              show: {
                top: `${index * 33.78}%`,
                zIndex: cards.length - index,
                transition: {
                  duration: 0.9,
                  delay: 0.28 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
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
                className="w-full rounded-lg border border-zinc-900 object-cover"
              />
            ) : (
              <div
                style={{
                  backgroundColor: card.backgroundColor,
                  borderColor: card.borderColor,
                }}
                className="flex aspect-[523/293] w-full items-center justify-center rounded-lg border"
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
