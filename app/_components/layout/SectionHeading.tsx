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
        className="pointer-events-none absolute left-[30%] md:left-[15%] top-[15%] md:top-[30%] z-0 h-auto w-[400px] -translate-x-1/2 -translate-y-1/2 select-none md:w-[clamp(400px,calc((600/1920)*100vw),600px)]"
      />
      <h1 className="leading-none relative z-10 text-[clamp(65px,calc((136/1920)*100vw),136px)] font-black pb-[42px] md:pb-0">
        {title}
      </h1>
      <p className="relative z-10 font-medium md:font-medium md:text-end text-[clamp(12px,calc((16/1920)*100vw),16px)] tracking-[1px]">
        {des}
      </p>
    </div>
  );
}
