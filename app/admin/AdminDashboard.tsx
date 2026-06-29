"use client";

import { Home, Mail, Palette, Video } from "lucide-react";
import { useState } from "react";
import AdminArtistsForm from "./AdminArtistsForm";
import AdminContactForm from "./AdminContactForm";
import AdminHeroCardsForm from "./AdminHeroCardsForm";
import AdminWorksForm from "./AdminWorksForm";

type AdminTab = "works" | "hero" | "artist" | "contact";

const tabs: Array<{
  id: AdminTab;
  label: string;
  icon: typeof Video;
}> = [
  { id: "works", label: "Works", icon: Video },
  { id: "hero", label: "Hero", icon: Home },
  { id: "artist", label: "Artist", icon: Palette },
  { id: "contact", label: "Contact", icon: Mail },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("works");

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-8">
      <header className="flex flex-col gap-5 border-b border-[#222226] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
            Admin
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight md:text-[46px]">
            TAC 관리
          </h1>
        </div>

        <div
          role="tablist"
          aria-label="Admin sections"
          className="grid grid-cols-4 gap-2 rounded-[8px] border border-[#222226] bg-[#0C0C0E] p-1 md:w-[520px]"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-[42px] items-center justify-center gap-2 rounded-[6px] text-[13px] font-bold transition ${
                  isActive
                    ? "bg-white text-[#060607]"
                    : "text-[#8E8D96] hover:bg-[#17171A] hover:text-white"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {activeTab === "works" ? <AdminWorksForm /> : null}
      {activeTab === "hero" ? <AdminHeroCardsForm /> : null}
      {activeTab === "artist" ? <AdminArtistsForm /> : null}
      {activeTab === "contact" ? <AdminContactForm /> : null}
    </div>
  );
}
