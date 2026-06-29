"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SectionHeading from "../layout/SectionHeading";
import WorkCard from "./WorkCard";
import type { WorksData, WorkTab } from "./workTypes";
import { workTabs } from "./workTypes";

export default function Works({ worksData }: { worksData: WorksData }) {
  const [activeTab, setActiveTab] = useState<WorkTab>("Original");
  const [activeCategoryId, setActiveCategoryId] = useState(
    worksData.Original.categories[0]?.id ?? ""
  );
  const [hasPplOverflow, setHasPplOverflow] = useState(false);
  const [isPplPaused, setIsPplPaused] = useState(false);
  const pplScrollerRef = useRef<HTMLDivElement>(null);
  const pplGroupRef = useRef<HTMLDivElement>(null);

  const categories = worksData[activeTab].categories;
  const works = worksData[activeTab].works;

  const filteredWorks = useMemo(() => {
    if (!activeCategoryId) {
      return works;
    }

    return works.filter((work) => work.categoryId === activeCategoryId);
  }, [activeCategoryId, works]);

  const handleTabChange = (tab: WorkTab) => {
    setActiveTab(tab);
    setActiveCategoryId(worksData[tab].categories[0]?.id ?? "");
  };

  useEffect(() => {
    const scroller = pplScrollerRef.current;
    const group = pplGroupRef.current;

    if (!scroller || !group || activeTab !== "Brand & ppl") {
      setHasPplOverflow(false);
      return;
    }

    const updateOverflow = () => {
      setHasPplOverflow(group.scrollWidth > scroller.clientWidth + 1);
    };

    const animationFrame = requestAnimationFrame(updateOverflow);

    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(scroller);
    resizeObserver.observe(group);
    window.addEventListener("resize", updateOverflow);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [activeTab, worksData.pplPartners.length]);

  return (
    <div className="mx-auto w-full max-w-[1920px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
      <SectionHeading
        title="WORKS"
        des={
          <>
            제작사에서 직접 만든 오리지널 콘텐츠부터 브랜드 작업까지,
            <br />
            아티스트캔버스의 모든 작업물을 소개합니다.
          </>
        }
      />

      <div className="mt-[4px] md:mt-[20px]">
        <div className="flex items-center justify-between border-b border-[#181819]">
          <div
            role="tablist"
            aria-label="Works tabs"
            className="flex gap-[clamp(29px,calc((50/1920)*100vw),50px)] overflow-x-auto md:gap-[46px]"
          >
            {workTabs.map((tab) => {
              const isActive = tab === activeTab;

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab)}
                  className={`relative shrink-0 pb-[19px] text-[14px] font-medium uppercase tracking-[1.3px] transition-colors ${
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
            {works.length} WORKS
          </p>
        </div>

        <div className="mt-[20px] flex gap-[7px] overflow-x-auto md:mt-[25px] md:gap-[8px]">
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={`flex h-[32px] shrink-0 items-center gap-[8px] rounded-full border pr-[clamp(10px,calc((13/1920)*100vw),13px)] pl-[4px] text-[clamp(12px,calc((16/1920)*100vw),16px)] font-medium transition-colors md:h-[clamp(24px,calc((35/1920)*100vw),35px)] md:border-l-0 md:pl-0 ${
                  isActive
                    ? "border-[#7F7F7F] bg-[#333333] text-white"
                    : "border-[#333333] text-[#7F7F7F] hover:border-[#8D8B91] hover:text-[#8D8B91]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`relative size-[clamp(24px,calc((35/1920)*100vw),35px)] overflow-hidden rounded-full border ${
                    isActive ? "border-[#7F7F7F]" : "border-[#333333]"
                  }`}
                  style={{ backgroundColor: category.color ?? "#333333" }}
                >
                  {category.profileImageUrl ? (
                    <span
                      aria-hidden="true"
                      className="block size-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${category.profileImageUrl})`,
                      }}
                    />
                  ) : null}
                </span>
                {category.label}
              </button>
            );
          })}
        </div>

        <p className="mt-[22px] text-right text-[clamp(12px,calc((14/1920)*100vw),14px)] font-semibold text-[#3A393F] md:hidden">
          {works.length} WORKS
        </p>

        <div className="mt-[9px] grid grid-cols-1 gap-[10px] md:mt-[26px] md:grid-cols-2 md:gap-x-[36px] md:gap-y-[30px] xl:grid-cols-4">
          {filteredWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>

        {activeTab === "Brand & ppl" ? (
          <section className="mt-[48px] md:mt-[72px]" aria-label="PPL partners">
            <div className="flex items-center justify-between border-b border-[#181819] pb-[21px]">
              <h3 className="text-[14px] font-semibold uppercase leading-none tracking-[0.4px] text-white md:text-[clamp(14px,calc((16/1920)*100vw),16px)]">
                PPL
              </h3>
              <p className="text-[12px] font-semibold uppercase leading-none tracking-[3.2px] text-[#3A393F] md:text-[clamp(12px,calc((14/1920)*100vw),14px)]">
                {worksData.pplPartners.length} PARTNER
              </p>
            </div>

            <div
              ref={pplScrollerRef}
              onMouseEnter={() => setIsPplPaused(true)}
              onMouseLeave={() => setIsPplPaused(false)}
              onFocus={() => setIsPplPaused(true)}
              onBlur={() => setIsPplPaused(false)}
              className="relative mt-[34px] overflow-hidden"
            >
              <div
                className={`flex w-max ${
                  hasPplOverflow ? "ppl-carousel-track" : ""
                }`}
                style={{
                  animationPlayState: isPplPaused ? "paused" : "running",
                }}
              >
                <div
                  ref={pplGroupRef}
                  className="flex w-max shrink-0 gap-[12px] pr-[12px] md:gap-[19px] md:pr-[19px]"
                >
                  {worksData.pplPartners.map((partner) => (
                    <a
                      key={partner.id}
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={partner.name}
                      className="flex h-[48px] w-[118px] shrink-0 items-center justify-center rounded-[8px] bg-[#101012] px-4 transition hover:bg-[#17171A] md:h-[82px] md:w-[158px] lg:w-[174px]"
                    >
                      {partner.logoUrl ? (
                        <span
                          aria-hidden="true"
                          className="block h-[60%] w-full bg-contain bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url(${partner.logoUrl})`,
                          }}
                        />
                      ) : (
                        <span className="truncate text-[12px] font-bold text-[#A7A6AE]">
                          {partner.name}
                        </span>
                      )}
                    </a>
                  ))}
                </div>

                {hasPplOverflow ? (
                  <div
                    aria-hidden="true"
                    className="flex w-max shrink-0 gap-[12px] pr-[12px] md:gap-[19px] md:pr-[19px]"
                  >
                    {worksData.pplPartners.map((partner) => (
                  <a
                    key={`${partner.id}-duplicate`}
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={partner.name}
                    tabIndex={-1}
                    className="pointer-events-none flex h-[48px] w-[118px] shrink-0 items-center justify-center rounded-[8px] bg-[#101012] px-4 md:h-[82px] md:w-[158px] lg:w-[174px]"
                  >
                    {partner.logoUrl ? (
                      <span
                        aria-hidden="true"
                        className="block h-[60%] w-full bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${partner.logoUrl})`,
                        }}
                      />
                    ) : (
                      <span className="truncate text-[12px] font-bold text-[#A7A6AE]">
                        {partner.name}
                      </span>
                    )}
                  </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
