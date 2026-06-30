import { getContactData, type ContactInquiryType } from "../../_lib/contact";
import { FooterContent, type FooterContactLink } from "./FooterContent";

const footerLinkSections: Array<{
  name: string;
  inquiryType: ContactInquiryType;
}> = [
  { name: "콘텐츠 제작", inquiryType: "content_production" },
  { name: "광고 · PPL", inquiryType: "advertising_ppl" },
  { name: "섭외", inquiryType: "casting" },
];

export const Footer = async () => {
  const contactData = await getContactData();
  const footerLinks: FooterContactLink[] = footerLinkSections.map((link) => {
    const firstEmail = contactData.find(
      (section) => section.inquiryType === link.inquiryType,
    )?.emails[0]?.email;

    return { ...link, email: firstEmail };
  });

  return <FooterContent footerLinks={footerLinks} />;
};
