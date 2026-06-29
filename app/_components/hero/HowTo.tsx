import AnimatedQuote from "./AnimatedQuote";

export default function HowTo() {
  return (
    <section
      id="how-to"
      className="relative flex min-h-svh scroll-mt-0 justify-center overflow-hidden pt-[clamp(120px,calc((180/1920)*100vw),180px)] min-[1921px]:min-h-[calc(100svh+((100vw-1920px)*0.32))] min-[1921px]:items-center min-[1921px]:pt-0"
    >
      <div className="mx-auto flex w-full max-w-[1920px] flex-col px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
        <h2 className="text-start text-[clamp(42px,calc((136/1920)*100vw),136px)] font-extrabold leading-none">
          HOW TO?
        </h2>

        <div className="mt-[clamp(137px,calc((240/1920)*100vw),240px)] flex justify-end pb-[clamp(92px,calc((150/1920)*100vw),150px)] md:pb-[clamp(100px,calc((170/1920)*100vw),170px)] min-[1921px]:pb-0">
          <AnimatedQuote />
        </div>
      </div>
    </section>
  );
}
