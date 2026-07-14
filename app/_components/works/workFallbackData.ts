import type { WorksData } from "./workTypes";

export const fallbackWorksData: WorksData = {
  Original: {
    categories: [
      {
        id: "channel-tac-original",
        label: "TAC Original",
        color: "#FF9D71",
        profileImageUrl: null,
      },
      {
        id: "channel-artist-canvas",
        label: "Artist Canvas",
        color: "#8D4CFF",
        profileImageUrl: null,
      },
    ],
    works: [
      {
        id: "original-1",
        title: "Original Film Title",
        type: "MAKING FILM",
        description: "채널의 결을 담은 짧은 오리지널 영상",
        categoryId: "channel-tac-original",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        id: "original-2",
        title: "Artist Behind",
        type: "BEHIND",
        description: "아티스트의 제작 과정을 담은 영상",
        categoryId: "channel-artist-canvas",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
  },
  "Brand & ppl": {
    categories: [
      { id: "brand", label: "Brand", color: "#FF9D71", profileImageUrl: null },
      { id: "ppl", label: "PPL", color: "#8D4CFF", profileImageUrl: null },
    ],
    works: [
      {
        id: "brand-1",
        title: "Brand Film Title",
        type: "BRAND FILM",
        description: "브랜드 무드를 담은 캠페인 영상",
        categoryId: "brand",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
  },
  Project: {
    categories: [
      {
        id: "music-video",
        label: "뮤직 비디오",
        color: "#FF9D71",
        profileImageUrl: null,
      },
      {
        id: "ad-video",
        label: "광고 영상",
        color: "#8D4CFF",
        profileImageUrl: null,
      },
      {
        id: "corporate-video",
        label: "기업 영상",
        color: "#3DA5FF",
        profileImageUrl: null,
      },
      {
        id: "live-content",
        label: "라이브 콘텐츠",
        color: "#45D483",
        profileImageUrl: null,
      },
    ],
    works: [
      {
        id: "project-1",
        title: "Project Film Title",
        type: "PROJECT FILM",
        description: "프로젝트 전체 흐름을 보여주는 영상",
        categoryId: "music-video",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
  },
  pplPartners: [
    {
      id: "ppl-1",
      name: "Partner",
      websiteUrl: "https://example.com",
      logoUrl: null,
    },
  ],
};
