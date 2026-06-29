"use client";

import Image from "next/image";
import MainLogo from "@/public/imgs/tac-main-logo.png";
import Link from "next/link";
import { useState } from "react";

export const Hero = () => {
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  return (
    <div className="pb-[56px] pt-[128px] md:pb-15 min-[1921px]:pb-[calc((56/1920)*100vw)] flex flex-col gap-11 items-center justify-end w-full h-svh min-h-max">
      <div className="flex flex-col items-end gap-[249px] w-full h-full max-w-[1920px] md:justify-between md:gap-10 px-5 md:flex-row md:pl-[90px] md:pr-[clamp(90px,calc((201/1920)*100vw),201px)] md:h-auto">
        <div className="relative mx-auto w-full shrink aspect-[922/356] md:mx-0 md:w-[min(100%,clamp(335px,calc((922/1920)*100vw),922px))]">
          <Image
            width={922}
            height={356}
            src={MainLogo}
            alt="Main logo"
            sizes="(max-width: 768px) calc(100vw - 40px), clamp(335px, calc((922 / 1920) * 100vw), 922px)"
            preload
            onLoad={() => setIsLogoLoaded(true)}
            className="relative z-10 w-full h-auto"
          />
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-0 ${
              isLogoLoaded ? "hero-drops-ready" : ""
            }`}
          >
            <span className="hero-purple-drop absolute left-[66.22%] top-[1.8%] block h-[14.3%] w-[5.65%] rounded-tr-full rounded-br-full rounded-tl-full bg-[#9456FF]" />
            <span className="hero-peach-drop absolute left-[24.75%] top-[82.05%] block h-[11%] w-[4.7%] rounded-bl-full rounded-br-full rounded-tl-full" />
          </div>
        </div>
        <div className="mx-auto flex w-full flex-col items-end space-y-[clamp(17px,calc((60/1920)*100vw),60px)] md:mx-0 md:w-auto md:items-start">
          <p className="text-end text-[clamp(16px,calc((25/1920)*100vw),25px)] font-light text-nowrap text-[#9D9D9D] md:text-start">
            아티스트가 머무는 곳
            <br />
            그들의 이야기가 시작되는 곳
          </p>
          <div className="w-max border-b border-[#5B5A62] pb-[10px]">
            <Link
              href="/work"
              className="inline-flex items-center gap-[8px] text-[clamp(14px,calc((20/1920)*100vw),20px)] font-medium transition-[gap] duration-300 ease-out sm:hover:gap-[18px]"
            >
              <span className="md:tracking-[2.24px]">WORKS 보기</span>
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-col items-center justify-between w-16 h-28">
        <div className="scroll-line-grow w-[2px] h-[79px] origin-top bg-[linear-gradient(180deg,transparent_0%,#3A393F_100%)] animate-[scroll-line-grow_1.2s_ease-out_infinite]" />
        <p className="text-[14px] tracking-[2.24px] text-[#3A393F]">SCROLL</p>
      </div>
    </div>
  );
};
