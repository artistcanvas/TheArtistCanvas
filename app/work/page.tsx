import Works from "../_components/works/Works";

export default function WorkPage() {
  return (
    <div className="w-full max-w-[1920px] pt-[217px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
      <Works />
    </div>
  );
}
