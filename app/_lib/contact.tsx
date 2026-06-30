import type { ReactNode } from "react";

export type ContactInquiryType =
  | "content_production"
  | "advertising_ppl"
  | "casting"
  | "general";

export type ContactEmail = {
  id?: string;
  inquiryType: ContactInquiryType;
  email: string;
  sortOrder?: number;
};

export type ContactSection = {
  inquiryType: ContactInquiryType;
  title: ReactNode;
  detail?: string;
  emails: ContactEmail[];
};

type SupabaseContactEmailRow = {
  id: string;
  inquiry_type: ContactInquiryType;
  email: string;
  sort_order: number;
};

export const contactSections: Array<Omit<ContactSection, "emails">> = [
  {
    inquiryType: "content_production",
    title: "콘텐츠 제작 문의",
  },
  {
    inquiryType: "advertising_ppl",
    title: "광고 제작 및 PPL 문의",
  },
  {
    inquiryType: "casting",
    title: (
      <>
        섭외 문의 <span className="font-extralight">(방송, 행사, 섭외 등)</span>
      </>
    ),
    // detail: "방송, 행사, 섭외 등",
  },
  {
    inquiryType: "general",
    title: "기타 문의",
  },
];

export const fallbackContactData: ContactSection[] = contactSections.map(
  (section) => ({
    ...section,
    emails: [],
  }),
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function mapRowsToContactData(rows: SupabaseContactEmailRow[]) {
  return contactSections.map((section) => ({
    ...section,
    emails: rows
      .filter((row) => row.inquiry_type === section.inquiryType)
      .map((row) => ({
        id: row.id,
        inquiryType: row.inquiry_type,
        email: row.email,
        sortOrder: row.sort_order,
      })),
  }));
}

export async function getContactData(): Promise<ContactSection[]> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return fallbackContactData;
  }

  const contactUrl = new URL("/rest/v1/contact_emails", supabaseUrl);
  contactUrl.searchParams.set("select", "id,inquiry_type,email,sort_order");
  contactUrl.searchParams.set("is_published", "eq.true");
  contactUrl.searchParams.set(
    "order",
    "inquiry_type.asc,sort_order.asc,created_at.asc",
  );

  const response = await fetch(contactUrl, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    next: { revalidate: 60 },
  }).catch(() => null);

  if (!response?.ok) {
    return fallbackContactData;
  }

  const rows = (await response.json()) as SupabaseContactEmailRow[];

  return mapRowsToContactData(rows);
}
