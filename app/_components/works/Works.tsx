"use client";

import { useState } from "react";
import SectionHeading from "../layout/SectionHeading";
import WorkCard from "./WorkCard";
import type { PplPartner, WorksData, WorkTab, WorkViewTab } from "./workTypes";
import { workTabLabels, workTabs } from "./workTypes";

function isWorkTab(tab: WorkViewTab): tab is WorkTab {
  return tab !== "PPL";
}

function PplPartnerCard({ partner }: { partner: PplPartner }) {
  return (
    <a
      href={partner.websiteUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={partner.name}
      className="flex aspect-[158/82] min-h-[58px] w-full items-center justify-center rounded-[8px] bg-[#101012] px-4 transition hover:bg-[#17171A] focus:outline-none focus:ring-2 focus:ring-[#8D4CFF]/70"
    >
      {partner.logoUrl ? (
        <span
          aria-hidden="true"
          className="block h-[58%] w-full bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${partner.logoUrl})`,
          }}
        />
      ) : (
        <span className="max-w-full truncate text-[12px] font-bold text-[#A7A6AE]">
          {partner.name}
        </span>
      )}
    </a>
  );
}

export default function Works({ worksData }: { worksData: WorksData }) {
  const [activeTab, setActiveTab] = useState<WorkViewTab>("Original");
  const [activeCategoryId, setActiveCategoryId] = useState(
    worksData.Original.categories[0]?.id ?? ""
  );

  const isPplTab = activeTab === "PPL";
  const categories = isWorkTab(activeTab) ? worksData[activeTab].categories : [];
  const works = isWorkTab(activeTab) ? worksData[activeTab].works : [];

  const filteredWorks = activeCategoryId
    ? works.filter((work) => work.categoryId === activeCategoryId)
    : works;
  const itemCount = isPplTab
    ? worksData.pplPartners.length
    : filteredWorks.length;

  const handleTabChange = (tab: WorkViewTab) => {
    setActiveTab(tab);
    setActiveCategoryId(
      isWorkTab(tab) ? worksData[tab].categories[0]?.id ?? "" : ""
    );
  };

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
                  {workTabLabels[tab]}
                  {isActive ? (
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="hidden text-[clamp(12px,calc((14/1920)*100vw),14px)] font-semibold tracking-[2.42px] text-[#3A393F] md:block">
            {itemCount} {isPplTab ? "PARTNER" : "WORKS"}
          </p>
        </div>

        {!isPplTab ? (
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
        ) : null}

        <p className="mt-[22px] text-right text-[clamp(12px,calc((14/1920)*100vw),14px)] font-semibold text-[#3A393F] md:hidden">
          {itemCount} {isPplTab ? "PARTNER" : "WORKS"}
        </p>

        {isPplTab ? (
          <div className="mt-[9px] grid grid-cols-2 gap-[10px] md:mt-[26px] md:grid-cols-4 md:gap-x-[16px] md:gap-y-[18px] xl:grid-cols-8">
            {worksData.pplPartners.map((partner) => (
              <PplPartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        ) : (
          <div className="mt-[9px] grid grid-cols-1 gap-[10px] md:mt-[26px] md:grid-cols-2 md:gap-x-[36px] md:gap-y-[30px] xl:grid-cols-4">
            {filteredWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
