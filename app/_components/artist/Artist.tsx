"use client";

import { useMemo, useState } from "react";
import SectionHeading from "../layout/SectionHeading";
import ArtistCard from "./ArtistCard";
import ArtistVideoCard from "./ArtistVideoCard";
import { fallbackArtistsData } from "./artistFallbackData";

export type ArtistTab = "WITH" | "MCN";
export type LegacyArtistRole = "CREATOR" | "SINGER" | "ACTOR";
export type ArtistRole = ArtistTab | LegacyArtistRole;

export type ArtistProfile = {
  id?: string;
  name: string;
  role: ArtistRole;
  profileImageUrl?: string | null;
  birthDate?: string;
  height?: string;
  education?: string;
  youtubeUrl?: string;
  careers: string[];
  isFeatured?: boolean;
};

const tabs: ArtistTab[] = ["WITH", "MCN"];

export default function Artist({
  artistsData = fallbackArtistsData,
}: {
  artistsData?: Record<ArtistTab, ArtistProfile[]>;
}) {
  const [activeTab, setActiveTab] = useState<ArtistTab>("WITH");
  const artists = useMemo(
    () => artistsData[activeTab],
    [activeTab, artistsData],
  );
  const artistCountLabel = `${artists.length} ${activeTab}`;

  return (
    <div className="mx-auto w-full max-w-[1920px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
      <SectionHeading
        title="ARTIST"
        des={
          <>
            아티스트캔버스와 함께한
            <br />
            크리에이터, 가수, 배우들을 소개합니다
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
          {artists.map((artist, index) => {
            const key = artist.id ?? `${artist.role}-${artist.name}-${index}`;

            return activeTab === "WITH" ? (
              <ArtistVideoCard key={key} artist={artist} />
            ) : (
              <ArtistCard key={key} artist={artist} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
