import type { ArtistProfile, ArtistTab } from "./Artist";

const sampleCareers = [
  "하루 끝의 나 - Making Film",
  "정규 앨범 발매 - OO편",
  "콘텐츠 투어 - OO",
];

function makeArtists(role: ArtistTab, name: string, education: string) {
  return Array.from({ length: 8 }, (_, index): ArtistProfile => ({
    id: `${role.toLowerCase()}-${index + 1}`,
    name,
    role,
    birthDate: "1998.07.22",
    height: "170cm",
    education,
    youtubeUrl: "https://www.youtube.com/",
    careers: sampleCareers,
    isFeatured: index === 3,
  }));
}

export const fallbackArtistsData: Record<ArtistTab, ArtistProfile[]> = {
  CREATOR: makeArtists("CREATOR", "크리에이터 이름", "OO대학교 영상학과"),
  SINGER: makeArtists("SINGER", "가수 이름", "OO대학교 음악학과"),
  ACTOR: makeArtists("ACTOR", "배우 이름", "OO대학교 연극영화학과"),
};
