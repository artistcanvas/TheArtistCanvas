import Artist from "../_components/artist/Artist";
import { getArtistsData } from "../_lib/artists";

export default async function ArtistPage() {
  const artistsData = await getArtistsData();

  return (
    <div className="w-full pt-[clamp(129px,calc((217/1920)*100vw),217px)]">
      <Artist artistsData={artistsData} />
    </div>
  );
}
