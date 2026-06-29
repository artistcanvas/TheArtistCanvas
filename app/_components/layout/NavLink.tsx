import Link from "next/link";

import type { NavLinkItem } from "./navLinks";

type NavLinkVariant = "desktop" | "mobile";

type NavLinkProps = {
  link: NavLinkItem;
  isActive: boolean;
  variant: NavLinkVariant;
  onNavigate?: () => void;
};

export const NavLink = ({
  link,
  isActive,
  variant,
  onNavigate,
}: NavLinkProps) => {
  const baseClassName =
    "relative inline-flex w-fit transition-colors duration-200 after:absolute after:h-[2px] after:bg-[#8B5CFF] after:transition-opacity after:duration-200";
  const activeClassName = isActive
    ? "text-white after:opacity-100"
    : "text-[#5B5A62] after:opacity-0";
  const variantClassName =
    variant === "desktop"
      ? "after:inset-x-0 after:bottom-[calc(((clamp(56px,calc((88/1920)*100vw),88px)-24px)/-2)-1px)]"
      : "ml-auto py-3 after:inset-x-0 after:bottom-[8px]";

  return (
    <Link
      href={link.href}
      aria-current={isActive ? "page" : undefined}
      className={`${baseClassName} ${activeClassName} ${variantClassName}`}
      onClick={onNavigate}
    >
      {link.name}
    </Link>
  );
};
