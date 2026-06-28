import { ArrowUpRight } from "lucide-react";
import type { ArtistProfile } from "./Artist";

export default function ArtistCard({ artist }: { artist: ArtistProfile }) {
  return (
    <article className="group overflow-hidden rounded-[6px] bg-[#09090B]">
      <div className="relative aspect-[335/335] overflow-hidden bg-[#101014] md:aspect-[302/347]">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,#28282B_0%,#202025_27%,#101014_66%,#050506_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(255,255,255,0.12),transparent_21%),linear-gradient(116deg,rgba(255,255,255,0.045)_0%,transparent_31%,rgba(255,255,255,0.025)_60%,transparent_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[37%] bg-gradient-to-t from-black via-black/54 to-transparent" />

        {artist.isFeatured ? (
          <button
            type="button"
            aria-label={`${artist.name} 프로필 보기`}
            className="absolute bottom-[27px] left-[20px] flex items-center gap-[4px] text-[10px] font-bold text-[#8D4CFF] transition-colors group-hover:text-white md:bottom-[31px] md:left-[20px] md:text-[9px]"
          >
            프로필 보기
            <ArrowUpRight aria-hidden="true" size={10} strokeWidth={2.4} />
          </button>
        ) : null}
      </div>

      <div className="bg-[#111113] px-[20px] pb-[17px] pt-[16px] md:px-[20px] md:pb-[18px] md:pt-[18px]">
        <h3 className="text-[14px] font-bold leading-none text-white md:text-[12px]">
          {artist.name}
        </h3>
        <p className="mt-[8px] text-[10px] font-bold leading-none text-[#5B5A62] md:text-[9px]">
          {artist.role}
        </p>
      </div>
    </article>
  );
}
