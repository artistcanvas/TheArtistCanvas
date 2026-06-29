import { Hero } from "./_components/hero/Hero";
import HowTo from "./_components/hero/HowTo";
import HowToCardContainer from "./_components/hero/HowToCardContainer";
import LandingScrollController from "./_components/hero/LandingScrollController";

export default function Home() {
  return (
    <LandingScrollController>
      <Hero />
      <HowTo />
      <HowToCardContainer />
    </LandingScrollController>
  );
}
