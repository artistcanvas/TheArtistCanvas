import Works from "../_components/works/Works";
import { getWorksData } from "../_lib/works";

export default async function WorkPage() {
  const worksData = await getWorksData();

  return (
    <div className="w-full pt-[clamp(129px,calc((217/1920)*100vw),217px)]">
      <Works worksData={worksData} />
    </div>
  );
}
