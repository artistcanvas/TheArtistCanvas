"use client";

import { useMemo, useState } from "react";
import SectionHeading from "../layout/SectionHeading";
import ArtistCard from "./ArtistCard";

type ArtistTab = "CREATOR" | "SINGER" | "ACTOR";

export type ArtistProfile = {
  name: string;
  role: ArtistTab;
  isFeatured?: boolean;
};

const artistsByTab: Record<ArtistTab, ArtistProfile[]> = {
  CREATOR: [
    { name: "크리에이터 이름", role: "CREATOR" },
    { name: "크리에이터 이름", role: "CREATOR" },
    { name: "크리에이터 이름", role: "CREATOR" },
    { name: "크리에이터 이름", role: "CREATOR", isFeatured: true },
    { name: "크리에이터 이름", role: "CREATOR" },
    { name: "크리에이터 이름", role: "CREATOR" },
    { name: "크리에이터 이름", role: "CREATOR" },
    { name: "크리에이터 이름", role: "CREATOR" },
  ],
  SINGER: [
    { name: "싱어 이름", role: "SINGER" },
    { name: "싱어 이름", role: "SINGER" },
    { name: "싱어 이름", role: "SINGER", isFeatured: true },
    { name: "싱어 이름", role: "SINGER" },
    { name: "싱어 이름", role: "SINGER" },
    { name: "싱어 이름", role: "SINGER" },
    { name: "싱어 이름", role: "SINGER" },
    { name: "싱어 이름", role: "SINGER" },
  ],
  ACTOR: [
    { name: "배우 이름", role: "ACTOR" },
    { name: "배우 이름", role: "ACTOR" },
    { name: "배우 이름", role: "ACTOR" },
    { name: "배우 이름", role: "ACTOR", isFeatured: true },
    { name: "배우 이름", role: "ACTOR" },
    { name: "배우 이름", role: "ACTOR" },
    { name: "배우 이름", role: "ACTOR" },
    { name: "배우 이름", role: "ACTOR" },
  ],
};

const tabs = Object.keys(artistsByTab) as ArtistTab[];

export default function Artist() {
  const [activeTab, setActiveTab] = useState<ArtistTab>("CREATOR");
  const artists = useMemo(() => artistsByTab[activeTab], [activeTab]);
  const artistCountLabel = `${artists.length} ${activeTab}S`;

  return (
    <div className="mx-auto w-full max-w-[1920px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
      <SectionHeading
        title="ARTIST"
        des={
          <>
            아티스트커버스와 함께하는 크리에이터, 가수,
            <br />
            배우들을 소개합니다.
          </>
        }
      />

      <div className="mt-[4px] md:mt-[20px]">
        <div className="flex items-center justify-between border-b border-[#181819]">
          <div
            role="tablist"
            aria-label="Artist categories"
            className="flex gap-[clamp(29px,calc((50/1920)*100vw),50px)] overflow-x-auto md:gap-[46px]"
          >
            {tabs.map((tab) => {
              const isActive = tab === activeTab;

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab)}
                  className={`relative shrink-0 pb-[19px] text-[14px] font-medium tracking-[1.3px] uppercase transition-colors ${
                    isActive
                      ? "text-white"
                      : "text-[#4B4A52] hover:text-[#9A99A2]"
                  }`}
                >
                  {tab}
                  {isActive ? (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="hidden text-[clamp(12px,calc((14/1920)*100vw),14px)] font-semibold tracking-[2.42px] text-[#3A393F] md:block">
            {artistCountLabel}
          </p>
        </div>

        <p className="mt-[23px] text-right text-[12px] font-semibold tracking-[2.08px] text-[#3A393F] md:hidden">
          {artistCountLabel}
        </p>

        <div className="mt-[12px] grid grid-cols-1 gap-[10px] md:mt-[35px] md:grid-cols-2 md:gap-x-[36px] md:gap-y-[38px] xl:grid-cols-4">
          {artists.map((artist, index) => (
            <ArtistCard
              key={`${artist.role}-${artist.name}-${index}`}
              artist={artist}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
