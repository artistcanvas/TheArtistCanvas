"use client";

import {
  Check,
  Eye,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { WorkTab, WorkViewTab } from "../_components/works/workTypes";
import { workTabLabels } from "../_components/works/workTypes";
import { hasSameOrder, reorderByDrop } from "./adminDragSort";

type YouTubeMetadata = {
  source: "youtube-data-api" | "youtube-oembed" | "saved";
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelId: string | null;
  channelName: string;
  channelProfileImageUrl: string | null;
};

type AdminWork = {
  id: string;
  tab: WorkTab;
  title: string;
  youtube_url: string;
  thumbnail_url: string | null;
  description: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  category: {
    id: string;
    label: string;
    profile_image_url: string | null;
    youtube_channel_id: string | null;
  } | null;
  type: {
    id: string;
    label: string;
  } | null;
};

type PplPartner = {
  id: string;
  name: string;
  website_url: string;
  logo_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

type AdminCategory = {
  id: string;
  tab: WorkTab;
  label: string;
  profile_image_url: string | null;
  youtube_channel_id: string | null;
  sort_order: number;
};

type AdminOptions = {
  types: Array<{ id: string; label: string }>;
  categories: AdminCategory[];
  works: AdminWork[];
};

type SiteMetadata = {
  name: string;
  websiteUrl: string;
  logoUrl: string | null;
};

const tabs: WorkViewTab[] = ["Original", "Brand & ppl", "Project", "PPL"];
const descriptionLimit = 80;

function isWorkTab(tab: WorkViewTab): tab is WorkTab {
  return tab !== "PPL";
}

type AdminWorksFormProps = {
  adminPassword: string;
};

export default function AdminWorksForm({ adminPassword }: AdminWorksFormProps) {
  const [password, setPassword] = useState(adminPassword);
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [tab, setTab] = useState<WorkViewTab>("Original");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [typeLabel, setTypeLabel] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [options, setOptions] = useState<AdminOptions>({
    types: [],
    categories: [],
    works: [],
  });

  const [pplPartners, setPplPartners] = useState<PplPartner[]>([]);
  const [editingPplId, setEditingPplId] = useState<string | null>(null);
  const [pplName, setPplName] = useState("");
  const [pplWebsiteUrl, setPplWebsiteUrl] = useState("");
  const [pplLogoUrl, setPplLogoUrl] = useState("");
  const [isPplPublished, setIsPplPublished] = useState(true);
  const [pplMetadata, setPplMetadata] = useState<SiteMetadata | null>(null);

  const [status, setStatus] = useState("");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingPplMetadata, setIsLoadingPplMetadata] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPpl, setIsSavingPpl] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [draggedWorkId, setDraggedWorkId] = useState<string | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [draggedPplId, setDraggedPplId] = useState<string | null>(null);
  const [workDragOrderIds, setWorkDragOrderIds] = useState<string[] | null>(null);
  const [categoryDragOrderIds, setCategoryDragOrderIds] = useState<string[] | null>(
    null
  );
  const [pplDragOrderIds, setPplDragOrderIds] = useState<string[] | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const workDroppedRef = useRef(false);
  const categoryDroppedRef = useRef(false);
  const pplDroppedRef = useRef(false);

  const isEditMode = Boolean(editingWorkId);
  const isPplEditMode = Boolean(editingPplId);
  const isPplTab = tab === "PPL";

  const categoriesByTab = useMemo(
    () =>
      isWorkTab(tab)
        ? options.categories.filter((category) => category.tab === tab)
        : [],
    [options.categories, tab]
  );
  const displayedCategories = useMemo(() => {
    if (!categoryDragOrderIds) {
      return categoriesByTab;
    }

    const categoriesById = new Map(
      categoriesByTab.map((category) => [category.id, category])
    );
    const orderedCategories = categoryDragOrderIds
      .map((id) => categoriesById.get(id))
      .filter((category): category is AdminCategory => Boolean(category));

    return orderedCategories.length === categoriesByTab.length
      ? orderedCategories
      : categoriesByTab;
  }, [categoriesByTab, categoryDragOrderIds]);
  const effectiveSelectedCategoryId =
    selectedCategoryId &&
    categoriesByTab.some((category) => category.id === selectedCategoryId)
      ? selectedCategoryId
      : null;
  const selectedCategory = effectiveSelectedCategoryId
    ? categoriesByTab.find((category) => category.id === effectiveSelectedCategoryId)
    : null;
  const tabWorks = useMemo(
    () => (isWorkTab(tab) ? options.works.filter((work) => work.tab === tab) : []),
    [options.works, tab]
  );
  const filteredWorks = useMemo(
    () =>
      effectiveSelectedCategoryId
        ? tabWorks.filter((work) => work.category?.id === effectiveSelectedCategoryId)
        : tabWorks,
    [effectiveSelectedCategoryId, tabWorks]
  );
  const displayedWorks = useMemo(() => {
    if (!workDragOrderIds) {
      return filteredWorks;
    }

    const worksById = new Map(filteredWorks.map((work) => [work.id, work]));
    const orderedWorks = workDragOrderIds
      .map((id) => worksById.get(id))
      .filter((work): work is AdminWork => Boolean(work));

    return orderedWorks.length === filteredWorks.length ? orderedWorks : filteredWorks;
  }, [filteredWorks, workDragOrderIds]);
  const displayedPplPartners = useMemo(() => {
    if (!pplDragOrderIds) {
      return pplPartners;
    }

    const partnersById = new Map(pplPartners.map((partner) => [partner.id, partner]));
    const orderedPartners = pplDragOrderIds
      .map((id) => partnersById.get(id))
      .filter((partner): partner is PplPartner => Boolean(partner));

    return orderedPartners.length === pplPartners.length
      ? orderedPartners
      : pplPartners;
  }, [pplDragOrderIds, pplPartners]);
  const activeListLabel = isPplTab ? "등록된 PPL" : "등록된 Works";
  const activeListItems = isPplTab ? displayedPplPartners : displayedWorks;

  const resetWorkForm = () => {
    setEditingWorkId(null);
    setTab(isWorkTab(tab) ? tab : "Original");
    setSelectedCategoryId(null);
    setYoutubeUrl("");
    setTypeLabel("");
    setCategoryLabel("");
    setDescription("");
    setIsPublished(true);
    setMetadata(null);
    setStatus("새 영상 추가 모드입니다.");
  };

  const resetPplForm = () => {
    setTab("PPL");
    setEditingPplId(null);
    setPplName("");
    setPplWebsiteUrl("");
    setPplLogoUrl("");
    setIsPplPublished(true);
    setPplMetadata(null);
    setStatus("새 PPL 파트너 추가 모드입니다.");
  };

  const loadPplPartners = async (adminPassword = password) => {
    const response = await fetch("/api/admin/ppl", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "PPL 목록을 불러오지 못했습니다.");
      return;
    }

    setPplPartners(data.partners ?? []);
  };

  const loadOptions = async (adminPassword = password) => {
    if (!adminPassword) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    const response = await fetch("/api/admin/works", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "옵션을 불러오지 못했습니다.");
      return;
    }

    setOptions(data);
    await loadPplPartners(adminPassword);
    setStatus("관리자 연결이 확인됐습니다.");
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOptions(adminPassword);
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

    if (!categoryLabel) {
      setCategoryLabel(data.channelName);
    }

    setStatus("YouTube 정보를 가져왔습니다.");
  };

  const loadPplMetadata = async () => {
    if (!pplWebsiteUrl.trim()) {
      setStatus("사이트 링크를 먼저 입력해주세요.");
      return;
    }

    setIsLoadingPplMetadata(true);
    setStatus("");

    const response = await fetch("/api/admin/ppl/metadata", {
      method: "POST",
      body: JSON.stringify({ password, websiteUrl: pplWebsiteUrl }),
    });
    const data = await response.json();

    setIsLoadingPplMetadata(false);

    if (!response.ok) {
      setStatus(data.error ?? "사이트 정보를 가져오지 못했습니다.");
      return;
    }

    setPplMetadata(data);
    setPplName((current) => current || data.name);
    setPplWebsiteUrl(data.websiteUrl);
    setPplLogoUrl((current) => current || data.logoUrl || "");
    setStatus("사이트 로고 후보를 가져왔습니다.");
  };

  const selectWork = (work: AdminWork) => {
    setEditingWorkId(work.id);
    setTab(work.tab);
    setSelectedCategoryId(work.category?.id ?? null);
    setYoutubeUrl(work.youtube_url);
    setTypeLabel(work.type?.label ?? "");
    setCategoryLabel(work.category?.label ?? "");
    setDescription(work.description ?? "");
    setIsPublished(work.is_published);
    setMetadata({
      source: "saved",
      videoId: "",
      title: work.title,
      thumbnailUrl: work.thumbnail_url,
      channelId: work.category?.youtube_channel_id ?? null,
      channelName: work.category?.label ?? "",
      channelProfileImageUrl: work.category?.profile_image_url ?? null,
    });
    setStatus("수정할 영상을 불러왔습니다.");
  };

  const selectPpl = (partner: PplPartner) => {
    setTab("PPL");
    setEditingPplId(partner.id);
    setPplName(partner.name);
    setPplWebsiteUrl(partner.website_url);
    setPplLogoUrl(partner.logo_url ?? "");
    setIsPplPublished(partner.is_published);
    setPplMetadata({
      name: partner.name,
      websiteUrl: partner.website_url,
      logoUrl: partner.logo_url,
    });
    setStatus("수정할 PPL 파트너를 불러왔습니다.");
  };

  const saveWork = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    if (!isWorkTab(tab)) {
      setStatus("Works 탭을 선택해주세요.");
      return;
    }

    if (!youtubeUrl.trim() || !typeLabel.trim()) {
      setStatus("YouTube 링크와 type은 필수입니다.");
      return;
    }

    setIsSaving(true);
    setStatus("");

    const selectedProjectCategoryLabel =
      tab === "Project" ? selectedCategory?.label ?? categoryLabel : categoryLabel;

    const response = await fetch("/api/admin/works", {
      method: isEditMode ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingWorkId,
        password,
        tab,
        youtubeUrl,
        typeLabel,
        categoryLabel: selectedProjectCategoryLabel,
        description,
        isPublished,
      }),
    });
    const data = await response.json();

    setIsSaving(false);

    if (!response.ok) {
      setStatus(data.error ?? "저장하지 못했습니다.");
      return;
    }

    setStatus(isEditMode ? "수정했습니다." : "저장했습니다.");
    await loadOptions(password);

    if (!isEditMode) {
      resetWorkForm();
    }
  };

  const savePpl = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      setStatus("관리자 비밀번호를 입력해주세요.");
      return;
    }

    if (!pplWebsiteUrl.trim()) {
      setStatus("PPL 사이트 링크는 필수입니다.");
      return;
    }

    setIsSavingPpl(true);
    setStatus("");

    const response = await fetch("/api/admin/ppl", {
      method: isPplEditMode ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingPplId,
        password,
        name: pplName,
        websiteUrl: pplWebsiteUrl,
        logoUrl: pplLogoUrl,
        isPublished: isPplPublished,
      }),
    });
    const data = await response.json();

    setIsSavingPpl(false);

    if (!response.ok) {
      setStatus(data.error ?? "PPL을 저장하지 못했습니다.");
      return;
    }

    setStatus(isPplEditMode ? "PPL을 수정했습니다." : "PPL을 저장했습니다.");
    await loadPplPartners(password);

    if (!isPplEditMode) {
      resetPplForm();
    }
  };

  const uploadPplLogo = async (file: File | null) => {
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

    setIsUploadingLogo(true);
    setStatus("");

    const response = await fetch("/api/admin/ppl/logo", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    setIsUploadingLogo(false);

    if (!response.ok) {
      setStatus(data.error ?? "로고 이미지를 업로드하지 못했습니다.");
      return;
    }

    setPplLogoUrl(data.logoUrl);
    setStatus("로고 이미지를 업로드했습니다.");
  };

  const saveWorksOrder = async (nextWorks: AdminWork[]) => {
    if (hasSameOrder(filteredWorks, nextWorks)) {
      return;
    }

    setStatus("Works 순서를 저장하는 중입니다.");

    const response = await fetch("/api/admin/works", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        password,
        ids: nextWorks.map((work) => work.id),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Works 순서를 저장하지 못했습니다.");
      return;
    }

    await loadOptions(password);
    setStatus("Works 순서를 저장했습니다.");
  };

  const dropWork = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    workDroppedRef.current = true;
    const nextWorks = reorderByDrop(displayedWorks, draggedWorkId, targetId);
    setDraggedWorkId(null);
    void saveWorksOrder(nextWorks).finally(() => setWorkDragOrderIds(null));
  };

  const previewWorkMove = (targetId: string) => {
    if (!draggedWorkId) {
      return;
    }

    const nextWorks = reorderByDrop(displayedWorks, draggedWorkId, targetId);

    if (!hasSameOrder(displayedWorks, nextWorks)) {
      setWorkDragOrderIds(nextWorks.map((work) => work.id));
    }
  };

  const saveCategoryOrder = async (nextCategories: AdminCategory[]) => {
    if (hasSameOrder(categoriesByTab, nextCategories)) {
      return;
    }

    setStatus("Channel order is being saved.");

    const response = await fetch("/api/admin/works", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorderCategories",
        password,
        ids: nextCategories.map((category) => category.id),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "Could not save channel order.");
      return;
    }

    await loadOptions(password);
    setStatus("Channel order has been saved.");
  };

  const dropCategory = (event: DragEvent<HTMLButtonElement>, targetId: string) => {
    event.preventDefault();
    categoryDroppedRef.current = true;
    const nextCategories = reorderByDrop(
      displayedCategories,
      draggedCategoryId,
      targetId
    );
    setDraggedCategoryId(null);
    void saveCategoryOrder(nextCategories).finally(() =>
      setCategoryDragOrderIds(null)
    );
  };

  const previewCategoryMove = (targetId: string) => {
    if (!draggedCategoryId) {
      return;
    }

    const nextCategories = reorderByDrop(
      displayedCategories,
      draggedCategoryId,
      targetId
    );

    if (!hasSameOrder(displayedCategories, nextCategories)) {
      setCategoryDragOrderIds(nextCategories.map((category) => category.id));
    }
  };

  const savePplOrder = async (nextPartners: PplPartner[]) => {
    if (hasSameOrder(pplPartners, nextPartners)) {
      return;
    }

    setStatus("PPL 순서를 저장하는 중입니다.");

    const response = await fetch("/api/admin/ppl", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reorder",
        password,
        ids: nextPartners.map((partner) => partner.id),
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "PPL 순서를 저장하지 못했습니다.");
      return;
    }

    await loadPplPartners(password);
    setStatus("PPL 순서를 저장했습니다.");
  };

  const dropPpl = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    pplDroppedRef.current = true;
    const nextPartners = reorderByDrop(displayedPplPartners, draggedPplId, targetId);
    setDraggedPplId(null);
    void savePplOrder(nextPartners).finally(() => setPplDragOrderIds(null));
  };

  const previewPplMove = (targetId: string) => {
    if (!draggedPplId) {
      return;
    }

    const nextPartners = reorderByDrop(displayedPplPartners, draggedPplId, targetId);

    if (!hasSameOrder(displayedPplPartners, nextPartners)) {
      setPplDragOrderIds(nextPartners.map((partner) => partner.id));
    }
  };

  const deleteWork = async (work: AdminWork) => {
    if (!window.confirm(`"${work.title}" 영상을 삭제할까요?`)) {
      return;
    }

    const response = await fetch("/api/admin/works", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: work.id }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "영상을 삭제하지 못했습니다.");
      return;
    }

    if (editingWorkId === work.id) {
      resetWorkForm();
    }

    await loadOptions(password);
    setStatus("영상을 삭제했습니다.");
  };

  const deletePpl = async (partner: PplPartner) => {
    if (!window.confirm(`"${partner.name}" PPL을 삭제할까요?`)) {
      return;
    }

    const response = await fetch("/api/admin/ppl", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: partner.id }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error ?? "PPL을 삭제하지 못했습니다.");
      return;
    }

    if (editingPplId === partner.id) {
      resetPplForm();
    }

    await loadPplPartners(password);
    setStatus("PPL을 삭제했습니다.");
  };

  const tabButtons = (
    <div className="grid gap-3 md:grid-cols-4">
      {tabs.map((item) => {
        const isActive = item === tab;

        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              setTab(item);
              setSelectedCategoryId(null);
              setCategoryDragOrderIds(null);
            }}
            className={`h-[46px] rounded-[8px] border text-[13px] font-bold uppercase tracking-[1.2px] transition ${
              isActive
                ? "border-[#8D4CFF] bg-[#8D4CFF] text-white"
                : "border-[#2A2A2E] bg-[#101012] text-[#8E8D96] hover:border-[#6E6C76]"
            }`}
          >
            {workTabLabels[item]}
          </button>
        );
      })}
    </div>
  );

  return (
    <section className="mx-auto grid w-full max-w-[1280px] gap-8 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
      <aside className="space-y-8 xl:sticky xl:top-[120px] xl:h-fit">
        <div className="space-y-4">
          <div className="border-b border-[#222226] pb-4">
            <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
              Library
            </p>
            <h2 className="mt-2 text-[20px] font-bold">{activeListLabel}</h2>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[1.4px] text-[#6E6C76]">
              {workTabLabels[tab]}
            </p>
          </div>

          {!isPplTab ? (
            <div className="space-y-3">
              <p className="text-[12px] font-semibold text-[#9A99A2]">채널명</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    if (tab === "Project") {
                      setCategoryLabel("");
                    }
                  }}
                  className={`flex min-h-[36px] w-full items-center rounded-full border px-3 text-left text-[12px] font-bold transition ${
                    effectiveSelectedCategoryId === null
                      ? "border-[#8D4CFF] bg-[#8D4CFF] text-white"
                      : "border-[#2F2F35] text-[#A7A6AE] hover:border-[#8D4CFF] hover:text-white"
                  }`}
                >
                  전체
                </button>
                {displayedCategories.map((category) => {
                  const isActive = effectiveSelectedCategoryId === category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      draggable
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        if (tab === "Project") {
                          setCategoryLabel(category.label);
                        }
                      }}
                      onDragStart={(event) => {
                        categoryDroppedRef.current = false;
                        setDraggedCategoryId(category.id);
                        setCategoryDragOrderIds(
                          displayedCategories.map((item) => item.id)
                        );
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", category.id);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        previewCategoryMove(category.id);
                      }}
                      onDrop={(event) => dropCategory(event, category.id)}
                      onDragEnd={() => {
                        setDraggedCategoryId(null);
                        if (!categoryDroppedRef.current) {
                          setCategoryDragOrderIds(null);
                        }
                        categoryDroppedRef.current = false;
                      }}
                      aria-label={`${category.label} channel`}
                      className={`flex min-h-[36px] w-full min-w-0 cursor-grab items-center gap-2 rounded-full border px-3 py-1 text-left text-[12px] font-bold transition active:cursor-grabbing ${
                        isActive
                          ? "border-[#8D4CFF] bg-[#171122] text-white"
                          : draggedCategoryId === category.id
                            ? "border-[#8D4CFF] bg-[#171122]/70 text-white opacity-45"
                            : "border-[#2F2F35] text-[#A7A6AE] hover:border-[#8D4CFF] hover:text-white"
                      }`}
                    >
                      <GripVertical size={13} className="shrink-0" />
                      <span className="truncate">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={isPplTab ? resetPplForm : resetWorkForm}
            className="inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] text-[13px] font-bold text-white transition hover:border-[#8D4CFF]"
          >
            <Plus size={15} />
            {isPplTab ? "PPL 추가" : "영상 추가"}
          </button>

          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {!isPplTab && displayedWorks.length > 0 ? (
              displayedWorks.map((work) => {
                const isActive = work.id === editingWorkId;

                return (
                  <div
                    key={work.id}
                    data-drag-card
                    onDragOver={(event) => {
                      event.preventDefault();
                      previewWorkMove(work.id);
                    }}
                    onDrop={(event) => dropWork(event, work.id)}
                    className={`grid grid-cols-[auto_1fr_auto] gap-2 rounded-[8px] border p-3 transition duration-150 ${
                      isActive
                        ? "border-[#8D4CFF] bg-[#171122]"
                        : draggedWorkId === work.id
                          ? "border-[#8D4CFF] bg-[#171122]/70 opacity-45"
                          : "border-[#222226] bg-[#101012] hover:border-[#4C4B52]"
                    }`}
                  >
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        workDroppedRef.current = false;
                        setDraggedWorkId(work.id);
                        setWorkDragOrderIds(displayedWorks.map((item) => item.id));
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", work.id);
                        const card = event.currentTarget.closest("[data-drag-card]");
                        if (card instanceof HTMLElement) {
                          event.dataTransfer.setDragImage(card, 24, 24);
                        }
                      }}
                      onDragEnd={() => {
                        setDraggedWorkId(null);
                        if (!workDroppedRef.current) {
                          setWorkDragOrderIds(null);
                        }
                        workDroppedRef.current = false;
                      }}
                      aria-label={`${work.title} 순서 이동`}
                      className="flex size-8 cursor-grab items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#8D4CFF] hover:text-white active:cursor-grabbing"
                    >
                      <GripVertical size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => selectWork(work)}
                      className="min-w-0 text-left"
                    >
                      <span className="block truncate text-[13px] font-bold text-white">
                        {work.title}
                      </span>
                      <span className="mt-2 block text-[11px] font-semibold text-[#6E6C76]">
                        {work.is_published ? "공개" : "비공개"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWork(work)}
                      aria-label={`${work.title} 삭제`}
                      className="flex size-8 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#FF6B6B] hover:text-[#FF9A9A]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            ) : isPplTab && displayedPplPartners.length > 0 ? (
              displayedPplPartners.map((partner) => {
                const isActive = partner.id === editingPplId;

                return (
                  <div
                    key={partner.id}
                    data-drag-card
                    onDragOver={(event) => {
                      event.preventDefault();
                      previewPplMove(partner.id);
                    }}
                    onDrop={(event) => dropPpl(event, partner.id)}
                    className={`grid grid-cols-[auto_1fr_auto] gap-2 rounded-[8px] border p-3 transition duration-150 ${
                      isActive
                        ? "border-[#FF9D71] bg-[#21140F]"
                        : draggedPplId === partner.id
                          ? "border-[#FF9D71] bg-[#21140F]/70 opacity-45"
                          : "border-[#222226] bg-[#101012] hover:border-[#4C4B52]"
                    }`}
                  >
                    <button
                      type="button"
                      draggable
                      onDragStart={(event) => {
                        pplDroppedRef.current = false;
                        setDraggedPplId(partner.id);
                        setPplDragOrderIds(
                          displayedPplPartners.map((item) => item.id)
                        );
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", partner.id);
                        const card = event.currentTarget.closest("[data-drag-card]");
                        if (card instanceof HTMLElement) {
                          event.dataTransfer.setDragImage(card, 24, 24);
                        }
                      }}
                      onDragEnd={() => {
                        setDraggedPplId(null);
                        if (!pplDroppedRef.current) {
                          setPplDragOrderIds(null);
                        }
                        pplDroppedRef.current = false;
                      }}
                      aria-label={`${partner.name} 순서 이동`}
                      className="flex size-8 cursor-grab items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#FF9D71] hover:text-white active:cursor-grabbing"
                    >
                      <GripVertical size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => selectPpl(partner)}
                      className="min-w-0 text-left"
                    >
                      <span className="block truncate text-[13px] font-bold text-white">
                        {partner.name}
                      </span>
                      <span className="mt-2 block truncate text-[11px] font-semibold text-[#6E6C76]">
                        {partner.website_url}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePpl(partner)}
                      aria-label={`${partner.name} 삭제`}
                      className="flex size-8 items-center justify-center rounded-[6px] border border-[#303036] text-[#B9B8C0] transition hover:border-[#FF6B6B] hover:text-[#FF9A9A]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="rounded-[8px] border border-[#222226] bg-[#101012] p-4 text-[13px] text-[#8E8D96]">
                {activeListItems.length === 0
                  ? `${activeListLabel} 항목이 없습니다.`
                  : "비밀번호 확인 후 목록이 표시됩니다."}
              </p>
            )}
          </div>
        </div>
      </aside>

      <div className="space-y-12">
        <form onSubmit={saveWork} className="space-y-7" hidden={isPplTab}>
          <div className="flex items-start justify-between gap-4 border-b border-[#222226] pb-5">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#8D4CFF]">
                Admin
              </p>
              <h1 className="mt-2 text-[28px] font-bold leading-tight md:text-[42px]">
                Works 관리
              </h1>
            </div>
            {isEditMode ? (
              <span className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#8D4CFF]/50 px-3 text-[12px] font-bold text-[#C9B3FF]">
                <Pencil size={14} />
                수정 모드
              </span>
            ) : null}
          </div>

          {tabButtons}

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
              onClick={() => loadOptions()}
              className="mt-auto inline-flex h-[46px] items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-[14px] font-bold text-[#060607] transition hover:bg-[#D7D7DC]"
            >
              <Check size={16} />
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                Type
              </span>
              <input
                list="work-type-options"
                value={typeLabel}
                onChange={(event) => setTypeLabel(event.target.value)}
                placeholder="MAKING FILM"
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] uppercase outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF]"
              />
              <datalist id="work-type-options">
                {options.types.map((type) => (
                  <option key={type.id} value={type.label} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                카테고리
              </span>
              <input
                list="work-category-options"
                value={metadata?.channelName ?? ""}
                onChange={(event) => setCategoryLabel(event.target.value)}
                disabled
                placeholder="채널명 자동 입력"
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#8D4CFF] disabled:text-[#5B5A62]"
              />
              <datalist id="work-category-options">
                {categoriesByTab.map((category) => (
                  <option key={category.id} value={category.label} />
                ))}
              </datalist>
            </label>
          </div>

          {options.types.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {options.types.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTypeLabel(type.label)}
                  className="rounded-full border border-[#2F2F35] px-3 py-2 text-[12px] font-bold text-[#A7A6AE] transition hover:border-[#8D4CFF] hover:text-white"
                >
                  {type.label}
                </button>
              ))}
            </div>
          ) : null}

          <label className="block">
            <span className="flex items-center justify-between text-[13px] font-semibold text-[#9A99A2]">
              Description
              <span className="text-[12px] text-[#5B5A62]">
                {description.length}/{descriptionLimit}
              </span>
            </span>
            <input
              value={description}
              onChange={(event) =>
                setDescription(event.target.value.slice(0, descriptionLimit))
              }
              placeholder="한 줄로 짧게 입력"
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
              {isEditMode ? "수정 저장" : "저장"}
            </button>
            {isEditMode ? (
              <button
                type="button"
                onClick={resetWorkForm}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] px-5 text-[14px] font-bold text-[#C7C6CC] transition hover:border-[#8D4CFF] hover:text-white"
              >
                <X size={16} />
                취소
              </button>
            ) : null}
            {isEditMode ? (
              <button
                type="button"
                onClick={() => {
                  const work = options.works.find((item) => item.id === editingWorkId);
                  if (work) {
                    void deleteWork(work);
                  }
                }}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] border border-[#3A2A2A] px-5 text-[14px] font-bold text-[#FF9A9A] transition hover:border-[#FF6B6B] hover:text-white"
              >
                <Trash2 size={16} />
                삭제
              </button>
            ) : null}
            {status ? (
              <p className="text-[13px] font-semibold text-[#9A99A2]">
                {status}
              </p>
            ) : null}
          </div>
        </form>

        <form
          onSubmit={savePpl}
          className="space-y-5 border-t border-[#222226] pt-8"
          hidden={!isPplTab}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[2px] text-[#FF9D71]">
                PPL
              </p>
              <h2 className="mt-2 text-[24px] font-bold">PPL 파트너 관리</h2>
            </div>
            {isPplEditMode ? (
              <span className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#FF9D71]/50 px-3 text-[12px] font-bold text-[#FFD0BE]">
                <Pencil size={14} />
                수정 모드
              </span>
            ) : null}
          </div>

          {tabButtons}

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                사이트 링크
              </span>
              <input
                type="url"
                value={pplWebsiteUrl}
                onChange={(event) => setPplWebsiteUrl(event.target.value)}
                placeholder="https://brand.com"
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#FF9D71]"
              />
            </label>
            <button
              type="button"
              onClick={loadPplMetadata}
              disabled={isLoadingPplMetadata}
              className="mt-auto inline-flex h-[46px] items-center justify-center gap-2 rounded-[8px] border border-[#3A3A40] px-5 text-[14px] font-bold text-white transition hover:border-[#FF9D71] disabled:opacity-50"
            >
              {isLoadingPplMetadata ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Eye size={16} />
              )}
              로고 찾기
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                이름
              </span>
              <input
                value={pplName}
                onChange={(event) => setPplName(event.target.value)}
                placeholder="Brand name"
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#FF9D71]"
              />
            </label>

            <label className="block">
              <span className="text-[13px] font-semibold text-[#9A99A2]">
                로고 이미지 URL
              </span>
              <input
                type="url"
                value={pplLogoUrl}
                onChange={(event) => setPplLogoUrl(event.target.value)}
                placeholder="자동으로 못 가져오면 직접 입력"
                className="mt-2 h-[46px] w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 text-[14px] outline-none transition placeholder:text-[#4B4A52] focus:border-[#FF9D71]"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-[13px] font-semibold text-[#9A99A2]">
              로고 이미지 첨부
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                void uploadPplLogo(event.currentTarget.files?.[0] ?? null)
              }
              disabled={isUploadingLogo}
              className="mt-2 block w-full rounded-[8px] border border-[#2A2A2E] bg-[#101012] px-4 py-3 text-[13px] text-[#C7C6CC] file:mr-4 file:rounded-[6px] file:border-0 file:bg-[#FF9D71] file:px-4 file:py-2 file:text-[12px] file:font-bold file:text-[#060607] disabled:opacity-50"
            />
          </label>

          <label className="flex h-[42px] w-fit items-center gap-3 rounded-[8px] border border-[#2A2A2E] px-4 text-[13px] font-semibold text-[#C7C6CC]">
            <input
              type="checkbox"
              checked={isPplPublished}
              onChange={(event) => setIsPplPublished(event.target.checked)}
              className="size-4 accent-[#FF9D71]"
            />
            공개
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={isSavingPpl}
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] bg-[#FF9D71] px-7 text-[15px] font-bold text-[#060607] transition hover:bg-[#F58C5C] disabled:opacity-50"
            >
              {isSavingPpl ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isPplEditMode ? "PPL 수정 저장" : "PPL 저장"}
            </button>
            {isPplEditMode ? (
              <button
                type="button"
                onClick={resetPplForm}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] border border-[#2A2A2E] px-5 text-[14px] font-bold text-[#C7C6CC] transition hover:border-[#FF9D71] hover:text-white"
              >
                <X size={16} />
                취소
              </button>
            ) : null}
            {isPplEditMode ? (
              <button
                type="button"
                onClick={() => {
                  const partner = pplPartners.find((item) => item.id === editingPplId);
                  if (partner) {
                    void deletePpl(partner);
                  }
                }}
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[8px] border border-[#3A2A2A] px-5 text-[14px] font-bold text-[#FF9A9A] transition hover:border-[#FF6B6B] hover:text-white"
              >
                <Trash2 size={16} />
                삭제
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[120px] xl:h-fit">
        {!isPplTab ? (
          <div className="overflow-hidden rounded-[8px] border border-[#222226] bg-[#101012]">
            <div
              className="aspect-video bg-cover bg-center"
              style={{
                backgroundImage: metadata?.thumbnailUrl
                  ? `url(${metadata.thumbnailUrl})`
                  : "linear-gradient(116deg,#202026 0%,#151519 42%,#060607 72%,#020203 100%)",
              }}
            />
            <div className="space-y-4 p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#8D4CFF]">
                  Works Preview
                </p>
                <h2 className="mt-2 text-[18px] font-bold leading-snug">
                  {metadata?.title ?? "영상 제목"}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: metadata?.channelProfileImageUrl
                      ? `url(${metadata.channelProfileImageUrl})`
                      : "linear-gradient(135deg,#8D4CFF,#FF9D71)",
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold">
                    {metadata?.channelName || "채널명"}
                  </p>
                  <p className="mt-1 text-[12px] text-[#6E6C76]">
                    {metadata?.source ?? "youtube"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[8px] border border-[#222226] bg-[#101012] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#FF9D71]">
              PPL Preview
            </p>
            <div className="mt-4 flex h-[82px] items-center justify-center rounded-[8px] bg-[#17171A] px-5">
              {pplLogoUrl || pplMetadata?.logoUrl ? (
                <span
                  aria-hidden="true"
                  className="block h-[58%] w-full bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${pplLogoUrl || pplMetadata?.logoUrl})`,
                  }}
                />
              ) : (
                <span className="truncate text-[13px] font-bold text-[#A7A6AE]">
                  {pplName || "PPL 로고"}
                </span>
              )}
            </div>
          </div>
        )}

        <a
          href="/work"
          className="inline-flex h-[42px] items-center gap-2 rounded-[8px] border border-[#2A2A2E] px-4 text-[13px] font-bold text-[#C7C6CC] transition hover:border-[#8D4CFF] hover:text-white"
        >
          <Plus size={15} />
          Works 보기
        </a>
      </aside>
    </section>
  );
}
