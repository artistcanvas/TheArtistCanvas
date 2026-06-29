export type NavLinkItem = {
  name: string;
  href: string;
};

export const navLinks: NavLinkItem[] = [
  { name: "WORKS", href: "/work" },
  { name: "ARTIST", href: "/artist" },
  { name: "CONTACT", href: "/contact" },
];

export const isActiveNavPath = (pathname: string, href: string) => {
  return pathname === href || pathname.startsWith(`${href}/`);
};
