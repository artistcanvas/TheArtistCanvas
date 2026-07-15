import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "./_components/layout/Nav";
import "./globals.css";
import { Footer } from "./_components/layout/Footer";

const siteUrl = new URL("https://www.the-artistcanvas.com");
const metaImageUrl = new URL("/imgs/tac-meta.png?v=20260714", siteUrl);

export const pretendard = localFont({
  src: [
    {
      path: "../public/fonts/PretendardThin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardLight.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardMedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardSemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardBold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardExtraBold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/PretendardBlack.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

export const arial = localFont({
  src: [
    {
      path: "../public/fonts/Ariblk.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-arial",
  display: "swap",
});

export const metadata: Metadata = {
  title: "아티스트캔버스 | TAC",
  description:
    "아티스트캔버스(The Artist Canvas, TAC)는 아티스트와 콘텐츠를 연결하는 종합 콘텐츠 제작사입니다. 음악 콘텐츠, 유튜브 제작, 라이브 콘텐츠, 브랜드 IP 기획 및 제작을 전문으로 합니다.",
  keywords: [
    "아티스트캔버스",
    "theartistcanvas",
    "TAC",
    "artistcanvas",
    "오픈캔버스",
  ],
  metadataBase: siteUrl,
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "4uFDUJ2S37ZVQB9Kc3z2beBr4OaVwRwoGkxD0rAZacE",
    other: {
      "naver-site-verification": "9735c9eba4d67ba7f9406a1737ea696b78d2acdd",
    },
  },
  icons: {
    icon: "/tac-favicon.png",
    shortcut: "/tac-favicon.png",
    apple: "/tac-favicon.png",
  },
  openGraph: {
    title: "아티스트캔버스 | TAC",
    description:
      "아티스트캔버스(The Artist Canvas, TAC)는 아티스트와 콘텐츠를 연결하는 종합 콘텐츠 제작사입니다. 음악 콘텐츠, 유튜브 제작, 라이브 콘텐츠, 브랜드 IP 기획 및 제작을 전문으로 합니다.",
    url: "/",
    images: [
      {
        url: metaImageUrl,
        width: 1600,
        height: 800,
        alt: "The Artist Canvas",
      },
    ],
    siteName: "아티스트캔버스 | TAC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "아티스트캔버스 | TAC",
    description:
      "아티스트캔버스(The Artist Canvas, TAC)는 아티스트와 콘텐츠를 연결하는 종합 콘텐츠 제작사입니다. 음악 콘텐츠, 유튜브 제작, 라이브 콘텐츠, 브랜드 IP 기획 및 제작을 전문으로 합니다.",
    images: [
      {
        url: metaImageUrl,
        width: 1600,
        height: 800,
        alt: "The Artist Canvas",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${arial.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
