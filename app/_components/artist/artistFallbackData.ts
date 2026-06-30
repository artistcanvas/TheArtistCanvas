import type { ArtistProfile, ArtistRole, ArtistTab } from "./Artist";

const sampleCareers = [
  "Music video appearance",
  "Brand campaign collaboration",
  "Short-form content project",
];

function makeArtists(role: ArtistRole, name: string, education: string) {
  return Array.from({ length: 8 }, (_, index): ArtistProfile => ({
    id: `${role.toLowerCase()}-${index + 1}`,
    name: `${name} ${index + 1}`,
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
  WITH: [
    ...makeArtists("CREATOR", "Creator", "Media Contents"),
    ...makeArtists("SINGER", "Singer", "Music"),
    ...makeArtists("ACTOR", "Actor", "Film and Theater"),
  ],
  MCN: makeArtists("MCN", "MCN Artist", "Media Contents"),
};
