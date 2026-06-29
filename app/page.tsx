import { Hero } from "./_components/hero/Hero";
import HowTo from "./_components/hero/HowTo";
import HowToCardContainer from "./_components/hero/HowToCardContainer";
import LandingScrollController from "./_components/hero/LandingScrollController";
import { getHeroVideoCards } from "./_lib/heroVideoCards";

export default async function Home() {
  const heroVideoCards = await getHeroVideoCards();

  return (
    <LandingScrollController>
      <Hero />
      <HowTo />
      <HowToCardContainer cards={heroVideoCards} />
    </LandingScrollController>
  );
}
