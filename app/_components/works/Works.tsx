"use client";

import { useMemo, useState } from "react";
import SectionHeading from "../layout/SectionHeading";
import WorkCard from "./WorkCard";

type WorkTab = "Original" | "Brand & ppl" | "Project";

type Category = {
  label: string;
  color: string;
};

export type Work = {
  title: string;
  type: string;
  year: string;
  category: string;
  isFeatured?: boolean;
};

const categoriesByTab: Record<WorkTab, Category[]> = {
  Original: [
    { label: "파란형", color: "#FF9D71" },
    { label: "자연형", color: "#8D4CFF" },
    { label: "차분형", color: "#8D4CFF" },
    { label: "재기형", color: "#FF9D71" },
  ],
  "Brand & ppl": [
    { label: "브랜드", color: "#FF9D71" },
    { label: "피플", color: "#8D4CFF" },
    { label: "캠페인", color: "#8D4CFF" },
  ],
  Project: [
    { label: "필름", color: "#FF9D71" },
    { label: "콘텐츠", color: "#8D4CFF" },
    { label: "콜라보", color: "#8D4CFF" },
  ],
};

const worksByTab: Record<WorkTab, Work[]> = {
  Original: [
    {
      title: "영상 제목",
      type: "MAKING FILM",
      year: "2024",
      category: "파란형",
    },
    {
      title: "영상 제목",
      type: "MAKING FILM",
      year: "2024",
      category: "자연형",
    },
    {
      title: "영상 제목",
      type: "MAKING FILM",
      year: "2024",
      category: "차분형",
      isFeatured: true,
    },
    {
      title: "영상 제목",
      type: "MAKING FILM",
      year: "2024",
      category: "재기형",
    },
    {
      title: "영상 제목",
      type: "BRAND FILM",
      year: "2024",
      category: "파란형",
    },
    {
      title: "영상 제목",
      type: "MAKING FILM",
      year: "2024",
      category: "자연형",
    },
    {
      title: "영상 제목",
      type: "MAKING FILM",
      year: "2024",
      category: "차분형",
    },
    {
      title: "영상 제목",
      type: "MAKING FILM",
      year: "2024",
      category: "재기형",
    },
  ],
  "Brand & ppl": [
    {
      title: "브랜드 제목",
      type: "BRAND FILM",
      year: "2024",
      category: "브랜드",
    },
    { title: "피플 제목", type: "PEOPLE FILM", year: "2024", category: "피플" },
    {
      title: "캠페인 제목",
      type: "CAMPAIGN",
      year: "2024",
      category: "캠페인",
    },
    {
      title: "브랜드 제목",
      type: "BRAND FILM",
      year: "2024",
      category: "브랜드",
      isFeatured: true,
    },
  ],
  Project: [
    {
      title: "프로젝트 제목",
      type: "PROJECT FILM",
      year: "2024",
      category: "필름",
    },
    {
      title: "콘텐츠 제목",
      type: "ORIGINAL CONTENTS",
      year: "2024",
      category: "콘텐츠",
    },
    {
      title: "콜라보 제목",
      type: "COLLABORATION",
      year: "2024",
      category: "콜라보",
    },
    {
      title: "프로젝트 제목",
      type: "PROJECT FILM",
      year: "2024",
      category: "필름",
      isFeatured: true,
    },
  ],
};

const tabs = Object.keys(worksByTab) as WorkTab[];

export default function Works() {
  const [activeTab, setActiveTab] = useState<WorkTab>("Original");
  const [activeCategory, setActiveCategory] = useState("파란형");

  const categories = categoriesByTab[activeTab];
  const works = useMemo(() => worksByTab[activeTab], [activeTab]);

  const handleTabChange = (tab: WorkTab) => {
    setActiveTab(tab);
    setActiveCategory(categoriesByTab[tab][0].label);
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
            aria-label="Works categories"
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
                  onClick={() => handleTabChange(tab)}
                  className={`relative pb-[19px] shrink-0 text-[14px] font-medium tracking-[1.3px] uppercase transition-colors ${
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

          <p className="hidden text-[clamp(12px,calc((14/1920)*100w),14px)] tracking-[2.42px] font-semibold text-[#3A393F] md:block">
            {works.length} WORKS
          </p>
        </div>

        <div className="mt-[20px] flex gap-[7px] overflow-x-auto md:mt-[25px] md:gap-[8px]">
          {categories.map((category) => {
            const isActive = category.label === activeCategory;

            return (
              <button
                key={category.label}
                type="button"
                onClick={() => setActiveCategory(category.label)}
                className={`flex h-[32px] md:h-[clamp(24px,calc((35/1920)*100vw),35px)] shrink-0 items-center gap-[8px] rounded-full border md:border-l-0 pr-[clamp(10px,calc((13/1920)*100vw),13px)] pl-[4px] md:pl-0 text-[clamp(12px,calc((16/1920)*100vw),16px)] font-medium transition-colors ${
                  isActive
                    ? "border-[#7F7F7F] bg-[#333333] text-white"
                    : "border-[#333333] text-[#7F7F7F] hover:border-[#8D8B91] hover:text-[#8D8B91]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-[clamp(24px,calc((35/1920)*100vw),35px)] rounded-full border
                    ${isActive ? "border-[#7F7F7F]" : "border-[#333333]"}
                    `}
                  style={{ backgroundColor: category.color }}
                />
                {category.label}
              </button>
            );
          })}
        </div>

        <p className="mt-[22px] text-right text-[clamp(12px,calc((14/1920)*100w),14px)] font-semibold text-[#3A393F] md:hidden">
          {works.length} WORKS
        </p>

        <div className="mt-[9px] grid grid-cols-1 gap-[10px] md:grid-cols-2 md:mt-[26px] md:gap-x-[36px] md:gap-y-[30px] xl:grid-cols-4">
          {works.map((work, index) => (
            <WorkCard
              key={`${work.title}-${work.category}-${index}`}
              work={work}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
