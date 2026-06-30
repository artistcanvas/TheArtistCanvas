"use client";

import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Work } from "./workTypes";

function getYouTubeVideoId(youtubeUrl: string) {
  try {
    const url = new URL(youtubeUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (!hostname.endsWith("youtube.com")) {
      return null;
    }

    if (url.pathname === "/watch") {
      return url.searchParams.get("v");
    }

    const [route, videoId] = url.pathname.split("/").filter(Boolean);

    if (["embed", "shorts", "live"].includes(route)) {
      return videoId ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

export default function WorkCard({ work }: { work: Work }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const embedUrl = useMemo(() => {
    const videoId = getYouTubeVideoId(work.youtubeUrl);

    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }, [work.youtubeUrl]);

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

  const cardClassName =
    "group flex h-full w-full flex-col overflow-hidden rounded-[8px] bg-[#111113] p-0 text-left transition-colors duration-300";

  const cardContent = (
    <>
      <div className="relative aspect-video overflow-hidden bg-[#0B0B0D]">
        {work.thumbnailUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
            style={{ backgroundImage: `url(${work.thumbnailUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(116deg,#202026_0%,#151519_42%,#060607_72%,#020203_100%)] transition-opacity duration-300 group-hover:opacity-70" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(58deg,transparent_0%,transparent_43%,rgba(255,255,255,0.04)_44%,rgba(255,255,255,0.01)_62%,transparent_63%)] opacity-70 transition-opacity duration-300 group-hover:opacity-25" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.62)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute right-[14px] top-[14px] flex items-center rounded-full border border-[#9456FF]/50 bg-[#9456FF]/20 px-[clamp(8px,calc((13/1920)*100vw),13px)] pb-[clamp(4px,calc((5.5/1920)*100vw),5.5px)] pt-[clamp(4px,calc((6/1920)*100vw),6px)] text-[clamp(9px,calc((11/1920)*100vw),11px)] font-bold uppercase tracking-[1.1px] text-[#9456FF] opacity-0 shadow-[0_0_18px_rgba(141,76,255,0.18)] transition-opacity duration-300 group-hover:opacity-100 md:right-[12px] md:top-[12px]">
          {work.type}
        </span>
      </div>

      <div className="flex items-start justify-between bg-[#151517] px-[20px] py-[14px] transition-colors duration-300 group-hover:bg-[#111113] md:px-[16px] md:py-[13px]">
        <div className="min-w-0">
          <h3 className="truncate text-[clamp(14px,calc((16/1920)*100vw),16px)] font-semibold leading-tight text-white md:text-[12px]">
            {work.title}
          </h3>
          <p
            aria-hidden={work.description ? undefined : "true"}
            className={`mt-[5.6px] truncate text-[12px] font-medium leading-none tracking-[1.1px] text-[#5B5A62] md:text-[11px] ${
              work.description ? "" : "invisible"
            }`}
          >
            {work.description ?? "Description"}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="flex size-[22px] shrink-0 items-center justify-center text-[#5B5A62] transition-colors duration-300 group-hover:text-[#8D4CFF] md:size-[18px]"
        >
          <ArrowUpRight aria-hidden="true" size={13} strokeWidth={2} />
        </span>
      </div>
    </>
  );

  if (!embedUrl) {
    return (
      <a
        href={work.youtubeUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`${work.title} video`}
        className={cardClassName}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={`${work.title} video`}
        onClick={() => setIsModalOpen(true)}
        className={cardClassName}
      >
        {cardContent}
      </button>

      {isModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={work.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-5 py-8 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-[1100px]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close video"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-0 top-[-46px] flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <X aria-hidden="true" size={18} strokeWidth={2} />
            </button>

            <div className="overflow-hidden rounded-[8px] bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <iframe
                title={work.title}
                src={embedUrl}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
