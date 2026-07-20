"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
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
  youtubeChannelName?: string;
  careers: string[];
  isFeatured?: boolean;
};

const tabs: ArtistTab[] = ["WITH", "MCN"];
const withArtistsPerPage = 20;

export default function Artist({
  artistsData = fallbackArtistsData,
}: {
  artistsData?: Record<ArtistTab, ArtistProfile[]>;
}) {
  const [activeTab, setActiveTab] = useState<ArtistTab>("WITH");
  const [withPage, setWithPage] = useState(1);
  const artists = useMemo(
    () => artistsData[activeTab],
    [activeTab, artistsData],
  );
  const withTotalPages = Math.max(
    1,
    Math.ceil((artistsData.WITH?.length ?? 0) / withArtistsPerPage),
  );
  const currentWithPage = Math.min(withPage, withTotalPages);
  const visibleArtists = useMemo(() => {
    if (activeTab !== "WITH") {
      return artists;
    }

    const startIndex = (currentWithPage - 1) * withArtistsPerPage;

    return artists.slice(startIndex, startIndex + withArtistsPerPage);
  }, [activeTab, artists, currentWithPage]);
  const artistCountLabel = `${artists.length} ${activeTab}`;
  const hasWithPagination = activeTab === "WITH" && withTotalPages > 1;
  const canGoPrev = currentWithPage > 1;
  const canGoNext = currentWithPage < withTotalPages;

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

        <div
          className={`mt-[12px] grid grid-cols-1 gap-[10px] md:mt-[35px] md:grid-cols-2 md:gap-x-[36px] ${
            activeTab === "WITH"
              ? "md:gap-y-[36px] xl:grid-cols-5"
              : "md:gap-y-[38px] xl:grid-cols-4"
          }`}
        >
          {visibleArtists.map((artist, index) => {
            const key = artist.id ?? `${artist.role}-${artist.name}-${index}`;

            return activeTab === "WITH" ? (
              <ArtistVideoCard key={key} artist={artist} />
            ) : (
              <ArtistCard key={key} artist={artist} />
            );
          })}
        </div>

        {hasWithPagination ? (
          <nav
            aria-label="With artist pagination"
            className="mt-[55px] flex items-center justify-center gap-[26px] md:mt-[57px]"
          >
            <button
              type="button"
              aria-label="Previous With artists page"
              onClick={() => setWithPage((page) => Math.max(1, page - 1))}
              disabled={!canGoPrev}
              className={`flex size-[22px] items-center justify-center transition-colors ${
                canGoPrev ? "text-white hover:text-[#B993FF]" : "text-[#3A393F]"
              }`}
            >
              <ChevronLeft aria-hidden="true" size={25} strokeWidth={3} />
            </button>

            <div className="flex min-w-[90px] items-center justify-center gap-[18px] text-[16px] font-bold leading-none">
              <span className="text-white">{currentWithPage}</span>
              <span className="text-white">/</span>
              <span className="text-[#3A393F]">{withTotalPages}</span>
            </div>

            <button
              type="button"
              aria-label="Next With artists page"
              onClick={() =>
                setWithPage((page) => Math.min(withTotalPages, page + 1))
              }
              disabled={!canGoNext}
              className={`flex size-[22px] items-center justify-center transition-colors ${
                canGoNext ? "text-white hover:text-[#B993FF]" : "text-[#3A393F]"
              }`}
            >
              <ChevronRight aria-hidden="true" size={25} strokeWidth={3} />
            </button>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
