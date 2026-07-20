"use client";

import { ArrowUpRight } from "lucide-react";
import type { ArtistProfile } from "./Artist";

function formatInfo(info: string) {
  return info.replace(/\s+및\s+/g, " · ").replace(/\s*·\s*/g, " · ").trim();
}

export default function ArtistVideoCard({ artist }: { artist: ArtistProfile }) {
  const info = formatInfo(
    artist.youtubeChannelName ?? artist.careers[0] ?? "YouTube"
  );

  const cardContent = (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,13,15,0.96)_0%,rgba(5,5,7,0.99)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-[#171719] to-transparent" />
      </div>

      <div className="relative z-10 flex h-full min-h-[88px] flex-col justify-center px-[20px] py-[18px] md:min-h-[88px]">
        <h3 className="max-w-[calc(100%-82px)] truncate text-[15px] font-bold leading-none text-[#E9E8ED] transition-colors duration-200 group-hover:text-[#3B3940] group-focus-visible:text-[#3B3940] md:text-[clamp(14px,calc((16/1920)*100vw),16px)]">
          {artist.name}
        </h3>
        <p className="mt-[12px] max-w-[calc(100%-82px)] truncate text-[12px] font-bold leading-none text-[#55545B] transition-colors duration-200 group-hover:text-[#242329] group-focus-visible:text-[#242329] md:text-[clamp(11px,calc((12/1920)*100vw),12px)]">
          {info}
        </p>
      </div>

      {artist.youtubeUrl ? (
        <span className="absolute right-[18px] top-[22px] z-10 flex translate-y-[4px] items-center gap-[4px] text-[11px] font-bold tracking-[1.3px] text-[#8D4CFF] opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:text-[clamp(11px,calc((12/1920)*100vw),12px)]">
          VIDEO
          <ArrowUpRight aria-hidden="true" size={12} strokeWidth={2.4} />
        </span>
      ) : null}
    </>
  );

  if (!artist.youtubeUrl) {
    return (
      <div className="group relative block w-full overflow-hidden rounded-[8px] bg-[#18181A] text-left">
        {cardContent}
      </div>
    );
  }

  return (
    <a
      href={artist.youtubeUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={`${artist.name} video`}
      className="group relative block w-full overflow-hidden rounded-[8px] bg-[#18181A] text-left transition-colors duration-200 hover:bg-[#111113] focus:outline-none focus:ring-2 focus:ring-white/50"
    >
      {cardContent}
    </a>
  );
}
