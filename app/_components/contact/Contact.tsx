import SectionHeading from "../layout/SectionHeading";
import TacTextWobble from "./TacTextWobble";

const contactItems = [
  {
    title: "콘텐츠 제작 문의",
    description: "이메일 적어주세요",
  },
  {
    title: "광고 제작 및 PPL 문의",
    description: "이메일 적어주세요",
  },
  {
    title: (
      <>
        섭외 문의 <span className="font-light">(방송, 행사, 섭외 등)</span>
      </>
    ),
    description: "이메일 적어주세요",
  },
  {
    title: "기타 문의",
    description: "이메일 적어주세요",
  },
];

export default function Contact() {
  return (
    <div className="relative mx-auto w-full max-w-[1920px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
      <SectionHeading title="CONTACT" />

      <div className="relative z-10 grid grid-cols-1 gap-y-[34px] pt-[clamp(0px,calc((104/1920)*100vw),104px)] sm:grid-cols-2 sm:gap-x-[48px] md:grid-cols-4 md:gap-x-[clamp(44px,calc((265/1920)*100vw),265px)]">
        {contactItems.map((item, index) => (
          <div key={index} className="min-w-0">
            <h2 className="text-nowrap text-[14px] md:text-[clamp(14px,calc((20/1920)*100vw),20px)] font-semibold leading-[1.35]">
              {item.title}
            </h2>
            <p className="text-nowrap mt-[12px] text-[12px] md:text-[clamp(12px,calc((16/1920)*100vw),16px)] font-normal leading-[37px] text-[#5B5A62]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="pointer-events-none relative left-1/2 mt-[9px] w-[clamp(364px,calc((1882/1920)*100vw),1882px)] -translate-x-1/2 select-none md:mt-[clamp(9px,calc((140/1920)*100vw),140px)]">
        <TacTextWobble />
      </div>
    </div>
  );
}
