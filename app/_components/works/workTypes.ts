export type WorkTab = "Original" | "Brand & ppl" | "Project";

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

export const workTabs: WorkTab[] = ["Original", "Brand & ppl", "Project"];
