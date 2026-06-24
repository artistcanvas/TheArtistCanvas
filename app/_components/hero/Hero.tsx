import Image from "next/image";
import MainLogo from "@/public/imgs/main-logo.png";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="w-full h-svh min-h-max flex items-center pl-[90px] pr-[200px]">
      <div className="flex justify-between items-end w-full">
        <Image width={922} height={356} src={MainLogo} alt="Main logo" />
        <div className="space-y-[60px]">
          <p className="text-[25px] text-[#9D9D9D]">
            아티스트가 머무는 곳
            <br />
            그들의 이야기가 시작되는 곳
          </p>
          <div className="w-max border-b border-[#5B5A62] pb-[10px]">
            <Link href="/work" className="text-[20px] font-semibold">
              WORKS 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
