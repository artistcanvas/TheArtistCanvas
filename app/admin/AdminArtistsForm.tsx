"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ArtistTab } from "../_components/artist/Artist";

type AdminArtist = {
  id: string;
  role: ArtistTab;
  name: string;
  profile_image_url: string | null;
  birth_date: string | null;
  height_cm: number | null;
  education: string | null;
  youtube_url: string | null;
  careers: string[];
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

const tabs: ArtistTab[] = ["WITH", "MCN"];

type AdminArtistsFormProps = {
  adminPassword: string;
};

export default function AdminArtistsForm({
  adminPassword,
}: AdminArtistsFormProps) {
  const [password, setPassword] = useState(adminPassword);
  const [artists, setArtists] = useState<AdminArtist[]>([]);
  const [editingArtistId, setEditingArtistId] = useState<string | null>(null);
  const [role, setRole] = useState<ArtistTab>("WITH");
  const [name, setName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [education, setEducation] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [careers, setCareers] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublished, setIsPublished] = useState(true);
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isEditMode = Boolean(editingArtistId);
  const isWithArtist = role === "WITH";
  const filteredArtists = useMemo(
    () => artists.filter((artist) => artist.role === role),
    [artists, role]
  );
  const activeListLabel = role === "WITH" ? "등록된 With" : "등록된 MCN";

  const resetForm = (nextRole: ArtistTab = "WITH") => {
    setEditingArtistId(null);
    setRole(nextRole);
    setName("");
    setProfileImageUrl("");
    setBirthDate("");
    setHeightCm("");
    setEducation("");
    setYoutubeUrl("");
    setCareers("");
    setSortOrder("0");
    setIsPublished(true);
    setStatus("새 Artist 추가 모드입니다.");
  };

  const switchRole = (nextRole: ArtistTab) => {
    resetForm(nextRole);
  };

  const loadArtists = async (adminPassword = password) => {
    if (!adminPassword) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/admin/artists", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setStatus(data.error ?? "Artist 목록을 불러오지 못했습니다.");
      return;
    }

    setArtists(data.artists ?? []);
    setStatus("Artist 관리자 연결을 확인했습니다.");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadArtists(adminPassword);
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPassword]);

  const selectArtist = (artist: AdminArtist) => {
    setEditingArtistId(artist.id);
    setRole(artist.role);
    setName(artist.name);
    setProfileImageUrl(artist.profile_image_url ?? "");
    setBirthDate(artist.birth_date ?? "");
    setHeightCm(artist.height_cm?.toString() ?? "");
    setEducation(artist.education ?? "");
    setYoutubeUrl(artist.youtube_url ?? "");
    setCareers(artist.careers.join("\n"));
    setSortOrder(artist.sort_order.toString());
    setIsPublished(artist.is_published);
    setStatus("수정할 Artist를 불러왔습니다.");
  };

  const saveArtist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    if (!name.trim()) {
      setStatus("이름은 필수입니다.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/artists", {
      method: isEditMode ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingArtistId,
        password,
        role,
        name,
        profileImageUrl,
        birthDate: isWithArtist ? "" : birthDate,
        heightCm: isWithArtist ? "" : heightCm,
        education: isWithArtist ? "" : education,
        youtubeUrl,
        careers: isWithArtist ? "" : careers,
        sortOrder: isWithArtist && !isEditMode ? filteredArtists.length : sortOrder,
        isFeatured: false,
        isPublished,
      }),
    });
    const data = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setStatus(data.error ?? "Artist를 저장하지 못했습니다.");
      return;
    }

    setStatus(isEditMode ? "Artist를 수정했습니다." : "Artist를 저장했습니다.");
    await loadArtists(password);

    if (!isEditMode) {
      resetForm(role);
    }
  };

  const uploadImage = async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!password) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("password", password);
    formData.append("file", file);

    setIsUploading(true);
    setStatus("");

    const response = await fetch("/api/admin/artists/image", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    setIsUploading(false);

    if (!response.ok) {
      setStatus(data.error ?? "이미지를 업로드하지 못했습니다.");
      return;
    }

    setProfileImageUrl(data.imageUrl);
    setStatus("이미지를 업로드했습니다.");
  };

  const reorderArtists = async (artistId: string, direction: -1 | 1) => {
    const currentIndex = filteredArtists.findIndex((artist) => artist.id === artistId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= filteredArtists.length) {
      return;
    }

    const nextArtists = [...filteredArtists];
    [nextArtists[currentIndex], nextArtists[nextIndex]] = [
      nextArtists[nextIndex],
      nextArtists[currentIndex],
    ];

    setStatus("Artist 순서를 저장하는 중입니다.");

    const response = await fetch("/api/admin/artists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        password,
        ids: nextArtists.map((artist) => artist.id),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Artist 순서를 저장하지 못했습니다.");
      return;
    }

    await loadArtists(password);
    setStatus("Artist 순서를 저장했습니다.");
  };

  const deleteArtist = async (artist: AdminArtist) => {
    if (!window.confirm(`"${artist.name}" Artist를 삭제할까요?`)) {
      return;
    }

    const response = await fetch("/api/admin/artists", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: artist.id }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Artist를 삭제하지 못했습니다.");
      return;
    }

    if (editingArtistId === artist.id) {
      resetForm(role);
    }

    await loadArtists(password);
    setStatus("Artist를 삭제했습니다.");
  };

  return (
    <section className="mx-auto grid w-full max-w-[1280px] gap-8 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
      <aside className="space-y-4 xl:sticky xl:top-[120px] xl:h-fit">
        <div className="border-b border-[#222226] pb-4">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
            Artist
          </p>
          <h2 className="mt-2 text-[20px] font-bold">{activeListLabel}</h2>
        </div>

        <button
          type="button"
          onClick={() => resetForm(role)}
          className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] text-[13px] font-bold text-white transition hover:border-[#8D4CFF]"
        >
          <Plus size={15} />
          {role === "WITH" ? "With 추가" : "MCN 추가"}
        </button>

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {filteredArtists.length > 0 ? (
            filteredArtists.map((artist, index) => {
              const isActive = artist.id === editingArtistId;

              return (
                <div
                  key={artist.id}
                  className={`w-full rounded-[8px] border p-3 text-left transition ${
                    isActive
                      ? "border-[#8D4CFF] bg-[#171122]"
                      : "border-[#222226] bg-[#101012] hover:border-[#4C4B52]"
                  }`}
                >
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={() => selectArtist(artist)}
                      className="min-w-0 text-left"
                    >
                      <span className="block truncate text-[13px] font-bold text-white">
                        {artist.name}
                      </span>
                      <span className="mt-2 block text-[11px] font-semibold text-[#6E6C76]">
                        {artist.is_published ? "공개" : "비공개"}
                      </span>
                    </button>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => reorderArtists(artist.id, -1)}
                        disabled={index === 0}
                        aria-label={`${artist.name} 위로 이동`}
                        className="flex size-7 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#8D4CFF] hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderArtists(artist.id, 1)}
                        disabled={index === filteredArtists.length - 1}
                        aria-label={`${artist.name} 아래로 이동`}
                        className="flex size-7 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#8D4CFF] hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteArtist(artist)}
                        aria-label={`${artist.name} 삭제`}
                        className="col-span-2 flex h-7 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#FF6B6B] hover:text-[#FF9A9A]"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-[8px] border border-[#222226] bg-[#101012] p-4 text-[13px] text-[#8E8D96]">
              {isLoading ? "목록을 불러오는 중입니다." : `${activeListLabel} 항목이 없습니다.`}
            </p>
          )}
        </div>
      </aside>

      <form onSubmit={saveArtist} className="space-y-7">
        <div className="flex items-start justify-between gap-4 border-b border-[#222226] pb-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
              Admin
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-tight md:text-[42px]">
              Artist 관리
            </h1>
          </div>
          {isEditMode ? (
            <span className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#8D4CFF]/50 px-3 text-[12px] font-bold text-[#C9B3FF]">
              <Pencil size={14} />
              수정 모드
            </span>
          ) : null}
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
            onClick={() => void loadArtists()}
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

        <div className="grid gap-4 md:grid-cols-2">
          {tabs.map((item) => {
            const isActive = item === role;

            return (
              <button
                key={item}
                type="button"
                onClick={() => switchRole(item)}
                className={`h-[46px] rounded-[8px] border text-[13px] font-bold uppercase tracking-[1.2px] transition ${
                  isActive
                    ? "border-[#8D4CFF] bg-[#8D4CFF] text-white"
                    : "border-[#2A2A2E] bg-[#101012] text-[#8E8D96] hover:border-[#6E6C76]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              이름
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="아티스트 이름"
              className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
            />
          </label>

          {!isWithArtist ? (
            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                생년월일
              </span>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
              />
            </label>
          ) : null}
        </div>

        {!isWithArtist ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                키(cm)
              </span>
              <input
                type="number"
                min="1"
                max="300"
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
                placeholder="170"
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                정렬 순서
              </span>
              <input
                type="number"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition focus:border-[#8D4CFF]"
              />
            </label>
          </div>
        ) : null}

        {!isWithArtist ? (
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              학력
            </span>
            <input
              value={education}
              onChange={(event) => setEducation(event.target.value)}
              placeholder="OO대학교 음악학과"
              className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
            />
          </label>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              이미지 URL
            </span>
            <input
              type="url"
              value={profileImageUrl}
              onChange={(event) => setProfileImageUrl(event.target.value)}
              placeholder="업로드하거나 직접 입력"
              className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
            />
          </label>
          <label className="mt-auto inline-flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-[#3A3A40] px-5 text-[14px] font-bold text-white transition hover:border-[#8D4CFF]">
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            업로드
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={(event) =>
                void uploadImage(event.currentTarget.files?.[0] ?? null)
              }
              className="sr-only"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-[13px] font-semibold text-[#9A99A2]">
            유튜브 링크
          </span>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/@..."
            className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
          />
        </label>

        {!isWithArtist ? (
          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              주요 경력
            </span>
            <textarea
              value={careers}
              onChange={(event) => setCareers(event.target.value)}
              placeholder={"한 줄에 하나씩 입력\n예: 정규 앨범 발매 - OO편"}
              className="mt-2 min-h-[132px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 py-3 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
            />
          </label>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <label className="flex h-[42px] w-fit items-center gap-3 rounded-[8px] border border-[#2A2A2E] px-4 text-[13px] font-semibold text-[#C7C6CC]">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="size-4 accent-[#8D4CFF]"
            />
            공개
          </label>
        </div>

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
            {isEditMode ? "Artist 수정 저장" : "Artist 저장"}
          </button>
          {isEditMode ? (
            <button
              type="button"
              onClick={() => resetForm(role)}
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] px-5 text-[14px] font-bold text-[#C7C6CC] transition hover:border-[#8D4CFF] hover:text-white"
            >
              <X size={16} />
              취소
            </button>
          ) : null}
          {status ? (
            <p className="text-[13px] font-semibold text-[#9A99A2]">
              {status}
            </p>
          ) : null}
        </div>
      </form>

      <aside className="space-y-4 xl:sticky xl:top-[120px] xl:h-fit">
        <div className="overflow-hidden rounded-[8px] border border-[#222226] bg-[#101012]">
          <div
            className="aspect-[302/347] bg-cover bg-center"
            style={{
              backgroundImage: profileImageUrl
                ? `url(${profileImageUrl})`
                : "linear-gradient(145deg,#28282B 0%,#202025 35%,#101014 100%)",
            }}
          />
          <div className="space-y-2 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8D4CFF]">
              Artist Preview
            </p>
            <h2 className="text-[20px] font-bold text-white">
              {name || "Artist 이름"}
            </h2>
            <p className="text-[12px] font-bold text-[#6E6C76]">{role}</p>
          </div>
        </div>

        <a
          href="/artist"
          className="inline-flex h-[42px] items-center gap-2 rounded-[8px] border border-[#2A2A2E] px-4 text-[13px] font-bold text-[#C7C6CC] transition hover:border-[#8D4CFF] hover:text-white"
        >
          <Plus size={15} />
          Artist 보기
        </a>
      </aside>
    </section>
  );
}
