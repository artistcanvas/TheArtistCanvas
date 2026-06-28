import { ArrowUpRight } from "lucide-react";
import type { Work } from "./Works";

export default function WorkCard({ work }: { work: Work }) {
  return (
    <article className="group overflow-hidden rounded-[8px] bg-[#111113] transition-colors duration-300">
      <div className="relative aspect-[335/190] overflow-hidden bg-[#0B0B0D] md:aspect-[302/168]">
        <div className="absolute inset-0 bg-[linear-gradient(116deg,#202026_0%,#151519_42%,#060607_72%,#020203_100%)] transition-opacity duration-300 group-hover:opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.07),transparent_24%),linear-gradient(58deg,transparent_0%,transparent_43%,rgba(255,255,255,0.04)_44%,rgba(255,255,255,0.01)_62%,transparent_63%)] opacity-70 transition-opacity duration-300 group-hover:opacity-25" />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.62)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="absolute flex items-center tracking-[1.1px] right-[14px] top-[14px] rounded-full border border-[#9456FF]/50 bg-[#9456FF]/20 pb-[clamp(4px,calc((5.5/1920)*100vw),5.5px)] pt-[clamp(4px,calc((6/1920)*100vw),6px)] text-[clamp(9px,calc((11/1920)*100vw),11px)] font-bold text-[#9456FF] opacity-0 shadow-[0_0_18px_rgba(141,76,255,0.18)] transition-opacity duration-300 group-hover:opacity-100 md:right-[12px] md:top-[12px] px-[clamp(8px,calc((13/1920)*100vw),13px)]">
          {work.type}
        </span>
      </div>

      <div className="flex items-start justify-between bg-[#151517] px-[20px] py-[14px] transition-colors duration-300 group-hover:bg-[#111113] md:px-[16px] md:py-[13px]">
        <div>
          <h3 className="text-[clamp(14px,calc((16/1920)*100vw),16px)] font-semibold leading-tight text-white md:text-[12px]">
            {work.title}
          </h3>
          <p className="mt-[5.6px] text-[12px] md:text-[11px] font-medium leading-none tracking-[1.1px] text-[#5B5A62]">
            {work.type} · {work.year}
          </p>
        </div>

        <button
          type="button"
          aria-label={`${work.title} 자세히 보기`}
          className="flex size-[22px] shrink-0 items-center justify-center text-[#5B5A62] transition-colors duration-300 group-hover:text-[#8D4CFF] md:size-[18px]"
        >
          <ArrowUpRight aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}
