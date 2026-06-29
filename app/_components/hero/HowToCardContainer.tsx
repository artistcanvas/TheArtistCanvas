"use client";

import { useRef } from "react";
import HowToCard from "./HowToCard";
import ProgressLine from "./ProgressLine";
import useProgressLineFollow from "./useProgressLineFollow";

export default function HowToCardContainer() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineTrackRef = useRef<HTMLDivElement>(null);
  const {
    durationSeconds,
    isLineActive,
    isLineComplete,
    setIsLineComplete,
  } = useProgressLineFollow({ lineTrackRef });

  return (
    <section
      ref={sectionRef}
      id="how-to-card-container"
      className="relative flex justify-center overflow-hidden pb-[clamp(120px,calc((206/1920)*100vw),206px)] pt-[clamp(96px,calc((170/1920)*100vw),170px)]"
    >
      <div className="w-full max-w-[1920px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
        <div className="relative grid gap-[36px] md:min-h-[1510px] md:grid-cols-[1fr_1fr] md:items-end md:gap-20">
          <div
            ref={lineTrackRef}
            className="relative mx-auto w-full md:mx-0 md:min-h-[1441px] md:w-auto md:pl-[50px]"
          >
            <ProgressLine
              isActive={isLineActive}
              duration={durationSeconds}
              onComplete={() => setIsLineComplete(true)}
            />

            <div className="md:absolute md:bottom-0 md:left-[50px]">
              <h3 className="text-[clamp(24px,calc((30/1920)*100vw),30px)] font-medium">
                How We Create
              </h3>

              <p className="mt-[clamp(27px,calc((35/1920)*100vw),35px)] text-[clamp(14px,calc((20/1920)*100vw),20px)] font-light leading-8 text-white md:leading-9">
                <strong className="font-medium">
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
