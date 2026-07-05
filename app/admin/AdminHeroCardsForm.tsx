"use client";

import { Check, Eye, Loader2, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const MAX_HERO_CARDS = 10;
const heroCardSlots = Array.from(
  { length: MAX_HERO_CARDS },
  (_, index) => index + 1
);

type AdminHeroCard = {
  id: string;
  position: number;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
};

type YouTubeMetadata = {
  source: "youtube-data-api" | "youtube-oembed";
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string;
};

type AdminHeroCardsFormProps = {
  adminPassword: string;
};

export default function AdminHeroCardsForm({
  adminPassword,
}: AdminHeroCardsFormProps) {
  const [password, setPassword] = useState(adminPassword);
  const [cards, setCards] = useState<AdminHeroCard[]>([]);
  const [position, setPosition] = useState(1);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedCard = cards.find((card) => card.position === position);
  const selectPosition = (
    nextPosition: number,
    sourceCards: AdminHeroCard[] = cards
  ) => {
    const card = sourceCards.find((item) => item.position === nextPosition);

    setPosition(nextPosition);
    setYoutubeUrl(card?.youtube_url ?? "");
    setTitle(card?.title ?? "");
    setIsPublished(card?.is_published ?? true);
    setMetadata(
      card
        ? {
            source: "youtube-oembed",
            videoId: "",
            title: card.title,
            thumbnailUrl: card.thumbnail_url,
            channelName: "saved",
          }
        : null
    );
    setStatus("");
  };

  const loadCards = async (adminPassword = password) => {
    if (!adminPassword) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setStatus("");

    const response = await fetch("/api/admin/hero-cards", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await response.json();

    setIsLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Hero 카드 목록을 불러오지 못했습니다.");
      return;
    }

    const loadedCards = (data.cards ?? []) as AdminHeroCard[];
    setCards(loadedCards);
    setStatus("Hero 카드 목록을 불러왔습니다.");

    if (!loadedCards.some((card) => card.position === position)) {
      const firstCard = loadedCards[0];
      selectPosition(firstCard?.position ?? 1, loadedCards);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCards(adminPassword);
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPassword]);

  const loadMetadata = async () => {
    if (!youtubeUrl.trim()) {
      setStatus("YouTube 링크를 먼저 입력해주세요.");
      return;
    }

    setIsLoadingMetadata(true);
    setStatus("");

    const response = await fetch("/api/youtube/metadata", {
      method: "POST",
      body: JSON.stringify({ youtubeUrl }),
    });
    const data = await response.json();

    setIsLoadingMetadata(false);

    if (!response.ok) {
      setStatus(data.error ?? "YouTube 정보를 가져오지 못했습니다.");
      return;
    }

    setMetadata(data);
    setTitle(data.title);
    setStatus("YouTube 정보를 가져왔습니다.");
  };

  const saveCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    if (!youtubeUrl.trim()) {
      setStatus("YouTube 링크는 필수입니다.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/hero-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        position,
        youtubeUrl,
        title: title || metadata?.title || selectedCard?.title || "",
        isPublished,
      }),
    });
    const data = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setStatus(data.error ?? "Hero 카드를 저장하지 못했습니다.");
      return;
    }

    setStatus("Hero 카드를 저장했습니다.");
    setCards((current) => {
      const next = current.filter((card) => card.position !== position);
      return [...next, data.card].sort((a, b) => a.position - b.position);
    });
  };

  const deleteCard = async () => {
    if (!selectedCard) {
      setStatus("삭제할 Hero 카드를 먼저 선택해주세요.");
      return;
    }

    const shouldDelete = window.confirm(
      `Card ${selectedCard.position} "${selectedCard.title}"을 삭제할까요?`
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setStatus("");

    const response = await fetch("/api/admin/hero-cards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: selectedCard.id }),
    });
    const data = await response.json();

    setIsDeleting(false);

    if (!response.ok) {
      setStatus(data.error ?? "Hero 카드를 삭제하지 못했습니다.");
      return;
    }

    setCards((current) => {
      const next = current.filter((card) => card.id !== selectedCard.id);
      const nextPosition =
        next.find((card) => card.position > position)?.position ??
        next.find((card) => card.position < position)?.position ??
        position;

      window.setTimeout(() => selectPosition(nextPosition, next), 0);
      return next;
    });
    setStatus("Hero 카드를 삭제했습니다.");
  };

  return (
    <section className="mx-auto grid w-full max-w-[1280px] gap-8 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
      <aside className="space-y-4 xl:sticky xl:top-[120px] xl:h-fit">
        <div className="border-b border-[#222226] pb-4">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
            Hero
          </p>
          <h2 className="mt-2 text-[20px] font-bold">Video Cards</h2>
        </div>

        <div className="max-h-[520px] space-y-2 overflow-y-auto pr-2">
          {heroCardSlots.map((slot) => {
            const card = cards.find((item) => item.position === slot);
            const isActive = position === slot;

            return (
              <button
                key={slot}
                type="button"
                onClick={() => selectPosition(slot)}
                className={`w-full rounded-[8px] border p-3 text-left transition ${
                  isActive
                    ? "border-[#8D4CFF] bg-[#171122]"
                    : "border-[#222226] bg-[#101012] hover:border-[#4C4B52]"
                }`}
              >
                <span className="block text-[12px] font-bold text-[#8D4CFF]">
                  Card {slot}
                </span>
                <span className="mt-2 block truncate text-[13px] font-bold text-white">
                  {card?.title ?? "Empty"}
                </span>
                <span className="mt-2 block text-[11px] font-semibold text-[#6E6C76]">
                  {card
                    ? card.is_published === false
                      ? "비공개"
                      : "공개"
                    : "새 카드"}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <form onSubmit={saveCard} className="space-y-7">
        <div className="flex flex-col gap-4 border-b border-[#222226] pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
              Admin
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight md:text-[42px]">
              Hero 카드 관리
            </h1>
          </div>

          <button
            type="button"
            onClick={deleteCard}
            disabled={!selectedCard || isDeleting}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[8px] border border-[#5A242A] px-4 text-[13px] font-bold text-[#FF8A95] transition hover:border-[#FF5C6C] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            삭제
          </button>
        </div>

        <div className="hidden">
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              관리자 비밀번호
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
            />
          </label>
          <button
            type="button"
            onClick={() => loadCards()}
            disabled={isLoading}
            className="mt-auto inline-flex h-[46px] items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-[14px] font-bold text-[#060607] transition hover:bg-[#D7D7DC] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            확인
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              YouTube 링크
            </span>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
            />
          </label>
          <button
            type="button"
            onClick={loadMetadata}
            disabled={isLoadingMetadata}
            className="mt-auto inline-flex h-[46px] items-center justify-center gap-2 rounded-[8px] border border-[#3A3A40] px-5 text-[14px] font-bold text-white transition hover:border-[#8D4CFF] disabled:opacity-50"
          >
            {isLoadingMetadata ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Eye size={16} />
            )}
            정보 가져오기
          </button>
        </div>

        <label className="block">
          <span className="text-[13px] font-semibold text-[#9A99A2]">
            제목
          </span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="YouTube 정보 가져오기로 자동 입력됩니다"
            className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
          />
        </label>

        <label className="flex h-[42px] w-fit items-center gap-3 rounded-[8px] border border-[#2A2A2E] px-4 text-[13px] font-semibold text-[#C7C6CC]">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="size-4 accent-[#8D4CFF]"
          />
          공개
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] bg-[#8D4CFF] px-7 text-[15px] font-bold text-white transition hover:bg-[#7B3EF0] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            저장
          </button>
          {status ? (
            <p className="text-[13px] font-semibold text-[#9A99A2]">{status}</p>
          ) : null}
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-[120px] xl:h-fit">
        <div className="overflow-hidden rounded-[8px] border border-[#222226] bg-[#101012]">
          <div
            className="aspect-video bg-cover bg-center"
            style={{
              backgroundImage:
                metadata?.thumbnailUrl || selectedCard?.thumbnail_url
                  ? `url(${metadata?.thumbnailUrl ?? selectedCard?.thumbnail_url})`
                  : "linear-gradient(116deg,#202026 0%,#151519 42%,#060607 72%,#020203 100%)",
            }}
          />
        </div>
      </aside>
    </section>
  );
}
