export type WorkTab = "Original" | "Brand & ppl" | "Project";
export type WorkViewTab = WorkTab | "PPL";

export type WorkCategory = {
  id: string;
  label: string;
  color?: string | null;
  profileImageUrl?: string | null;
};

export type Work = {
  id: string;
  title: string;
  type: string;
  description?: string | null;
  categoryId: string;
  youtubeUrl: string;
  thumbnailUrl?: string | null;
};

export type PplPartner = {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl?: string | null;
};

export type WorksData = Record<
  WorkTab,
  {
    categories: WorkCategory[];
    works: Work[];
  }
> & {
  pplPartners: PplPartner[];
};

export const workTabs: WorkViewTab[] = [
  "Original",
  "Brand & ppl",
  "Project",
  "PPL",
];

export const workDataTabs: WorkTab[] = ["Original", "Brand & ppl", "Project"];

export const projectWorkCategoryLabels = [
  "뮤직 비디오",
  "광고 영상",
  "기업 영상",
  "라이브 콘텐츠",
] as const;

export type ProjectWorkCategoryLabel =
  (typeof projectWorkCategoryLabels)[number];

export const workTabLabels: Record<WorkViewTab, string> = {
  Original: "자체 채널",
  "Brand & ppl": "브랜드 채널",
  Project: "프로젝트",
  PPL: "PPL",
};
