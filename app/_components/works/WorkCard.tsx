import { ArrowUpRight } from "lucide-react";
import type { Work } from "./Works";

export default function WorkCard({ work }: { work: Work }) {
  return (
    <article className="group overflow-hidden rounded-[6px] bg-[#111113]">
      <div className="relative aspect-[335/190] overflow-hidden bg-[#101014] md:aspect-[302/168]">
        <div className="absolute inset-0 bg-[linear-gradient(116deg,#222127_0%,#17171b_42%,#08080a_72%,#050506_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(58deg,transparent_0%,transparent_43%,rgba(255,255,255,0.045)_44%,rgba(255,255,255,0.01)_62%,transparent_63%)]" />
        {work.isFeatured ? (
          <span className="absolute right-[14px] top-[14px] rounded-full bg-[#8D4CFF] px-[9px] py-[4px] text-[9px] font-bold text-white md:right-[12px] md:top-[12px] md:px-[8px] md:py-[3px] md:text-[8px]">
            MAKING FILM
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between bg-[#151517] px-[20px] py-[14px] md:px-[16px] md:py-[13px]">
        <div>
          <h3 className="text-[14px] font-bold text-white md:text-[12px]">
            {work.title}
          </h3>
          <p className="mt-[5px] text-[11px] font-bold text-[#5B5A62] md:text-[9px]">
            {work.type} · {work.year}
          </p>
        </div>

        <button
          type="button"
          aria-label={`${work.title} 자세히 보기`}
          className="flex size-[22px] items-center justify-center text-[#5B5A62] transition-colors group-hover:text-[#8D4CFF] md:size-[18px]"
        >
          <ArrowUpRight aria-hidden="true" size={13} strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}
