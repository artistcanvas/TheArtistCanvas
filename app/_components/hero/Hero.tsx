"use client";

import Image from "next/image";
import MainLogo from "@/public/imgs/tac-main-logo.png";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const Hero = () => {
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);

  return (
    <div
      id="hero"
      className="relative h-svh min-h-[640px] w-full overflow-hidden px-5 md:px-0"
    >
      <div className="absolute left-1/2 top-1/2 flex w-full max-w-[1920px] -translate-x-1/2 -translate-y-1/2 flex-col items-end gap-[clamp(72px,calc((249/1920)*100vw),249px)] px-5 md:flex-row md:items-center md:justify-between md:gap-10 md:px-0 md:pl-[90px] md:pr-[clamp(90px,calc((201/1920)*100vw),201px)]">
        <div className="relative mx-auto w-full shrink md:mx-0 md:w-[min(100%,clamp(335px,calc((922/1920)*100vw),922px))]">
          <div className="relative mx-auto aspect-[922/356] w-full">
            <Image
              width={922}
              height={356}
              src={MainLogo}
              alt="Main logo"
              sizes="(max-width: 768px) calc(100vw - 40px), clamp(335px, calc((922 / 1920) * 100vw), 922px)"
              preload
              onLoad={() => setIsLogoLoaded(true)}
              className="relative z-10 h-auto w-full"
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 z-0 ${
                isLogoLoaded ? "hero-drops-ready" : ""
              }`}
            >
              <span className="hero-purple-drop absolute left-[66.22%] top-[1.8%] block h-[14.3%] w-[5.65%] rounded-br-full rounded-tl-full rounded-tr-full bg-[#9456FF]" />
              <span className="hero-peach-drop absolute left-[24.75%] top-[82.05%] block h-[11%] w-[4.7%] rounded-bl-full rounded-br-full rounded-tl-full" />
            </div>
          </div>
          <p className="mx-auto mt-[clamp(28px,calc((60/1920)*100vw),60px)] max-w-full text-center text-[clamp(16px,calc((60/1920)*100vw),60px)] font-semibold leading-none text-white md:ml-0">
            상상은 현실이 된다
          </p>
        </div>
        <div className="mx-auto flex w-full flex-col items-end space-y-[clamp(17px,calc((60/1920)*100vw),60px)] md:mx-0 md:w-auto md:items-start md:h-full md:justify-center">
          <p className="text-nowrap text-end text-[clamp(16px,calc((25/1920)*100vw),25px)] font-light text-[#9D9D9D] md:text-start">
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

      <div className="absolute bottom-[5%] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-[clamp(18px,calc((60/1920)*100vw),60px)] md:flex">
        <div className="flex h-12 w-16 flex-col items-center justify-between">
          <p className="text-[14px] tracking-[2.24px] text-white">스크롤</p>
          <ChevronDown
            aria-hidden="true"
            size={32}
            strokeWidth={1.8}
            className="scroll-chevron-bounce animate-[scroll-chevron-bounce_2.5s_ease-in-out_infinite] text-white"
          />
        </div>
      </div>
    </div>
  );
};
