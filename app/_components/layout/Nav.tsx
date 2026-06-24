import Logo from "@/public/imgs/nav-logo.png";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { name: "WORKS", href: "/work" },
  { name: "ARTIST", href: "/artist" },
  { name: "CONTACT", href: "/contact" },
];

export const Nav = () => {
  return (
    <nav className="fixed inset-x-0 top-0 z-40 mx-[20px] pl-[70px] pr-[150px] h-[88px] flex items-center justify-between border-b border-[#181819] bg-[#060607]">
      <Link href={"/"} className="w-max h-max">
        <Image width={69} height={24} src={Logo} alt="logo image" />
      </Link>
      <ul className="flex gap-[43px] text-[#5B5A62] text-[16px] font-semibold">
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link href={link.href}>{link.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
