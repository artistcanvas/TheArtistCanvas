"use client";

import { ArrowUpRight } from "lucide-react";
import type { ArtistProfile } from "./Artist";

export default function ArtistVideoCard({ artist }: { artist: ArtistProfile }) {
  const cardContent = (
    <>
      <div className="relative aspect-[335/335] overflow-hidden bg-[#101014] md:aspect-[302/347]">
        {artist.profileImageUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
            style={{ backgroundImage: `url(${artist.profileImageUrl})` }}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(145deg,#28282B_0%,#202025_27%,#101014_66%,#050506_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(255,255,255,0.12),transparent_21%),linear-gradient(116deg,rgba(255,255,255,0.045)_0%,transparent_31%,rgba(255,255,255,0.025)_60%,transparent_100%)]" />
          </>
        )}
        <div className="absolute inset-x-0 bottom-0 h-[37%] bg-gradient-to-t from-black via-black/54 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100" />

        {artist.youtubeUrl ? (
          <span className="absolute bottom-[27px] left-[20px] flex translate-y-[6px] items-center gap-[4px] text-[11px] font-bold text-[#8D4CFF] opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:bottom-[31px] md:left-[20px] md:text-[clamp(11px,calc((12/1920)*100vw),12px)]">
            VIDEO
            <ArrowUpRight aria-hidden="true" size={10} strokeWidth={2.4} />
          </span>
        ) : null}
      </div>

      <div className="bg-[#111113] px-[20px] pb-[17px] pt-[16px] md:px-[20px] md:pb-[18px] md:pt-[18px]">
        <h3 className="text-[14px] font-bold leading-none text-white md:text-[12px]">
          {artist.name}
        </h3>
        <p className="mt-[8px] text-[10px] font-bold leading-none text-[#5B5A62] md:text-[9px]">
          WITH
        </p>
      </div>
    </>
  );

  if (!artist.youtubeUrl) {
    return (
      <div className="group block w-full overflow-hidden rounded-[6px] bg-[#09090B] text-left">
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
      className="group block w-full overflow-hidden rounded-[6px] bg-[#09090B] text-left focus:outline-none focus:ring-2 focus:ring-white/50"
    >
      {cardContent}
    </a>
  );
}
