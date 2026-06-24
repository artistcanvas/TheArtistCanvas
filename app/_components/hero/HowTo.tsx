import { HowToCard } from "./HowToCard";

export const HowTo = () => {
  return (
    <div className="px-[170px]">
      <div className="flex flex-col justify-between gap-[150px]">
        <h1 className="text-[136px] font-black">HOW TO?</h1>
        <div className="w-full flex justify-end">
          <div className="relative">
            <span className="relative z-1 text-[80px] font-semibold">
              Where artists stay
              <br />
              Where their stories begin.
            </span>
            <span className="absolute -top-20 -left-20 font-arial text-[240.5px] leading-none font-black text-[#262626]">
              “
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="mt-[300px] w-[5px] h-[1441px] bg-white" />
        <div className="w-full flex justify-between items-end ml-[45px]">
          <div className="">
            <p>How We Create</p>
            <p className="text-[20px]">
              <span className="font-semibold">
                우리는 사람에게서 이야기를 찾습니다.
              </span>
              <br />
              아티스트가 가진 매력과 개성을 발견하고
              <br />그 사람만이 보여줄 수 있는 콘텐츠를 기획하고 제작합니다.
            </p>
          </div>
          <div className="flex flex-col gap-[7px]">
            <HowToCard />
            <HowToCard />
            <HowToCard />
          </div>
        </div>
      </div>
    </div>
  );
};
