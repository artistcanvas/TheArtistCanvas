import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "./_components/layout/Nav";
import "./globals.css";
import { Footer } from "./_components/layout/Footer";

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
  title: "The Artist Canvas",
  description: "The Artist Canvas",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://theartistcanvas.com"
  ),
  icons: {
    icon: "/tac-favicon.png",
    shortcut: "/tac-favicon.png",
    apple: "/tac-favicon.png",
  },
  openGraph: {
    title: "The Artist Canvas",
    description: "The Artist Canvas",
    images: [
      {
        url: "/tac-meta.png",
        alt: "The Artist Canvas",
      },
    ],
    siteName: "The Artist Canvas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Artist Canvas",
    description: "The Artist Canvas",
    images: [
      {
        url: "/tac-meta.png",
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
