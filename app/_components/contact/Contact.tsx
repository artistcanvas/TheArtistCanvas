import type { ContactSection } from "../../_lib/contact";
import { fallbackContactData } from "../../_lib/contact";
import SectionHeading from "../layout/SectionHeading";
import TacTextWobble from "./TacTextWobble";

export default function Contact({
  contactData = fallbackContactData,
}: {
  contactData?: ContactSection[];
}) {
  return (
    <div className="relative mx-auto w-full max-w-[1920px] px-5 md:px-[clamp(20px,calc((170/1920)*100vw),170px)]">
      <SectionHeading title="CONTACT" />

      <div className="relative z-10 grid grid-cols-1 gap-y-[34px] pt-[clamp(0px,calc((104/1920)*100vw),104px)] sm:grid-cols-2 sm:gap-x-[48px] md:grid-cols-4 md:gap-x-[clamp(44px,calc((265/1920)*100vw),265px)]">
        {contactData.map((item) => (
          <div key={item.inquiryType} className="min-w-0">
            <h2 className="text-nowrap text-[14px] font-semibold leading-[1.35] md:text-[clamp(14px,calc((20/1920)*100vw),20px)]">
              {item.title}
              {item.detail ? (
                <span className="block text-[12px] font-light text-[#77767E] md:text-[clamp(11px,calc((14/1920)*100vw),14px)]">
                  {item.detail}
                </span>
              ) : null}
            </h2>

            <div className="mt-[12px] space-y-1">
              {item.emails.length > 0 ? (
                item.emails.map((email) => (
                  <a
                    key={email.id ?? `${item.inquiryType}-${email.email}`}
                    href={`mailto:${email.email}`}
                    className="block text-nowrap text-[12px] font-normal leading-[20px] text-[#5B5A62] transition hover:text-white md:text-[clamp(12px,calc((16/1920)*100vw),16px)] md:leading-[25px]"
                  >
                    {email.email}
                  </a>
                ))
              ) : (
                <p className="text-nowrap text-[12px] font-normal leading-[28px] text-[#5B5A62] md:text-[clamp(12px,calc((16/1920)*100vw),16px)] md:leading-[37px]">
                  이메일을 등록해 주세요
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none relative left-1/2 mt-[9px] w-[clamp(364px,calc((1882/1920)*100vw),1882px)] -translate-x-1/2 select-none md:mt-[clamp(9px,calc((140/1920)*100vw),140px)]">
        <TacTextWobble />
      </div>
    </div>
  );
}
