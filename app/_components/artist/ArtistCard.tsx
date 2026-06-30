"use client";

import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ArtistProfile } from "./Artist";

const infoRows: Array<{
  label: string;
  getValue: (artist: ArtistProfile) => string | undefined;
}> = [
  { label: "생년월일", getValue: (artist) => artist.birthDate },
  { label: "키", getValue: (artist) => artist.height },
  { label: "학력", getValue: (artist) => artist.education },
];

export default function ArtistCard({ artist }: { artist: ArtistProfile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <>
      <button
        type="button"
        aria-label={`${artist.name} 프로필 보기`}
        onClick={() => setIsModalOpen(true)}
        className="group block w-full overflow-hidden rounded-[6px] bg-[#09090B] text-left"
      >
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

          <span className="absolute bottom-[27px] left-[20px] flex translate-y-[6px] items-center gap-[4px] text-[11px] font-bold text-[#8D4CFF] opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:bottom-[31px] md:left-[20px] md:text-[clamp(11px,calc((12/1920)*100vw),12px)]">
            프로필 보기
            <ArrowUpRight aria-hidden="true" size={10} strokeWidth={2.4} />
          </span>
        </div>

        <div className="bg-[#111113] px-[20px] pb-[17px] pt-[16px] md:px-[20px] md:pb-[18px] md:pt-[18px]">
          <h3 className="text-[14px] font-bold leading-none text-white md:text-[12px]">
            {artist.name}
          </h3>
          <p className="mt-[8px] text-[10px] font-bold leading-none text-[#5B5A62] md:text-[9px]">
            {artist.role}
          </p>
        </div>
      </button>

      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${artist.name} 프로필`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 px-5 py-8 backdrop-blur-[10px]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative grid w-full md:w-[1131px] md:max-w-[calc(100vw-40px)] overflow-hidden rounded-[8px] border border-white/10 bg-[#080809] shadow-[0_28px_90px_rgba(0,0,0,0.62)] md:grid-cols-[47.5%_52.5%]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative h-[383px] bg-[#151518] md:h-[660px]">
              {artist.profileImageUrl ? (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${artist.profileImageUrl})` }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[linear-gradient(145deg,#2A2A2D_0%,#202024_35%,#111114_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_28%,rgba(255,255,255,0.11),transparent_22%),linear-gradient(118deg,rgba(255,255,255,0.055)_0%,transparent_33%,rgba(255,255,255,0.025)_65%,transparent_100%)]" />
                </>
              )}
            </div>

            <div className="relative px-[22px] py-[28px] md:px-[21px] md:py-[31px]">
              <button
                type="button"
                aria-label="프로필 닫기"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-[14px] top-[14px] flex size-[25px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-[#85838B] transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X aria-hidden="true" size={14} strokeWidth={2} />
              </button>

              <p className="text-[12px] md:text-[clamp(12px,calc((14/1920)*100vw),14px)] font-semibold uppercase tracking-[3px] text-[#8D4CFF]">
                {artist.role}
              </p>
              <h2 className="mt-[10px] text-[32px] md:text-[clamp(32px,calc((45/1920)*100vw),45px)] font-bold leading-none text-white md:text-[25px]">
                {artist.name}
              </h2>

              <dl className="mt-[26px] border-t border-white/[0.06]">
                {infoRows.map((row) => {
                  const value = row.getValue(artist);

                  if (!value) {
                    return null;
                  }

                  return (
                    <div
                      key={row.label}
                      className="grid items-center grid-cols-[90px_minmax(0,1fr)] border-b border-white/[0.06] py-[12px] leading-none"
                    >
                      <dt className="font-semibold text-[#5B5A62] tracking-[2.39px] text-[12px] md:text-[clamp(12px,calc((14/1920)*100vw),14px)]">
                        {row.label}
                      </dt>
                      <dd className="font-light text-[#9A99A2] text-[14px] md:text-[clamp(14px,calc((18/1920)*100vw),18px)]">
                        {value}
                      </dd>
                    </div>
                  );
                })}

                {artist.youtubeUrl ? (
                  <div className="grid grid-cols-[90px_minmax(0,1fr)] border-b border-white/[0.06] py-[12px] leading-none">
                    <dt className="font-semibold text-[#5B5A62] tracking-[2.39px] text-[12px] md:text-[clamp(12px,calc((14/1920)*100vw),14px)]">
                      유튜브
                    </dt>
                    <dd>
                      <a
                        href={artist.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-[4px] font-light text-[#8D4CFF] transition text-[14px] md:text-[clamp(14px,calc((18/1920)*100vw),18px)] hover:text-[#B993FF]"
                      >
                        영상 보러가기
                        <ArrowUpRight
                          aria-hidden="true"
                          size={20}
                          strokeWidth={2}
                        />
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>

              {artist.careers.length > 0 ? (
                <div className="mt-[24px]">
                  <h3 className="font-semibold text-[#5B5A62] tracking-[2.39px] text-[12px] md:text-[clamp(12px,calc((14/1920)*100vw),14px)]">
                    주요 경력
                  </h3>
                  <ul className="mt-[14px] space-y-[9px] font-light text-[#9A99A2] text-[14px] md:text-[clamp(14px,calc((18/1920)*100vw),18px)]">
                    {artist.careers.map((career) => (
                      <li
                        key={career}
                        className="ml-2 flex gap-[7px] items-center"
                      >
                        <span
                          aria-hidden="true"
                          className="size-[4px] shrink-0 rounded-full bg-[#A6A4AD]"
                        />
                        <span>{career}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
