"use client";

import Logo from "@/public/imgs/nav-logo.png";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { name: "WORKS", href: "/work" },
  { name: "ARTIST", href: "/artist" },
  { name: "CONTACT", href: "/contact" },
];

export const Nav = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#181819] bg-[#060607] md:mx-[20px]">
      <div className="flex h-[clamp(56px,calc((88/1920)*100vw),88px)] items-center justify-center px-[20px] md:pl-[70px] md:pr-[clamp(70px,calc((150/1920)*100vw),150px)]">
        <div className="flex w-full max-w-[1660px] items-center md:items-end justify-between">
          <Link
            href={"/"}
            className="h-max w-[56px] md:w-[clamp(56px,calc((69/1920)*100vw),69px)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image width={69} height={24} src={Logo} alt="logo image" />
          </Link>

          <ul className="hidden gap-[43px] text-[16px] font-semibold text-[#5B5A62] md:flex">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-end md:hidden"
            aria-label={
              isMobileMenuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-links"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <span className="inline-flex w-6 flex-col items-end justify-start gap-1">
              <span className="h-0.5 w-6 bg-white" />
              <span className="h-0.5 w-4 bg-white" />
              <span className="h-0.5 w-6 bg-white" />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav-links"
        className={`grid overflow-hidden bg-[#060607] transition-[grid-template-rows,opacity] duration-300 md:hidden ${
          isMobileMenuOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <ul className="min-h-0 px-[20px] text-right text-[22px] font-semibold text-white">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                className="block py-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
