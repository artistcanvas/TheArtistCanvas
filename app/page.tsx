import { Hero } from "./_components/hero/Hero";
import HowToCardContainer from "./_components/hero/HowToCardContainer";
import LandingScrollController from "./_components/hero/LandingScrollController";
import { getHeroVideoCards } from "./_lib/heroVideoCards";

export default async function Home() {
  const heroVideoCards = await getHeroVideoCards();

  return (
    <LandingScrollController>
      <Hero />
      <HowToCardContainer cards={heroVideoCards} />
    </LandingScrollController>
  );
}
