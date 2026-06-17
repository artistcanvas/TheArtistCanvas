const navLinks = [
  { name: "HOME", href: "/" },
  { name: "WORK", href: "/work" },
  { name: "ARTIST", href: "/artist" },
  { name: "CONTACT", href: "/contact" },
];

export const Nav = () => {
  return (
    <nav className="h-[104px] flex items-center mx-[20px] border-b border-[#333] ">
      <ul className="flex gap-[90px] text-[18px] font-light">
        {navLinks.map((link) => (
          <li key={link.name}>
            <a href={link.href}>{link.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
