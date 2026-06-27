"use client";
import { useEffect, useRef, useState } from "react";
import AnimatedQuote from "./AnimatedQuote";
import HowToCard from "./HowToCard";
import ProgressLine from "./ProgressLine";

const LINE_DRAW_DURATION = 1000;

export default function HowTo() {
  const lineTrackRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const [isLineActive, setIsLineActive] = useState(false);
  const [isLineComplete, setIsLineComplete] = useState(false);

  useEffect(() => {
    if (!lineTrackRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasStartedRef.current) return;

        hasStartedRef.current = true;
        setIsLineActive(true);

        const startY = window.scrollY;
        const lineTrackTop =
          lineTrackRef.current!.getBoundingClientRect().top + window.scrollY;
        const lineTrackHeight = lineTrackRef.current!.offsetHeight + 20;
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
          }
        };

        scrollAnimationFrameRef.current =
          window.requestAnimationFrame(animateScroll);
      },
      {
        rootMargin: "0px 0px -10px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(lineTrackRef.current);

    return () => {
      observer.disconnect();

      if (scrollAnimationFrameRef.current) {
        window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
    };
  }, []);

  return (
    <section
      id="works"
      className="relative min-h-[2200px] flex justify-center overflow-hidden py-28"
    >
      <div className="w-[1580px]">
        <h2 className="text-[56px] text-start font-black leading-none tracking-[-0.04em] md:text-[120px] lg:text-[150px]">
          HOW TO?
        </h2>

        <div className="mt-28 md:mt-[158px] flex justify-end">
          <AnimatedQuote />
        </div>

        <div className="relative mt-80 grid gap-20 md:mt-[520px] md:min-h-[1510px] md:grid-cols-[1fr_1fr] md:items-end">
          <div
            ref={lineTrackRef}
            className="relative min-h-[1200px] pl-10 md:min-h-[1510px] md:pl-[50px]"
          >
            <ProgressLine
              isActive={isLineActive}
              duration={LINE_DRAW_DURATION / 1000}
              onComplete={() => setIsLineComplete(true)}
            />

            <div className="absolute bottom-0 left-10 md:left-[50px]">
              <h3 className="text-2xl font-semibold md:text-3xl">
                How We Create
              </h3>

              <p className="mt-8 text-base leading-8 text-white md:text-xl md:leading-9">
                <strong className="font-semibold">
                  우리는 사람에게서 이야기를 찾습니다.
                </strong>
                <br />
                아티스트가 가진 매력과 개성을 발견하고
                <br />그 사람만이 보여줄 수 있는 콘텐츠를 기획하고 제작합니다.
              </p>
            </div>
          </div>

          <HowToCard shouldReveal={isLineComplete} />
        </div>
      </div>
    </section>
  );
}
