"use client";

import HowToCard from "./HowToCard";
import type { HeroVideoCard } from "./heroVideoCardTypes";

type HowToCardContainerProps = {
  cards: HeroVideoCard[];
};

export default function HowToCardContainer({ cards }: HowToCardContainerProps) {
  return (
    <section
      id="how-to-card-container"
      className="relative flex justify-center overflow-hidden py-[clamp(96px,calc((150/1920)*100vw),150px)]"
    >
      <div className="w-full max-w-[1920px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
        <div className="relative flex flex-col items-center">
          <div className="mx-auto max-w-[780px] text-center">
            <h3 className="text-[clamp(24px,calc((30/1920)*100vw),30px)] font-medium">
              MAKING FILM <span className="font-light">(제작 과정)</span>
            </h3>

            <p className="mt-[clamp(22px,calc((30/1920)*100vw),30px)] text-[clamp(14px,calc((20/1920)*100vw),20px)] font-light leading-8 text-white md:leading-9">
              <strong className="font-medium">
                우리는 사람에게서 이야기를 찾습니다.
              </strong>
              <br />
              아티스트가 가진 매력과 개성을 발견하고
              <br className="hidden md:block" />
              그 사람만이 보여줄 수 있는 콘텐츠를 기획하고 제작합니다.
            </p>
          </div>

          <HowToCard cards={cards} />
        </div>
      </div>
    </section>
  );
}
