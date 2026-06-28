import Image from "next/image";
import { ReactNode } from "react";
import BgRadialGradient from "@/public/imgs/bg-radial-gradient.png";

export default function SectionHeading({
  title,
  des,
}: {
  title: string;
  des?: ReactNode;
}) {
  return (
    <div className="relative isolate flex flex-col pb-[44px] md:pb-[clamp(44px,calc((65/1920)*100vw),65px)] md:flex-row md:justify-between md:items-end">
      <Image
        src={BgRadialGradient}
        alt=""
        aria-hidden="true"
        priority
        className="pointer-events-none absolute left-[30%] top-1/2 z-0 h-auto w-max -translate-x-1/2 -translate-y-1/2 select-none md:w-[clamp(520px,calc((690/1920)*100vw),690px)]"
      />
      <h1 className="relative z-10 text-[clamp(65px,calc((136/1920)*100vw),136px)] font-black pb-[42px] md:pb-0">
        {title}
      </h1>
      <p className="relative z-10 font-medium md:font-semibold md:text-end text-[clamp(12px,calc((14/1920)*100vw),14px)] text-[#5B5A62]">
        {des}
      </p>
    </div>
  );
}
